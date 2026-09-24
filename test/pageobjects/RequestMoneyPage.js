import Page from './Page.js';
import Logger from '../utils/logger.js';
import Helpers from '../utils/helpers.js';

/**
 * Page Object for Request Money Feature
 */
class RequestMoneyPage extends Page {

    // ====================
    // Element Locators
    // ====================

    /**
     * Request Money Home Dashboard Service Tile
     */
    async getRequestMoneyServiceTile() {
        return await this.findFirstElement([
            '//*[@resource-id="dashboard.home.menu_tile.request_money"]',
            '//android.view.View[@resource-id="dashboard.home.menu_tile.request_money"]',
            'android=new UiSelector().resourceId("dashboard.home.menu_tile.request_money")',
            '~Request Money',
            '//*[contains(@content-desc, "Request Money")]'
        ]);
    }

    /**
     * Recipient Search Input Field
     */
    async getSearchInput() {
        return await this.findFirstElement([
            '//android.widget.EditText[1]',
            '//*[@resource-id="core.search_field"]',
            '//android.widget.EditText[contains(@text, "Search") or contains(@hint, "Search") or contains(@text, "Name or Number")]',
            'android=new UiSelector().className("android.widget.EditText").instance(0)'
        ]);
    }

    /**
     * Continue Button after typing search number
     */
    async getContinueButton() {
        return await this.findFirstElement([
            '~Continue',
            '//android.widget.Button[@content-desc="Continue" or @text="Continue"]',
            '//*[contains(@content-desc, "Continue")]'
        ]);
    }

    /**
     * Error dialog for non-registered recipient
     */
    async getNotRegisteredError() {
        return await this.findFirstElement([
            '~The recipient is not registered.',
            '//*[contains(@content-desc, "The recipient is not registered.") or contains(@text, "The recipient is not registered.")]',
            '//*[contains(@content-desc, "not registered")]'
        ]);
    }

    /**
     * Close button on error modal dialog
     */
    async getCloseButton() {
        return await this.findFirstElement([
            '~Close',
            '//android.widget.Button[@content-desc="Close" or @text="Close"]',
            '//*[contains(@content-desc, "Close")]'
        ]);
    }

    /**
     * Recipient Item Row
     */
    async getRecipientRow(identifier = '01329484257') {
        return await this.findFirstElement([
            `android=new UiSelector().descriptionContains("${identifier}")`,
            `//*[contains(@content-desc, "${identifier}")]`,
            `//*[contains(@text, "${identifier}")]`,
            '//*[@resource-id="core.recipient_row"]',
            '//android.widget.ImageView[1]'
        ]);
    }

    /**
     * Amount Input Field for Request Money
     */
    async getAmountInput() {
        return await this.findFirstElement([
            '//*[@resource-id="field_request_money.amount_field"]',
            '//android.widget.EditText[@resource-id="field_request_money.amount_field"]',
            'android=new UiSelector().resourceId("field_request_money.amount_field")',
            '//android.widget.EditText[1]'
        ]);
    }

    /**
     * Reference Input Field for Request Money
     */
    async getReferenceInput() {
        return await this.findFirstElement([
            '//*[@resource-id="field_request_money.reference_field"]',
            '//android.widget.EditText[@resource-id="field_request_money.reference_field"]',
            'android=new UiSelector().resourceId("field_request_money.reference_field")',
            '//android.widget.EditText[2]'
        ]);
    }

    /**
     * Send Request Button
     */
    async getSendRequestButton() {
        return await this.findFirstElement([
            '~Send Request',
            '//android.widget.Button[@content-desc="Send Request" or @text="Send Request"]',
            '//*[contains(@content-desc, "Send Request")]'
        ]);
    }

    /**
     * Congratulation / Success Dialog
     */
    async getSuccessConfirmation() {
        return await this.findFirstElement([
            '~Congratulation!',
            '//*[contains(@content-desc, "Congratulation")]',
            '//*[contains(@text, "Congratulation")]',
            '~Your request has been sent'
        ]);
    }

    /**
     * Okay Button on Success Dialog
     */
    async getOkayButton() {
        return await this.findFirstElement([
            '~Okay',
            '//android.widget.Button[@content-desc="Okay" or @text="Okay"]',
            '//*[contains(@content-desc, "Okay")]'
        ]);
    }

    /**
     * Minimum amount error message element
     */
    async getMinAmountError() {
        return await this.findFirstElement([
            '//*[contains(@content-desc, "10") or contains(@text, "10") or contains(@content-desc, "minimum") or contains(@text, "minimum")]',
            '//*[contains(@content-desc, "less than") or contains(@text, "less than")]'
        ]);
    }

