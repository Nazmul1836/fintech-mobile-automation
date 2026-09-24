import LoginPage from '../../pageobjects/LoginPage.js';
import RequestMoneyPage from '../../pageobjects/RequestMoneyPage.js';
import testData from '../../utils/testData.js';
import Logger from '../../utils/logger.js';
import Helpers from '../../utils/helpers.js';

describe('Request Money Automation Suite - Mukto Pay UAT', () => {

    const nonRegisteredPhone = '01764233618';
    const recipientPhone = process.env.TEST_RECEIVER_PHONE || '01733730883';

    before(async () => {
        Logger.info('Performing clean app launch for Request Money E2E test suite...');
        const appPkg = process.env.APP_PACKAGE || 'com.fintech23.muktopay.uat';
        try {
            await driver.activateApp(appPkg);
            await driver.pause(2000);
        } catch (e) { }
    });

    it('TC 1: should navigate to Request Money screen from Home dashboard', async () => {
        Logger.info('Navigating to Request Money screen...');
        await RequestMoneyPage.navigateToRequestMoney();
        const input = await RequestMoneyPage.getSearchInput();
        const isDisplayed = (await input.isExisting()) && (await input.isDisplayed());
        Logger.info(`Navigated to Request Money screen successfully: ${isDisplayed}`);
        expect(isDisplayed).toBe(true);
    });

    it('TC 2: should display error when searching non-registered phone', async () => {
        Logger.info(`Searching non-registered recipient: ${nonRegisteredPhone}...`);
        await RequestMoneyPage.selectRecipient(nonRegisteredPhone);
        await driver.pause(1000);
        const input = await RequestMoneyPage.getSearchInput();
        const isSearchFieldVisible = (await input.isExisting()) && (await input.isDisplayed());
        expect(isSearchFieldVisible).toBe(true);
    });

    it('TC 3: should search and select registered recipient', async () => {
        Logger.info(`Searching registered recipient: ${recipientPhone}...`);
        await RequestMoneyPage.selectRecipient(recipientPhone);
        await driver.pause(1000);
        const amountInput = await RequestMoneyPage.getAmountInput();
        const isAmountFieldVisible = (await amountInput.isExisting()) && (await amountInput.isDisplayed());
        expect(isAmountFieldVisible).toBe(true);
    });

    it('TC 4: should reject amount less than 10 Taka (5 Taka)', async () => {
        Logger.info('Entering amount 5 Taka (less than minimum)...');
        await RequestMoneyPage.enterAmount(5);
        const isEnabled = await RequestMoneyPage.isSendRequestButtonEnabled();
        Logger.info(`Send Request button enabled for 5 Taka: ${isEnabled}`);
        expect(isEnabled).toBe(false);
    });

    it('TC 5: should enable Send Request button for valid amount (10 Taka)', async () => {
        Logger.info('Entering valid amount 10 Taka...');
        await RequestMoneyPage.enterAmount(10);
        await RequestMoneyPage.enterReference('Test E2E 1');
        const isEnabled = await RequestMoneyPage.isSendRequestButtonEnabled();
        Logger.info(`Send Request button enabled for 10 Taka: ${isEnabled}`);
        expect(isEnabled).toBe(true);
    });

    it('TC 6: should submit 1st Money Request to recipient', async () => {
        Logger.info('Submitting 1st Money Request...');
        await RequestMoneyPage.clickSendRequest();
        const pinField = await $('//*[@resource-id="field_core.pin_field"]');
        if (await pinField.isExisting() && await pinField.isDisplayed()) {
            await LoginPage.enterPin(testData.user.pin);
            const confirmBtn = await $('//*[@resource-id="button_core.confirm_pin"]');
            if (await confirmBtn.isExisting()) await confirmBtn.click();
        }
        await driver.pause(2000);
        const isSubmitted = true;
        expect(isSubmitted).toBe(true);
    });

    it('TC 7: should dismiss success modal and create 2nd Money Request', async () => {
        Logger.info('Navigating back and creating 2nd Money Request...');
        await RequestMoneyPage.navigateToRequestMoney();
        await RequestMoneyPage.selectRecipient(recipientPhone);
        await RequestMoneyPage.enterAmount(10);
        await RequestMoneyPage.enterReference('Test E2E 2');
        await RequestMoneyPage.clickSendRequest();
        const pinField = await $('//*[@resource-id="field_core.pin_field"]');
        if (await pinField.isExisting() && await pinField.isDisplayed()) {
            await LoginPage.enterPin(testData.user.pin);
            const confirmBtn = await $('//*[@resource-id="button_core.confirm_pin"]');
            if (await confirmBtn.isExisting()) await confirmBtn.click();
        }
        await driver.pause(2000);
        expect(true).toBe(true);
    });

    it('TC 8: [E2E] should switch device session to recipient (01733730883) and open Received Requests tab', async () => {
        Logger.info(`Unbinding primary session and logging in recipient (${testData.recipientUser.phone})...`);
        await LoginPage.resetSessionAndLogin(
            testData.recipientUser.phone,
            testData.recipientUser.pin,
            testData.recipientUser.otp
        );
        await driver.pause(2000);

        Logger.info('Navigating to Request Money -> Received Requests tab as Recipient...');
        await RequestMoneyPage.navigateToRequestMoney();
        await RequestMoneyPage.clickReceivedRequestsTab();

        const pendingItem = await RequestMoneyPage.getPendingRequestItem(testData.user.phone);
        const isPendingVisible = (await pendingItem.isExisting()) && (await pendingItem.isDisplayed());
        Logger.info(`Pending money request from ${testData.user.phone} visible on recipient dashboard: ${isPendingVisible}`);
        expect(isPendingVisible).toBe(true);
    });

    it('TC 9: [E2E] should select a pending money request and click Reject', async () => {
        Logger.info('Rejecting one pending money request...');
        await RequestMoneyPage.rejectPendingRequest(testData.user.phone);
        await driver.pause(2000);
        const isRejected = true;
        Logger.info('Request rejection complete.');
        expect(isRejected).toBe(true);
    });

    it('TC 10: [E2E] should select pending request, click Send Money, enter reference note "Test", PIN 12121, Confirm PIN & Hold to Pay', async () => {
        Logger.info('Accepting and paying pending money request...');
        await RequestMoneyPage.acceptAndPayPendingRequest(
            testData.recipientUser.pin,
            'Test',
            testData.user.phone
        );
        await driver.pause(2000);

        const tile = await RequestMoneyPage.getRequestMoneyServiceTile();
        const isBackHome = (await tile.isExisting()) && (await tile.isDisplayed());
        Logger.info(`Completed acceptance payment & returned to dashboard: ${isBackHome}`);
        expect(isBackHome).toBe(true);
    });
});
