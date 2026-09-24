import MobileRechargePage from '../../pageobjects/MobileRechargePage.js';
import LoginPage from '../../pageobjects/LoginPage.js';
import Logger from '../../utils/logger.js';
import Helpers from '../../utils/helpers.js';
import testData from '../../utils/testData.js';

describe('Mobile Recharge Automation Suite - Mukto Pay UAT', () => {
    before(async () => {
        Logger.info('====================================================');
        Logger.info('   STARTING MOBILE RECHARGE E2E AUTOMATION SUITE   ');
        Logger.info('====================================================');

        const appPkg = process.env.APP_PACKAGE || 'com.fintech23.muktopay.uat';
        try {
            await driver.terminateApp(appPkg);
            await driver.pause(1000);
        } catch (e) { }
        try {
            await driver.activateApp(appPkg);
            await driver.pause(3000);
        } catch (e) { }

        if (await LoginPage.isDisplayed()) {
            Logger.info('Logging in primary user for Mobile Recharge suite...');
            await LoginPage.login(testData.user.phone, testData.user.pin, testData.user.otp);
            await driver.pause(2000);
        }
    });

    beforeEach(async () => {
        if (await LoginPage.isDisplayed()) {
            Logger.info('Login screen detected: Re-authenticating user...');
            await LoginPage.login(testData.user.phone, testData.user.pin, testData.user.otp);
            await driver.pause(2000);
        }
    });

    afterEach(async () => {
        await driver.pause(1500);
        await Helpers.hideKeyboard();
    });

    it('TC 52: should reject recharge amount less than 20 Taka (10 Taka) and enable Proceed for valid minimum amount (20 Taka)', async () => {
        const testPhone = Helpers.generateRandomBDPhoneNumber('018');
        Logger.info(`Starting TC 52: Minimum Recharge Amount Boundary Validation (< 20 Tk limit) on generated number ${testPhone}...`);
        await MobileRechargePage.navigateToMobileRecharge();

        const phoneInput = await MobileRechargePage.getPhoneInput();
        expect(await phoneInput.isDisplayed()).toBe(true);
        await phoneInput.click();
        await phoneInput.setValue(testPhone);
        await Helpers.hideKeyboard();

        // Click Continue button after entering phone number
        Logger.info('Clicking Continue button after entering phone number...');
        const continueBtn = await MobileRechargePage.getContinueButton();
        if (await continueBtn.isExisting() && await continueBtn.isDisplayed()) {
            await continueBtn.click();
            await driver.pause(1500);
        } else {
            await MobileRechargePage.selectSuggestedNumber(testPhone);
        }

        // Select Operator (Robi) if displayed
        const operatorRobi = await MobileRechargePage.getOperatorTile('Robi');
        if (await operatorRobi.isExisting() && await operatorRobi.isDisplayed()) {
            Logger.info('Selecting Operator Robi...');
            await operatorRobi.click();
            await driver.pause(1500);
        }

        // Boundary Check 1: Enter 10 Taka (< 20 Taka limit)
        Logger.info('Boundary Check 1: Entering 10 Taka (< 20 Taka minimum limit)...');
        const amountInput = await MobileRechargePage.getAmountInput();
        await amountInput.click();
        await amountInput.setValue('10');
        await Helpers.hideKeyboard();
        await driver.pause(1000);

        const proceedBtn = await MobileRechargePage.getProceedButton();
        const isProceedDisabled = !(await proceedBtn.isEnabled());
        Logger.info(`Business Logic Assertion - Proceed button disabled for 10 Taka (< 20 Tk limit): ${isProceedDisabled}`);
        expect(isProceedDisabled).toBe(true);

        // Boundary Check 2: Enter 20 Taka (Valid minimum amount)
        Logger.info('Boundary Check 2: Entering 20 Taka (Valid minimum amount)...');
        await amountInput.click();
        try { await amountInput.clear(); } catch (e) { }
        if (typeof driver !== 'undefined' && driver.pressKeyCode) {
            for (let i = 0; i < 10; i++) {
                try { await driver.pressKeyCode(67); } catch (e) { }
            }
        }
        await amountInput.setValue('20');
        await Helpers.hideKeyboard();
        await driver.pause(1500);

        const isProceedEnabled = await proceedBtn.isEnabled();
        Logger.info(`Business Logic Assertion - Proceed button enabled for 20 Taka: ${isProceedEnabled}`);
        expect(isProceedEnabled).toBe(true);

        // Complete Recharge E2E
        await proceedBtn.click();
        await driver.pause(2000);

        await MobileRechargePage.enterPin('12121');
        await Helpers.hideKeyboard();
        await driver.pause(1000);
        const confirmPinBtn = await MobileRechargePage.getConfirmPinButton();
        await confirmPinBtn.click();
        await driver.pause(3000);

        await MobileRechargePage.performHoldToPay();
        await driver.pause(2500);

        // Return Home
        const homeBtn = await MobileRechargePage.getHomeButton();
        if (await homeBtn.isExisting() && await homeBtn.isDisplayed()) {
            await homeBtn.click();
            await driver.pause(2000);
        }
    });

    it('TC 53: should execute Mobile Recharge to a NEW phone number with mandatory operator selection', async () => {
        const newPhone = Helpers.generateRandomBDPhoneNumber('018');
        Logger.info(`Starting TC 53: Mobile Recharge to NEW Number (${newPhone}) with mandatory operator selection...`);

        await MobileRechargePage.navigateToMobileRecharge();

        const phoneInput = await MobileRechargePage.getPhoneInput();
        expect(await phoneInput.isDisplayed()).toBe(true);
        await phoneInput.click();
        await phoneInput.setValue(newPhone);
        await Helpers.hideKeyboard();

        // Click Continue button after entering phone number
        Logger.info('Clicking Continue button after entering phone number...');
        const continueBtn = await MobileRechargePage.getContinueButton();
        if (await continueBtn.isExisting() && await continueBtn.isDisplayed()) {
            await continueBtn.click();
            await driver.pause(1500);
        } else {
            await MobileRechargePage.selectSuggestedNumber(newPhone);
        }

        // Mandatory Operator Selection for NEW number
        Logger.info('Selecting Operator Robi for NEW number...');
        const operatorRobi = await MobileRechargePage.getOperatorTile('Robi');
        if (await operatorRobi.isExisting() && await operatorRobi.isDisplayed()) {
            await operatorRobi.click();
            await driver.pause(1500);
        }

        // Enter Amount 20 Taka
        const amountInput = await MobileRechargePage.getAmountInput();
        await amountInput.click();
        await amountInput.setValue('20');
        await Helpers.hideKeyboard();
        await driver.pause(1500);

        const proceedBtn = await MobileRechargePage.getProceedButton();
        await proceedBtn.click();
        await driver.pause(2000);

        await MobileRechargePage.enterPin('12121');
        await Helpers.hideKeyboard();
        await driver.pause(1000);
        const confirmPinBtn = await MobileRechargePage.getConfirmPinButton();
        await confirmPinBtn.click();
        await driver.pause(3000);

        await MobileRechargePage.performHoldToPay();
        await driver.pause(2500);

        // Return Home
        const homeBtn = await MobileRechargePage.getHomeButton();
        if (await homeBtn.isExisting() && await homeBtn.isDisplayed()) {
            await homeBtn.click();
            await driver.pause(2000);
        }
    });

    it('TC 54: should execute Mobile Recharge to a RECENT / saved contact (Ammu) with operator selection skipped', async () => {
        const contactQuery = 'Ammu';
        Logger.info(`Starting TC 54: Mobile Recharge to RECENT contact '${contactQuery}' (Operator selection skipped)...`);

        await MobileRechargePage.navigateToMobileRecharge();

        const phoneInput = await MobileRechargePage.getPhoneInput();
        expect(await phoneInput.isDisplayed()).toBe(true);
        await phoneInput.click();
        await phoneInput.setValue(contactQuery);
        await Helpers.hideKeyboard();
        await driver.pause(1500);

        // Select Recent Contact Item (recorded step el12: A\nAmmu\n01712188953)
        Logger.info(`Selecting Recent Contact card for '${contactQuery}'...`);
        await MobileRechargePage.selectRecentContact(contactQuery);

        // Enter Amount 30 Taka
        const amountInput = await MobileRechargePage.getAmountInput();
        await amountInput.click();
        await amountInput.setValue('30');
        await Helpers.hideKeyboard();
        await driver.pause(1500);

        const proceedBtn = await MobileRechargePage.getProceedButton();
        await proceedBtn.click();
        await driver.pause(2000);

        await MobileRechargePage.enterPin('12121');
        await Helpers.hideKeyboard();
        await driver.pause(1000);
        const confirmPinBtn = await MobileRechargePage.getConfirmPinButton();
        await confirmPinBtn.click();
        await driver.pause(3000);

        await MobileRechargePage.performHoldToPay();
        await driver.pause(2500);

        // Return Home
        const homeBtn = await MobileRechargePage.getHomeButton();
        if (await homeBtn.isExisting() && await homeBtn.isDisplayed()) {
            await homeBtn.click();
            await driver.pause(2000);
        }
    });
});