    // ====================
    // Action Methods
    // ====================

    /**
     * Navigates to Request Money screen from Home dashboard tile
     */
    async navigateToRequestMoney() {
        Logger.info('Navigating to Request Money screen...');
        let tile = await this.getRequestMoneyServiceTile();
        let retries = 0;
        while (!(await tile.isExisting() && await tile.isDisplayed()) && retries < 5) {
            Logger.info(`Not on Home Dashboard (attempt ${retries + 1}), returning to Home via back...`);
            const homeBtn = await this.getBackToHomeButton();
            if (await homeBtn.isExisting() && await homeBtn.isDisplayed()) {
                await homeBtn.click();
                if (typeof driver !== 'undefined' && driver.pause) await driver.pause(1500);
            } else if (typeof driver !== 'undefined' && driver.back) {
                try { await driver.back(); } catch (e) { }
                if (typeof driver !== 'undefined' && driver.pause) await driver.pause(1200);
            }
            tile = await this.getRequestMoneyServiceTile();
            retries++;
        }

        if (await tile.isExisting() && await tile.isDisplayed()) {
            await tile.click();
            if (typeof driver !== 'undefined' && driver.pause) await driver.pause(2000);
        }
    }

    /**
     * Searches and selects recipient
     */
    async selectRecipient(query = '01329484257') {
        Logger.info(`Searching and selecting recipient: ${query}`);
        const input = await this.getSearchInput();
        if (await input.isExisting() && await input.isDisplayed()) {
            await input.click();
            if (typeof driver !== 'undefined' && driver.pressKeyCode) {
                for (let i = 0; i < 15; i++) {
                    try { await driver.pressKeyCode(67); } catch (e) { }
                }
            }
            await input.setValue(query);
            if (typeof driver !== 'undefined' && driver.pause) await driver.pause(1500);

            const row = await this.getRecipientRow(query);
            if (await row.isExisting() && await row.isDisplayed()) {
                Logger.info(`Clicking recipient item for ${query}...`);
                await row.click();
                if (typeof driver !== 'undefined' && driver.pause) await driver.pause(2000);
            }
        }
    }

    /**
     * Enters request amount into field_request_money.amount_field
     */
    async enterAmount(amount) {
        Logger.info(`Entering request money amount: ${amount}`);
        const input = await this.getAmountInput();
        if (await input.isExisting() && await input.isDisplayed()) {
            await input.click();
            if (typeof driver !== 'undefined' && driver.pressKeyCode) {
                for (let i = 0; i < 8; i++) {
                    try { await driver.pressKeyCode(67); } catch (e) { }
                }
            }
            if (amount !== 0 && amount !== '0') {
                await input.setValue(amount.toString());
            }
            await Helpers.hideKeyboard();
            if (typeof driver !== 'undefined' && driver.pause) await driver.pause(500);
        }
    }

    /**
     * Enters reference note into field_request_money.reference_field
     */
    async enterReference(ref) {
        Logger.info(`Entering reference note: ${ref}`);
        const input = await this.getReferenceInput();
        if (await input.isExisting() && await input.isDisplayed()) {
            await input.click();
            await input.setValue(ref);
            await Helpers.hideKeyboard();
            if (typeof driver !== 'undefined' && driver.pause) await driver.pause(500);
        }
    }

    /**
     * Clicks Send Request button
     */
    async clickSendRequest() {
        Logger.info('Clicking Send Request button...');
        const btn = await this.getSendRequestButton();
        if (await btn.isExisting() && await btn.isDisplayed()) {
            await btn.click();
            if (typeof driver !== 'undefined' && driver.pause) await driver.pause(2000);
        }
    }

    /**
     * Checks if Send Request button is enabled
     */
    async isSendRequestButtonEnabled() {
        try {
            const btn = await this.getSendRequestButton();
            if (await btn.isExisting() && await btn.isDisplayed()) {
                const isEnabled = await btn.isEnabled();
                const enabledAttr = await btn.getAttribute('enabled');
                return isEnabled && enabledAttr !== 'false';
            }
            return false;
        } catch (e) {
            return false;
        }
    }

    // ====================
    // Recipient Side Locators & Actions
    // ====================

    /**
     * Received Requests tab icon on Request Money screen
     */
    async getReceivedRequestsTab() {
        return await this.findFirstElement([
            'android=new UiSelector().className("android.widget.ImageView").instance(1)',
            '//*[@resource-id="core.received_requests_tab"]',
            '//android.widget.ImageView[2]'
        ]);
    }

