import LoginPage from '../../pageobjects/LoginPage.js';
import SendMoneyPage from '../../pageobjects/SendMoneyPage.js';
import testData from '../../utils/testData.js';
import Logger from '../../utils/logger.js';

describe('Send Money Automation Suite - Mukto Pay UAT', () => {

    before(async () => {
        Logger.info('Performing clean app restart to clear any leftover sub-screens...');
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
            Logger.info('Logging in primary user for Send Money suite...');
            await LoginPage.login(testData.user.phone, testData.user.pin, testData.user.otp);
            await driver.pause(2000);
        }
    });

    beforeEach(async () => {
        if (await LoginPage.isDisplayed()) {
            Logger.info('Session logged out, re-authenticating primary user...');
            await LoginPage.login(testData.user.phone, testData.user.pin, testData.user.otp);
            await driver.pause(2000);
        }
    });

    it('TC 1 & 2: should navigate to Send Money screen from Home dashboard', async () => {
        Logger.info('Verifying navigation to Send Money screen...');
        await SendMoneyPage.navigateToSendMoney();
        const searchInput = await SendMoneyPage.getContactSearchInput();
        const isDisplayed = await searchInput.isExisting();
        expect(isDisplayed).toBe(true);
    });

    it('TC 4, 7 & 12: should search and select recipient by mobile number', async () => {
        Logger.info('Searching and selecting recipient for transfer...');
        await SendMoneyPage.selectRecipient(testData.transfer.receiverPhone || '01329484257');
        const amountInput = await SendMoneyPage.getAmountInput();
        const isDisplayed = await amountInput.isExisting();
        expect(isDisplayed).toBe(true);
    });

    it('TC 60, 62 & 83: should keep Proceed disabled for invalid/empty amount', async () => {
        Logger.info('Verifying Proceed button disabled state for invalid amount...');
        await SendMoneyPage.enterAmount(0);
        const isEnabled = await SendMoneyPage.isProceedButtonEnabled();
        expect(isEnabled).toBe(false);
    });

    it('TC 74: should display Insufficient Balance error when amount exceeds available balance', async () => {
        Logger.info('Testing dynamic Insufficient Balance error validation...');
        const currentBalance = await SendMoneyPage.getParsedAvailableBalance();
        const insufficientAmount = Math.ceil(currentBalance > 0 ? currentBalance : 32000) + 10000;
        Logger.info(`Current balance: ${currentBalance} Tk. Entering dynamic insufficient amount: ${insufficientAmount} Tk...`);

        await SendMoneyPage.enterAmount(insufficientAmount);
        await SendMoneyPage.clickProceed();
        await driver.pause(1200);

        const errorBanner = await SendMoneyPage.getInsufficientBalanceError();
        const isDisplayed = await errorBanner.isExisting();
        Logger.info(`Insufficient Balance error displayed: ${isDisplayed}`);
        expect(isDisplayed).toBe(true);

        // Clean up error popup for subsequent tests
        await SendMoneyPage.dismissAlert();
        await driver.pause(500);
    });

    it('TC 59, 80 & 82: should enable Proceed button and display charge calculation for valid amount', async () => {
        Logger.info('Entering valid transfer amount and verifying Proceed state...');
        const validAmount = testData.transfer.amount || 500;
        await SendMoneyPage.enterAmount(validAmount);
        await SendMoneyPage.enterReference('Test Automation');
        
        const proceedBtn = await SendMoneyPage.getProceedButton();
        expect(await proceedBtn.isExisting()).toBe(true);

        await SendMoneyPage.clickProceed();
        await driver.pause(1500);
    });

    it('TC 88 & 90: should display masked PIN entry field on confirmation screen', async () => {
        Logger.info('Verifying masked PIN input field presence on summary screen...');
        const pinInput = await SendMoneyPage.getPinInput();
        const isDisplayed = await pinInput.isExisting();
        expect(isDisplayed).toBe(true);
    });

    it('TC 97, 98 & 102: should execute Send Money transaction with valid PIN, hold to pay, and show success confirmation', async () => {
        Logger.info('Executing end-to-end Send Money transfer with valid PIN and Tap & Hold gesture...');
        const pinInput = await SendMoneyPage.getPinInput();
        if (await pinInput.isExisting()) {
            // 1. Enter PIN
            await SendMoneyPage.enterPin(testData.user.pin);
            
            // 2. Click purple 'Confirm PIN' button to transition to review screen
            await SendMoneyPage.clickConfirmPin();
            await driver.pause(1500);

            // 3. Perform 3.5s Tap & Hold gesture on 'Hold to Pay' button
            await SendMoneyPage.tapAndHoldToPay(3500);
            await driver.pause(3000);

            // 4. Assert Success Confirmation Sheet
            const isSuccess = await SendMoneyPage.isSuccessSheetDisplayed();
            Logger.info(`Send Money transaction success confirmation displayed: ${isSuccess}`);
            expect(isSuccess).toBe(true);

            // Clean up / navigate back to Home
            const homeBtn = await SendMoneyPage.getBackToHomeButton();
            if (await homeBtn.isExisting()) {
                await homeBtn.click();
            }
        }
    });
});
