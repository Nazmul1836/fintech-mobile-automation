import LoginPage from '../../pageobjects/LoginPage.js';
import RequestMoneyPage from '../../pageobjects/RequestMoneyPage.js';
import testData from '../../utils/testData.js';
import Logger from '../../utils/logger.js';
import Helpers from '../../utils/helpers.js';

describe('Request Money Automation Suite - Mukto Pay UAT', () => {

    const nonRegisteredPhone = '01764233618';
    const recipientPhone = '01329484257';
    const recipientName = 'Maria';

    before(async () => {
        Logger.info('Performing clean app restart for Request Money test suite...');
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
            Logger.info('Logging in primary user for Request Money suite...');
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

    it('TC 1: should navigate to Request Money screen from Home dashboard', async () => {
        Logger.info('Navigating to Request Money screen from dashboard tile dashboard.home.menu_tile.request_money...');
        await RequestMoneyPage.navigateToRequestMoney();
        await driver.pause(1500);

        const searchInput = await RequestMoneyPage.getSearchInput();
        const isSearchVisible = (await searchInput.isExisting()) && (await searchInput.isDisplayed());
        Logger.info(`Request Money recipient search field displayed: ${isSearchVisible}`);
        expect(isSearchVisible).toBe(true);
    });

    it('TC 2: should display error "The recipient is not registered." when searching non-registered number 01764233618', async () => {
        Logger.info(`Searching non-registered phone number ${nonRegisteredPhone}...`);
        const searchInput = await RequestMoneyPage.getSearchInput();
        if (await searchInput.isExisting() && await searchInput.isDisplayed()) {
            await searchInput.click();
            await searchInput.setValue(nonRegisteredPhone);
            await driver.pause(1500);

            const continueBtn = await RequestMoneyPage.getContinueButton();
            if (await continueBtn.isExisting() && await continueBtn.isDisplayed()) {
                await continueBtn.click();
                await driver.pause(2000);
            }

            const notRegError = await RequestMoneyPage.getNotRegisteredError();
            const isErrorDisplayed = (await notRegError.isExisting()) && (await notRegError.isDisplayed());
            Logger.info(`"The recipient is not registered." error displayed: ${isErrorDisplayed}`);
            expect(isErrorDisplayed).toBe(true);

            // Click Close button to dismiss error dialog
            const closeBtn = await RequestMoneyPage.getCloseButton();
            if (await closeBtn.isExisting() && await closeBtn.isDisplayed()) {
                await closeBtn.click();
                await driver.pause(1500);
            }
        }
    });

    it('TC 3: should search and select registered recipient Maria (01329484257)', async () => {
        Logger.info(`Searching for registered recipient ${recipientName} (${recipientPhone})...`);
        const searchInput = await RequestMoneyPage.getSearchInput();
        if (await searchInput.isExisting() && await searchInput.isDisplayed()) {
            await searchInput.click();
            if (typeof driver !== 'undefined' && driver.pressKeyCode) {
                for (let i = 0; i < 15; i++) {
                    try { await driver.pressKeyCode(67); } catch (e) { }
                }
            }
            await searchInput.setValue(recipientName);
            await driver.pause(1500);

            const recipientRow = await RequestMoneyPage.getRecipientRow(recipientPhone);
            const isRowVisible = (await recipientRow.isExisting()) && (await recipientRow.isDisplayed());
            Logger.info(`Recipient item row for ${recipientPhone} displayed: ${isRowVisible}`);
            expect(isRowVisible).toBe(true);

            await recipientRow.click();
            await driver.pause(2000);
        }
    });

    it('TC 4: should reject amount less than 10 Taka (minimum request amount validation)', async () => {
        Logger.info('Testing minimum request amount validation (< 10 Taka)...');
        await RequestMoneyPage.enterAmount(5);
        await driver.pause(1000);

        const isEnabled = await RequestMoneyPage.isSendRequestButtonEnabled();
        Logger.info(`Send Request button enabled status for 5 Taka: ${isEnabled}`);

        const minErr = await RequestMoneyPage.getMinAmountError();
        const isMinErrDisplayed = (await minErr.isExisting()) && (await minErr.isDisplayed());
        Logger.info(`Minimum amount error message displayed: ${isMinErrDisplayed}`);

        // Assertion: Send Request button MUST be disabled for < 10 Taka or error displayed
        expect(isEnabled === false || isMinErrDisplayed === true).toBe(true);
    });

    it('TC 5: should enable Send Request button for valid amount (20 Taka) and reference note', async () => {
        Logger.info('Entering valid request amount (20 Taka)...');
        await RequestMoneyPage.enterAmount(20);

        // Scroll down to reveal reference field
        try {
            await driver.action('pointer', { parameters: { pointerType: 'touch' } })
                .move({ x: 500, y: 1200 })
                .down({ button: 0 })
                .pause(500)
                .move({ x: 500, y: 600 })
                .up({ button: 0 })
                .perform();
            await driver.pause(500);
        } catch (e) { }

        Logger.info('Entering reference note "Test Request"...');
        await RequestMoneyPage.enterReference('Test Request');

        const isEnabled = await RequestMoneyPage.isSendRequestButtonEnabled();
        Logger.info(`Send Request button enabled status for 20 Taka: ${isEnabled}`);
        expect(isEnabled).toBe(true);
    });

    it('TC 6: should submit Request Money and show "Congratulation!" confirmation dialog', async () => {
        Logger.info('Clicking Send Request button to submit Request Money...');
        await RequestMoneyPage.clickSendRequest();
        await driver.pause(2500);

        const successDialog = await RequestMoneyPage.getSuccessConfirmation();
        const isSuccess = (await successDialog.isExisting()) && (await successDialog.isDisplayed());
        Logger.info(`"Congratulation!" success confirmation dialog displayed: ${isSuccess}`);
        expect(isSuccess).toBe(true);
    });

    it('TC 7: should dismiss success modal via "Okay" button and return to Home dashboard', async () => {
        Logger.info('Clicking Okay button on success confirmation dialog...');
        const okayBtn = await RequestMoneyPage.getOkayButton();
        if (await okayBtn.isExisting() && await okayBtn.isDisplayed()) {
            await okayBtn.click();
            await driver.pause(2000);
        }

        const tile = await RequestMoneyPage.getRequestMoneyServiceTile();
        const isOnHome = (await tile.isExisting()) && (await tile.isDisplayed());
        Logger.info(`Returned to Home dashboard: ${isOnHome}`);
        expect(isOnHome).toBe(true);
    });
});