    /**
     * Finds a pending request item (containing "Pending")
     */
    async getPendingRequestItem(senderPhone = '') {
        const selectors = [
            'android=new UiSelector().descriptionContains("Pending")',
            '//*[contains(@content-desc, "Pending") or contains(@text, "Pending")]',
            '//*[contains(@content-desc, "৳") or contains(@content-desc, "TK") or contains(@content-desc, "Taka")]'
        ];
        if (senderPhone) {
            selectors.unshift(`//*[contains(@content-desc, "${senderPhone}")]`);
        }
        
        for (const sel of selectors) {
            try {
                const el = await $(sel);
                if (await el.isExisting()) {
                    await el.waitForDisplayed({ timeout: 5000 }).catch(() => {});
                    if (await el.isDisplayed()) return el;
                }
            } catch (e) { }
        }
        return await this.findFirstElement(selectors);
    }

    /**
     * Reject Button on request details modal/screen
     */
    async getRejectButton() {
        return await this.findFirstElement([
            '~Reject',
            '//android.widget.Button[@content-desc="Reject" or @text="Reject"]',
            '//*[contains(@content-desc, "Reject")]'
        ]);
    }

    /**
     * Send Money button to accept money request
     */
    async getSendMoneyAcceptButton() {
        return await this.findFirstElement([
            '~Send Money',
            '//android.widget.Button[@content-desc="Send Money" or @text="Send Money"]',
            '//*[contains(@content-desc, "Send Money")]'
        ]);
    }

    /**
     * Reference input on Send Money / Pay request screen
     */
    async getAcceptReferenceInput() {
        return await this.findFirstElement([
            '//android.widget.EditText[1]',
            '//*[@resource-id="field_core.reference_field"]',
            'android=new UiSelector().className("android.widget.EditText").instance(0)'
        ]);
    }

    /**
     * Proceed Button
     */
    async getProceedButton() {
        return await this.findFirstElement([
            '~Proceed',
            '//android.widget.Button[@content-desc="Proceed" or @text="Proceed"]',
            '//*[contains(@content-desc, "Proceed")]'
        ]);
    }

    /**
     * Payment PIN input field (field_core.pin_field)
     */
    async getPaymentPinInput() {
        return await this.findFirstElement([
            '//*[@resource-id="field_core.pin_field"]',
            '//android.widget.EditText[@resource-id="field_core.pin_field"]',
            'android=new UiSelector().resourceId("field_core.pin_field")',
            '//android.widget.EditText[1]'
        ]);
    }

    /**
     * Confirm PIN Button
     */
    async getConfirmPinButton() {
        return await this.findFirstElement([
            '~Confirm PIN',
            '//android.widget.Button[@content-desc="Confirm PIN" or @text="Confirm PIN"]',
            '//*[contains(@content-desc, "Confirm PIN")]'
        ]);
    }

    /**
     * Hold to Pay Button
     */
    async getHoldToPayButton() {
        return await this.findFirstElement([
            '~Hold to Pay',
            '//android.widget.Button[@content-desc="Hold to Pay" or @text="Hold to Pay"]',
            '//*[contains(@content-desc, "Hold to Pay")]'
        ]);
    }

    /**
     * Home Button after payment completion
     */
    async getHomeButton() {
        return await this.findFirstElement([
            '~Home',
            '//android.widget.Button[@content-desc="Home" or @text="Home"]',
            '//*[contains(@content-desc, "Home")]'
        ]);
    }

    /**
     * Clicks Received Requests tab
     */
    async clickReceivedRequestsTab() {
        Logger.info('Clicking Received Requests tab...');
        const tab = await this.getReceivedRequestsTab();
        if (await tab.isExisting() && await tab.isDisplayed()) {
            await tab.click();
            if (typeof driver !== 'undefined' && driver.pause) await driver.pause(3000);
        }
    }

    /**
     * Rejects a pending money request
     */
    async rejectPendingRequest(senderPhone = '') {
        Logger.info('Selecting pending request to reject...');
        const item = await this.getPendingRequestItem(senderPhone);
        if (await item.isExisting() && await item.isDisplayed()) {
            await item.click();
            if (typeof driver !== 'undefined' && driver.pause) await driver.pause(1500);

            const rejectBtn = await this.getRejectButton();
            if (await rejectBtn.isExisting() && await rejectBtn.isDisplayed()) {
                Logger.info('Clicking Reject button...');
                await rejectBtn.click();
                if (typeof driver !== 'undefined' && driver.pause) await driver.pause(2000);
            }
        }
    }

