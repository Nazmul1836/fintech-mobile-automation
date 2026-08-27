import LoginPage from '../../pageobjects/LoginPage.js';
import SendMoneyPage from '../../pageobjects/SendMoneyPage.js';
import testData from '../../utils/testData.js';
import Logger from '../../utils/logger.js';
import Helpers from '../../utils/helpers.js';

describe('Send Money Auto Pay Automation Suite - Mukto Pay UAT', () => {

    const targetPhone = '01722361016';
    const autoPayAmount = '200';

    before(async () => {
        Logger.info('Performing clean app restart for Auto Pay test suite...');
        const appPkg = process.env.APP_PACKAGE || 'com.fintech23.muktopay.uat';
        try {
            await driver.terminateApp(appPkg);
            await driver.pause(1000);
        } catch (e) { }
        try {
            await driver.activateApp(appPkg);
            await driver.pause(3000);
        } catch (e) { }

        // Ensure user is logged in
        if (await LoginPage.isDisplayed()) {
            Logger.info('Logging in primary user for Auto Pay suite...');
            await LoginPage.login(testData.user.phone, testData.user.pin, testData.user.otp);
            await driver.pause(2000);
        }
    });

    beforeEach(async () => {
        const appPkg = process.env.APP_PACKAGE || 'com.fintech23.muktopay.uat';
        try {
            await driver.activateApp(appPkg);
            await driver.pause(1500);
        } catch (e) { }

        if (await LoginPage.isDisplayed()) {
            Logger.info('Session logged out, re-authenticating primary user...');
            await LoginPage.login(testData.user.phone, testData.user.pin, testData.user.otp);
            await driver.pause(2000);
        }
    });

    it('TC 46-48: should enable new Auto Pay for 01722361016 with amount 200 Tk', async () => {
        Logger.info(`Navigating to Send Money screen to create new Auto Pay for ${targetPhone}...`);
        await SendMoneyPage.navigateToSendMoney();
        await driver.pause(1500);

        Logger.info('Opening Auto Pay tab...');
        const autoPayTab = await SendMoneyPage.getAutoPayAction();
        expect(await autoPayTab.isDisplayed()).toBe(true);
        await autoPayTab.click();
        await driver.pause(1500);

        Logger.info('Clicking Enable New Auto Pay button...');
        const enableBtn = await SendMoneyPage.getEnableNewAutoPayButton();
        expect(await enableBtn.isDisplayed()).toBe(true);
        await enableBtn.click();
        await driver.pause(1500);

        Logger.info('Selecting Send Money service...');
        const sendMoneyService = await SendMoneyPage.getAutoPayServiceSendMoney();
        expect(await sendMoneyService.isDisplayed()).toBe(true);
        await sendMoneyService.click();
        await driver.pause(1500);

        Logger.info(`Searching phone number ${targetPhone} in search field...`);
        const searchInput = await SendMoneyPage.getContactSearchInput();
        expect(await searchInput.isDisplayed()).toBe(true);
        await searchInput.click();
        await searchInput.setValue(targetPhone);
        await driver.pause(1500);

        Logger.info(`Clicking matching recipient contact item for ${targetPhone}...`);
        const recipientItem = await SendMoneyPage.findFirstElement([
            `//*[contains(@content-desc, "${targetPhone}")]`,
            `//*[contains(@text, "${targetPhone}")]`
        ], 5000);
        expect(await recipientItem.isDisplayed()).toBe(true);
        await recipientItem.click();
        await driver.pause(1500);

        Logger.info('Setting custom Recipient Name: Auto Pay Test...');
        const nameInput = await SendMoneyPage.findFirstElement([
            '//android.widget.EditText[1]',
            'android=new UiSelector().className("android.widget.EditText").instance(0)'
        ], 3000);
        if (await nameInput.isExisting() && await nameInput.isDisplayed()) {
            await nameInput.click();
            for (let i = 0; i < 20; i++) {
                try { await driver.pressKeyCode(67); } catch (e) { }
            }
            await nameInput.setValue('Auto Pay Test');
            await Helpers.hideKeyboard();
            await driver.pause(500);
        }

        Logger.info(`Entering Auto Pay amount ${autoPayAmount} Tk robustly...`);
        const amountInput = await SendMoneyPage.getAutoPayAmountInput();
        expect(await amountInput.isDisplayed()).toBe(true);
        try {
            const loc = await amountInput.getLocation();
            const sz = await amountInput.getSize();
            // Tap at 25% from the left edge to avoid clicking the (i) info icon on the right
            await driver.action('pointer', { parameters: { pointerType: 'touch' } })
                .move({ x: Math.round(loc.x + sz.width * 0.25), y: Math.round(loc.y + sz.height / 2) })
                .down({ button: 0 })
                .up({ button: 0 })
                .perform();
            await driver.pause(500);
        } catch (e) {
            await amountInput.click();
        }

        // Erase any existing digits
        for (let i = 0; i < 8; i++) {
            try { await driver.pressKeyCode(67); } catch (e) { }
        }

        // Type amount 200 using Android keycodes: '2' -> 9, '0' -> 7, '0' -> 7
        const digitKeyMap = { '0': 7, '1': 8, '2': 9, '3': 10, '4': 11, '5': 12, '6': 13, '7': 14, '8': 15, '9': 16 };
        for (const ch of autoPayAmount.toString()) {
            const code = digitKeyMap[ch];
            if (code) {
                try { await driver.pressKeyCode(code); } catch (e) { }
            }
        }
        await driver.pause(1000);

        // Dismiss keyboard and any popup modal
        await Helpers.hideKeyboard();
        await driver.pause(500);
        try {
            const infoModal = await $('//*[contains(@content-desc, "Important Information") or contains(@text, "Important Information")]');
            if (await infoModal.isExisting() && await infoModal.isDisplayed()) {
                Logger.info('Dismissing Important Information modal via back key...');
                await driver.back();
                await driver.pause(1000);
            }
        } catch (e) { }

        Logger.info('Selecting frequency option (Every 30 Days)...');
        const freqOption = await SendMoneyPage.findFirstElement([
            '//*[contains(@content-desc, "Every 30 Days")]',
            '//android.widget.RadioButton[contains(@content-desc, "Every 30 Days")]',
            'android=new UiSelector().descriptionContains("Every 30 Days")',
            '~Every 30 Days'
        ], 5000);
        expect(await freqOption.isDisplayed()).toBe(true);
        await freqOption.click();
        await driver.pause(1500);

        const continueBtn = await SendMoneyPage.getContinueButton();
        expect(await continueBtn.isDisplayed()).toBe(true);
        Logger.info('Business Logic Assertion - Continue button is active & displayed');

        Logger.info('Clicking Continue button on Auto Pay form...');
        await continueBtn.click();
        await driver.pause(2500);

        const confirmPinBtn = await SendMoneyPage.findFirstElement([
            '//android.widget.Button[@content-desc="Confirm PIN" or @content-desc="CONFIRM PIN" or @text="Confirm PIN"]',
            '~Confirm PIN',
            '//android.widget.Button[contains(@content-desc, "Confirm PIN")]'
        ], 5000);
        expect(await confirmPinBtn.isDisplayed()).toBe(true);
        const initialPinBtnState = await confirmPinBtn.isEnabled();
        Logger.info(`Business Logic Assertion - Confirm PIN button initial enabled state: ${initialPinBtnState}`);
        expect(initialPinBtnState).toBe(false);

        Logger.info(`Entering PIN ${testData.user.pin} into core.pin_field...`);
        await SendMoneyPage.enterFavoritePin(testData.user.pin);
        await driver.pause(1000);

        const afterPinState = await confirmPinBtn.isEnabled();
        Logger.info(`Business Logic Assertion - Confirm PIN button enabled state after PIN: ${afterPinState}`);
        expect(afterPinState).toBe(true);

        Logger.info('Clicking Confirm PIN button to proceed to review screen...');
        await SendMoneyPage.clickConfirmPin();
        await driver.pause(2500);

        Logger.info('Performing Hold to Pay (tap and hold) gesture to finalize Auto Pay...');
        await SendMoneyPage.tapAndHoldToPay(3500);
        await driver.pause(3000);

        Logger.info('Clicking Back to Home button on Success screen...');
        const homeBtn = await SendMoneyPage.getBackToHomeButton();
        if (await homeBtn.isExisting() && await homeBtn.isDisplayed()) {
            await homeBtn.click();
            await driver.pause(2000);
        } else {
            await SendMoneyPage.navigateToSendMoney();
        }
    });

    it('TC 49-51: should delete created Auto Pay for Auto Pay Test (01722361016)', async () => {
        const recipientName = 'Auto Pay Test';
        Logger.info(`Navigating to Send Money screen to delete Auto Pay for ${recipientName} (${targetPhone})...`);
        await SendMoneyPage.navigateToSendMoney();
        await driver.pause(1500);

        Logger.info('Opening Auto Pay list screen...');
        const autoPayTab = await SendMoneyPage.getAutoPayAction();
        expect(await autoPayTab.isDisplayed()).toBe(true);
        await autoPayTab.click();
        await driver.pause(2000);

        // Verify on Auto Pay list screen
        const enableBtn = await SendMoneyPage.getEnableNewAutoPayButton();
        expect(await enableBtn.isDisplayed()).toBe(true);
        Logger.info('Business Logic Assertion - Auto Pay list screen opened successfully');

        Logger.info(`Searching for recipient name '${recipientName}' in Auto Pay search bar...`);
        const searchBar = await SendMoneyPage.findFirstElement([
            '//android.widget.EditText[contains(@text, "Name or Number") or contains(@hint, "Name or Number")]',
            '//android.widget.EditText[1]',
            '//*[@resource-id="core.search_field"]'
        ], 5000);
        expect(await searchBar.isDisplayed()).toBe(true);
        await searchBar.click();
        await searchBar.setValue(recipientName);
        await driver.pause(1000);

        // Dismiss keyboard reliably using multiple methods
        Logger.info('Dismissing keyboard...');
        try { await driver.executeScript('mobile: hideKeyboard', []); } catch (e) { }
        try { await driver.hideKeyboard(); } catch (e) { }
        // Use ADB keyevent ESCAPE (111) as final fallback
        try { await driver.executeScript('mobile: shell', [{ command: 'input', args: ['keyevent', '111'] }]); } catch (e) { }
        await driver.pause(1500);

        Logger.info(`Verifying search result assertion for '${recipientName}'...`);
        const searchResultItem = await SendMoneyPage.findFirstElement([
            `//android.view.View[contains(@content-desc, "${recipientName}")]`,
            `//*[contains(@content-desc, "${recipientName}")]`,
            `//*[contains(@text, "${recipientName}")]`
        ], 5000);
        expect(await searchResultItem.isDisplayed()).toBe(true);
        Logger.info(`Business Logic Assertion - Search result item for '${recipientName}' is displayed`);

        Logger.info(`Clicking delete (trash) icon for '${recipientName}' using element selector...`);
        // Use the exact selectors the user provided for the trash icon
        const deleteIcon = await $('android=new UiSelector().className("android.widget.ImageView").instance(3)');
        if (!(await deleteIcon.isExisting())) {
            Logger.info('instance(3) not found, trying instance(2)...');
            const deleteIcon2 = await $('android=new UiSelector().className("android.widget.ImageView").instance(2)');
            await deleteIcon2.click();
        } else {
            await deleteIcon.click();
        }
        await driver.pause(3000);

        // Take a debug screenshot to see what's on screen after trash icon click
        try {
            const ss = await driver.takeScreenshot();
            const fs = await import('fs');
            fs.writeFileSync('./screenshots/DEBUG_after_trash_click.png', Buffer.from(ss, 'base64'));
            Logger.info('DEBUG screenshot saved after trash icon click');
        } catch (e) { }

        const yesBtn = await SendMoneyPage.findFirstElement([
            '//android.widget.Button[@content-desc="Yes" or @content-desc="YES" or @text="Yes"]',
            '//android.view.View[@content-desc="Yes" or @content-desc="YES"]',
            '//*[contains(@content-desc, "Yes") or contains(@text, "Yes")]',
            '//*[contains(@content-desc, "Delete") or contains(@text, "Delete")]',
            '//android.widget.Button[contains(@content-desc, "Yes") or contains(@content-desc, "Confirm")]',
            '~Yes',
            'android=new UiSelector().descriptionContains("Yes")',
            'android=new UiSelector().textContains("Yes")'
        ], 5000);
        expect(await yesBtn.isDisplayed()).toBe(true);
        Logger.info('Business Logic Assertion - Deletion confirmation dialog with "Yes" button is displayed');

        Logger.info('Clicking "Yes" button on deletion confirmation dialog...');
        await yesBtn.click();
        await driver.pause(1500);

        const confirmPinBtn = await SendMoneyPage.findFirstElement([
            '//android.widget.Button[@content-desc="Confirm PIN" or @content-desc="CONFIRM PIN" or @text="Confirm PIN"]',
            '~Confirm PIN',
            '//android.widget.Button[contains(@content-desc, "Confirm PIN")]'
        ], 5000);
        expect(await confirmPinBtn.isDisplayed()).toBe(true);
        const initialPinState = await confirmPinBtn.isEnabled();
        Logger.info(`Business Logic Assertion - Confirm PIN button enabled state before deletion PIN: ${initialPinState}`);
        expect(initialPinState).toBe(false);

        Logger.info(`Entering PIN ${testData.user.pin} to confirm Auto Pay removal...`);
        const pinInput = await SendMoneyPage.findFirstElement([
            '//android.widget.EditText',
            '//*[@resource-id="field_core.pin_field"]',
            '//*[@resource-id="core.pin_field"]'
        ], 3000);
        if (await pinInput.isExisting() && await pinInput.isDisplayed()) {
            await pinInput.click();
            await driver.pause(300);
            const digitKeyMap = { '0': 7, '1': 8, '2': 9, '3': 10, '4': 11, '5': 12, '6': 13, '7': 14, '8': 15, '9': 16 };
            for (const ch of testData.user.pin.toString()) {
                const code = digitKeyMap[ch];
                if (code) {
                    try { await driver.pressKeyCode(code); } catch (e) { }
                }
            }
            await Helpers.hideKeyboard();
            await driver.pause(1000);
        }

        const afterPinState = await confirmPinBtn.isEnabled();
        Logger.info(`Business Logic Assertion - Confirm PIN button enabled state after deletion PIN: ${afterPinState}`);
        expect(afterPinState).toBe(true);

        await SendMoneyPage.clickConfirmPin();
        await driver.pause(2500);
    });
});
