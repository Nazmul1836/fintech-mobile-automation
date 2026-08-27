import LoginPage from '../../pageobjects/LoginPage.js';
import PaymentPage from '../../pageobjects/PaymentPage.js';
import testData from '../../utils/testData.js';
import Logger from '../../utils/logger.js';
import Helpers from '../../utils/helpers.js';

describe('Merchant Payment Automation Suite - Mukto Pay UAT', () => {

    const merchantPhone = '01904555508';

    before(async () => {
        Logger.info('Performing clean app restart for Merchant Payment test suite...');
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
            Logger.info('Logging in primary user for Merchant Payment suite...');
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

    it('TC 1: should navigate to Merchant Payment screen from Home dashboard', async () => {
        Logger.info('Verifying navigation to Merchant Payment screen...');
        await PaymentPage.navigateToPayment();
        const searchInput = await PaymentPage.getSearchInput();
        const isDisplayed = await searchInput.isExisting();
        expect(isDisplayed).toBe(true);
    });

    it('TC 2: should display error when entering non-merchant phone number 01764233618', async () => {
        const nonMerchantPhone = '01764233618';
        Logger.info(`Testing payment attempt to non-merchant number ${nonMerchantPhone}...`);
        
        // Enter non-merchant phone number into search input
        const searchInput = await PaymentPage.getSearchInput();
        if (await searchInput.isExisting() && await searchInput.isDisplayed()) {
            await searchInput.click();
            await searchInput.setValue(nonMerchantPhone);
            await driver.pause(1500);
        }

        // Click Continue button
        const continueBtn = await PaymentPage.getContinueButton();
        if (await continueBtn.isExisting() && await continueBtn.isDisplayed()) {
            Logger.info('Clicking Continue button for non-merchant number search...');
            await continueBtn.click();
            await driver.pause(1500);
        }

        // Assert "No merchant is registered with this MSISDN." error message
        const errorElement = await PaymentPage.getNoMerchantRegisteredError();
        const isErrorDisplayed = (await errorElement.isExisting()) && (await errorElement.isDisplayed());
        Logger.info(`"No merchant is registered with this MSISDN." error displayed: ${isErrorDisplayed}`);
        expect(isErrorDisplayed).toBe(true);

        // Click Close button on error sheet
        const closeBtn = await PaymentPage.getCloseButton();
        if (await closeBtn.isExisting() && await closeBtn.isDisplayed()) {
            Logger.info('Clicking Close button on error sheet...');
            await closeBtn.click();
            await driver.pause(1000);
        }

        // Clear search input for next test
        if (await searchInput.isExisting() && await searchInput.isDisplayed()) {
            await searchInput.click();
            if (typeof driver !== 'undefined' && driver.pressKeyCode) {
                for (let i = 0; i < 15; i++) {
                    try { await driver.pressKeyCode(67); } catch (e) { }
                }
            }
            await driver.pause(500);
        }
    });

    it('TC 3: should search and select merchant recipient 01904555508', async () => {
        Logger.info(`Searching and selecting merchant recipient ${merchantPhone}...`);
        await PaymentPage.selectMerchantRecipient(merchantPhone);
        const amountInput = await PaymentPage.getAmountInput();
        const isDisplayed = await amountInput.isExisting();
        expect(isDisplayed).toBe(true);
    });

    it('TC 4: should keep Proceed disabled for 0 Taka amount (minimum payment is 1 Taka)', async () => {
        Logger.info('Verifying Proceed button disabled state for 0 Taka amount...');
        await PaymentPage.enterAmount(0);
        const isEnabled = await PaymentPage.isProceedButtonEnabled();
        expect(isEnabled).toBe(false);
    });

    it('TC 5: should enable Proceed button when entering minimum payment amount (1 Taka)', async () => {
        Logger.info('Entering minimum valid payment amount (1 Taka) and reference...');
        await PaymentPage.enterAmount(1);
        await PaymentPage.enterReference('Minimum Amount Test');
        const isEnabled = await PaymentPage.isProceedButtonEnabled();
        expect(isEnabled).toBe(true);
    });

    it('TC 6: should reject payment attempt with Wrong PIN (55555)', async () => {
        Logger.info('Testing payment attempt with invalid/wrong PIN (55555)...');
        await PaymentPage.enterAmount(10);
        await PaymentPage.enterReference('Wrong PIN Test');
        await PaymentPage.clickProceed();
        await driver.pause(1500);

        // Enter wrong PIN (55555)
        await PaymentPage.enterPin('55555');
        await PaymentPage.clickConfirmPin();
        await driver.pause(1500);

        // Assert error banner or non-success status for Wrong PIN
        const errElement = await PaymentPage.getInvalidPinError();
        const isErrorDisplayed = (await errElement.isExisting()) && (await errElement.isDisplayed());
        const isSuccess = await PaymentPage.isSuccessSheetDisplayed();
        
        Logger.info(`Invalid PIN error message displayed: ${isErrorDisplayed}`);
        Logger.info(`Transaction success status with Wrong PIN: ${isSuccess}`);

        // Assertion: Ensure transaction did NOT succeed and/or error dialog appeared
        expect(isSuccess).toBe(false);

        // Dismiss alert dialog if present
        await PaymentPage.dismissAlert();
        await driver.pause(1000);

        // Press back twice to cleanly exit PIN screen & Amount screen back to Home Dashboard
        try { await driver.back(); } catch (e) { }
        await driver.pause(1000);
        try { await driver.back(); } catch (e) { }
        await driver.pause(1000);
    });

    it('TC 7: should execute end-to-end Merchant Payment transaction (20 Taka) and show "Your payment is successful"', async () => {
        Logger.info(`Executing end-to-end Merchant Payment transaction (20 Taka) for ${merchantPhone}...`);

        // Ensure clean navigation to Payment screen for final transfer
        await PaymentPage.navigateToPayment();
        await PaymentPage.selectMerchantRecipient(merchantPhone);
        await driver.pause(1000);

        // 1. Enter Amount (20 Taka) into field_merchant_payment.amount_field
        const amountInput = await PaymentPage.getAmountInput();
        if (await amountInput.isExisting() && await amountInput.isDisplayed()) {
            await PaymentPage.enterAmount(20);
        }

        // 2. Scroll down if needed to reveal reference field
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

        // 3. Enter Reference ("test payment") into field_merchant_payment.reference_field
        await PaymentPage.enterReference('test payment');

        // 4. Click "Proceed" button (~Proceed)
        await PaymentPage.clickProceed();
        await driver.pause(2000);

        // 5. Enter valid PIN (12121) using field_core.pin_field
        await PaymentPage.enterPin(testData.user.pin);
        await driver.pause(1000);

        // 6. Click "Confirm PIN" button (~Confirm PIN)
        await PaymentPage.clickConfirmPin();
        await driver.pause(2000);

        // 7. Perform 3.5s Tap & Hold gesture on "Hold to Pay" button (~Hold to Pay)
        Logger.info('Performing 3.5s Tap & Hold gesture on Hold to Pay button...');
        await PaymentPage.tapAndHoldToPay(3500);
        await driver.pause(3000);

        // 8. Assert Success Confirmation Sheet ("Your payment is successful")
        const isSuccess = await PaymentPage.isSuccessSheetDisplayed();
        Logger.info(`Merchant Payment transaction success confirmation displayed: ${isSuccess}`);
        expect(isSuccess).toBe(true);

        // Return to Home dashboard
        const homeBtn = await PaymentPage.getBackToHomeButton();
        if (await homeBtn.isExisting() && await homeBtn.isDisplayed()) {
            await homeBtn.click();
            await driver.pause(1500);
        }
    });
});