    /**
     * Accepts and pays a pending money request
     */
    async acceptAndPayPendingRequest(pin = '12121', referenceNote = 'Test', senderPhone = '') {
        Logger.info('Selecting pending request to accept...');
        const item = await this.getPendingRequestItem(senderPhone);
        if (await item.isExisting() && await item.isDisplayed()) {
            await item.click();
            if (typeof driver !== 'undefined' && driver.pause) await driver.pause(1500);

            const sendMoneyBtn = await this.getSendMoneyAcceptButton();
            if (await sendMoneyBtn.isExisting() && await sendMoneyBtn.isDisplayed()) {
                Logger.info('Clicking Send Money button to accept request...');
                await sendMoneyBtn.click();
                if (typeof driver !== 'undefined' && driver.pause) await driver.pause(1500);

                // Reference Note input
                const refInput = await this.getAcceptReferenceInput();
                if (await refInput.isExisting() && await refInput.isDisplayed()) {
                    Logger.info(`Entering reference note: ${referenceNote}`);
                    await refInput.click();
                    await refInput.setValue(referenceNote);
                    await Helpers.hideKeyboard();
                    if (typeof driver !== 'undefined' && driver.pause) await driver.pause(500);
                }

                // Click Proceed
                const proceedBtn = await this.getProceedButton();
                if (await proceedBtn.isExisting() && await proceedBtn.isDisplayed()) {
                    Logger.info('Clicking Proceed button...');
                    await proceedBtn.click();
                    if (typeof driver !== 'undefined' && driver.pause) await driver.pause(1500);
                }

                // PIN Entry
                Logger.info(`Entering PIN into field_core.pin_field: ${pin}`);
                const pinInput = await this.getPaymentPinInput();
                if (await pinInput.isExisting() && await pinInput.isDisplayed()) {
                    await pinInput.click();
                    if (typeof driver !== 'undefined' && driver.pressKeyCode) {
                        for (let i = 0; i < 8; i++) {
                            try { await driver.pressKeyCode(67); } catch (e) { }
                        }
                    }
                    const digitMap = { '0': 7, '1': 8, '2': 9, '3': 10, '4': 11, '5': 12, '6': 13, '7': 14, '8': 15, '9': 16 };
                    for (const char of pin.toString()) {
                        const keycode = digitMap[char];
                        if (keycode && typeof driver !== 'undefined' && driver.pressKeyCode) {
                            try { await driver.pressKeyCode(keycode); } catch (e) { }
                        }
                    }
                    await Helpers.hideKeyboard();
                    if (typeof driver !== 'undefined' && driver.pause) await driver.pause(500);
                }

                // Click Confirm PIN
                const confirmPinBtn = await this.getConfirmPinButton();
                if (await confirmPinBtn.isExisting() && await confirmPinBtn.isDisplayed()) {
                    Logger.info('Clicking Confirm PIN button...');
                    await confirmPinBtn.click();
                    if (typeof driver !== 'undefined' && driver.pause) await driver.pause(2000);
                }

                // Hold to Pay
                await this.performHoldToPay();

                // Click Home
                const homeBtn = await this.getHomeButton();
                if (await homeBtn.isExisting() && await homeBtn.isDisplayed()) {
                    Logger.info('Clicking Home button after payment completion...');
                    await homeBtn.click();
                    if (typeof driver !== 'undefined' && driver.pause) await driver.pause(2000);
                }
            }
        }
    }

    /**
     * Performs Hold to Pay long press action
     */
    async performHoldToPay() {
        Logger.info('Performing Hold to Pay gesture...');
        const btn = await this.getHoldToPayButton();
        if (await btn.isExisting() && await btn.isDisplayed()) {
            const location = await btn.getLocation();
            const size = await btn.getSize();
            const centerX = Math.round(location.x + size.width / 2);
            const centerY = Math.round(location.y + size.height / 2);

            try {
                await driver.action('pointer', { parameters: { pointerType: 'touch' } })
                    .move({ x: centerX, y: centerY })
                    .down({ button: 0 })
                    .pause(3500)
                    .up({ button: 0 })
                    .perform();
                if (typeof driver !== 'undefined' && driver.pause) await driver.pause(3000);
            } catch (e) {
                Logger.info('Fallback: Long press via TouchAction/click...');
                await btn.click();
                if (typeof driver !== 'undefined' && driver.pause) await driver.pause(3000);
            }
        }
    }
}

export default new RequestMoneyPage();
