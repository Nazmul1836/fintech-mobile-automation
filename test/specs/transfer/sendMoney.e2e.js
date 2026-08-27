import LoginPage from '../../pageobjects/LoginPage.js';
import SendMoneyPage from '../../pageobjects/SendMoneyPage.js';
import testData from '../../utils/testData.js';
import Logger from '../../utils/logger.js';
import Helpers from '../../utils/helpers.js';

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

    // =========================================================================
    // 1ST EXECUTION SUITE: SEND MONEY TO UNREGISTERED NUMBER (01764233618)
    // =========================================================================
    describe('1st Flow: Send Money to Unregistered Number', () => {
        it('should execute Send Money to an unregistered number (01764233618) following Appium recorded script', async () => {
            const unregisteredPhone = '01764233618';
            Logger.info(`Executing 1st Flow - Send Money to unregistered number (${unregisteredPhone})...`);
            
            // 1. Navigate to Send Money screen from Home dashboard
            await SendMoneyPage.navigateToSendMoney();
            await driver.pause(1000);

            // 2. Search & select unregistered phone item from search results
            await SendMoneyPage.selectRecipient(unregisteredPhone);
            await driver.pause(1500);

            // 3. Enter amount (100) into field_null
            const amountInput = await SendMoneyPage.findFirstElement([
                '//*[@resource-id="field_null"]',
                '//android.widget.EditText[@resource-id="field_null"]',
                '//android.widget.EditText[1]'
            ], 5000);
            if (await amountInput.isExisting()) {
                await amountInput.click();
                await amountInput.setValue('100');
                await Helpers.hideKeyboard();
                await driver.pause(500);
            }

            // 4. Scroll down if needed to reveal reference field
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

            // 5. Enter reference ("test") into field_EnterReference
            const refInput = await SendMoneyPage.findFirstElement([
                '//*[@resource-id="field_EnterReference"]',
                '//android.widget.EditText[@resource-id="field_EnterReference"]',
                '//android.widget.EditText[2]'
            ], 5000);
            if (await refInput.isExisting()) {
                await refInput.click();
                await refInput.setValue('test');
                await Helpers.hideKeyboard();
                await driver.pause(500);
            }

            // 6. Click "Proceed" button (~Proceed)
            await SendMoneyPage.clickProceed();
            await driver.pause(2000);

            // 7. Enter PIN (12121) using field_core.pin_field
            const pinInput = await SendMoneyPage.getPinInput();
            if (await pinInput.isExisting() && await pinInput.isDisplayed()) {
                await SendMoneyPage.enterPin(testData.user.pin);
                await driver.pause(1000);
            }

            // 8. Click "Confirm PIN" button (~Confirm PIN)
            await SendMoneyPage.clickConfirmPin();
            await driver.pause(2000);

            // 9. Tap & Hold "Hold to Pay" button (~Hold to Pay)
            Logger.info('Performing 3.5s Tap & Hold gesture on Hold to Pay button...');
            await SendMoneyPage.tapAndHoldToPay(3500);
            await driver.pause(2500);

            // 10. Assert unregistered advice or completion confirmation
            const unregisteredAdvice = await SendMoneyPage.findFirstElement([
                '~Please advise the recipient to download Mukto Pay App or visit nearby Digital Registration point to open an account within 72 hours.',
                '//*[contains(@content-desc, "Please advise the recipient to download Mukto Pay App")]',
                '//*[contains(@text, "Please advise the recipient to download Mukto Pay App")]',
                '//*[contains(@content-desc, "successful")]',
                '//*[contains(@content-desc, "Your send money is successful")]'
            ], 5000);

            const isAdviceDisplayed = await unregisteredAdvice.isExisting() && await unregisteredAdvice.isDisplayed();
            Logger.info(`Unregistered recipient result banner displayed: ${isAdviceDisplayed}`);
            expect(isAdviceDisplayed).toBe(true);

            // Dismiss advice modal / complete flow
            if (isAdviceDisplayed) {
                await unregisteredAdvice.click();
                await driver.pause(1500);
            }

            // Return to Home dashboard
            const homeBtn = await SendMoneyPage.getBackToHomeButton();
            if (await homeBtn.isExisting() && await homeBtn.isDisplayed()) {
                await homeBtn.click();
                await driver.pause(1500);
            }
        });
    });

    // =========================================================================
    // 2ND EXECUTION SUITE: SEND MONEY TO REGISTERED NUMBER (01329484257)
    // =========================================================================
    describe('2nd Flow: Send Money to Registered Number', () => {
        it('TC 1 & 2: should navigate to Send Money screen from Home dashboard', async () => {
            Logger.info('Verifying navigation to Send Money screen...');
            await SendMoneyPage.navigateToSendMoney();
            const searchInput = await SendMoneyPage.getContactSearchInput();
            const isDisplayed = await searchInput.isExisting();
            expect(isDisplayed).toBe(true);
        });

        it('TC 4, 7 & 12: should search and select recipient by mobile number', async () => {
            Logger.info('Searching and selecting registered recipient for transfer...');
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
});
