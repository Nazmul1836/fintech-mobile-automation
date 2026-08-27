import Page from './Page.js';
import LoginPage from './LoginPage.js';
import testData from '../utils/testData.js';
import Logger from '../utils/logger.js';
import Helpers from '../utils/helpers.js';

class PaymentPage extends Page {

    /**
     * Dashboard Payment menu tile ("dashboard.home.menu_tile.payment")
     */
    async getPaymentServiceTile() {
        return await this.findFirstElement([
            '//*[@resource-id="dashboard.home.menu_tile.payment"]',
            'android=new UiSelector().resourceId("dashboard.home.menu_tile.payment")',
            '~dashboard.home.menu_tile.payment',
            '//android.view.View[contains(@content-desc, "Payment")]'
        ]);
    }

    /**
     * Search input field on Payment screen
     */
    async getSearchInput() {
        return await this.findFirstElement([
            '//android.widget.EditText[1]',
            'android=new UiSelector().className("android.widget.EditText").instance(0)',
            '//android.widget.EditText'
        ]);
    }

    /**
     * Matched recipient item row ("core.recipient_row")
     */
    async getRecipientRow(phone = '01904555508') {
        return await this.findFirstElement([
            'android=new UiSelector().resourceId("core.recipient_row").instance(0)',
            '//*[@resource-id="core.recipient_row"]',
            `android=new UiSelector().descriptionContains("${phone}")`,
            `//*[contains(@content-desc, "${phone}")]`
        ]);
    }

    /**
     * Payment amount input field ("field_merchant_payment.amount_field")
     */
    async getAmountInput() {
        return await this.findFirstElement([
            '//*[@resource-id="field_merchant_payment.amount_field"]',
            '//android.widget.EditText[@resource-id="field_merchant_payment.amount_field"]',
            'android=new UiSelector().resourceId("field_merchant_payment.amount_field")',
            '//android.widget.EditText[1]'
        ]);
    }

    /**
     * Reference input field ("field_merchant_payment.reference_field")
     */
    async getReferenceInput() {
        return await this.findFirstElement([
            '//*[@resource-id="field_merchant_payment.reference_field"]',
            '//android.widget.EditText[@resource-id="field_merchant_payment.reference_field"]',
            'android=new UiSelector().resourceId("field_merchant_payment.reference_field")',
            '//android.widget.EditText[2]'
        ]);
    }

    /**
     * Proceed / Continue button ("Proceed")
     */
    async getProceedButton() {
        return await this.findFirstElement([
            '~Proceed',
            '//android.widget.Button[@content-desc="Proceed" or @content-desc="PROCEED"]',
            '//*[@content-desc="Proceed"]'
        ]);
    }

    /**
     * PIN entry input ("field_merchant_payment.pin_field")
     */
    async getPinInput() {
        return await this.findFirstElement([
            '//*[@resource-id="field_merchant_payment.pin_field"]',
            '//android.widget.EditText[@resource-id="field_merchant_payment.pin_field"]',
            'android=new UiSelector().resourceId("field_merchant_payment.pin_field")',
            '//*[@resource-id="field_core.pin_field"]',
            '//android.widget.EditText[@resource-id="field_core.pin_field"]',
            'android=new UiSelector().resourceId("field_core.pin_field")',
            '//android.widget.EditText[contains(@text, "PIN") or contains(@text, "Pin")]'
        ]);
    }

    /**
     * Confirm PIN button ("Confirm PIN")
     */
    async getConfirmPinButton() {
        return await this.findFirstElement([
            '~Confirm PIN',
            '//android.widget.Button[@content-desc="Confirm PIN" or @content-desc="CONFIRM PIN"]',
            '//android.widget.Button[contains(@content-desc, "Confirm PIN")]'
        ]);
    }

    /**
     * Hold to Pay button ("Hold to Pay")
     */
    async getHoldToPayButton() {
        return await this.findFirstElement([
            '~Hold to Pay',
            '//*[@resource-id="core.tap_and_hold_button"]',
            '//android.widget.Button[@content-desc="Hold to Pay"]'
        ]);
    }

    /**
     * Payment Success Confirmation Sheet ("Your payment is successful")
     */
    async getSuccessConfirmationSheet() {
        return await this.findFirstElement([
            '~Your payment is successful',
            '//*[contains(@content-desc, "Your payment is successful")]',
            '//*[contains(@content-desc, "successful") or contains(@text, "successful")]',
            '//*[contains(@content-desc, "Congratulation")]'
        ]);
    }

    /**
     * No Merchant Registered Error Banner / Sheet ("No merchant is registered with this MSISDN.")
     */
    async getNoMerchantRegisteredError() {
        return await this.findFirstElement([
            '~No merchant is registered with this MSISDN.',
            '//*[contains(@content-desc, "No merchant is registered")]',
            '//*[contains(@text, "No merchant is registered")]',
            '//*[contains(@content-desc, "not registered")]'
        ]);
    }

    /**
     * Continue Button ("Continue")
     */
    async getContinueButton() {
        return await this.findFirstElement([
            '~Continue',
            '//android.widget.Button[@content-desc="Continue" or @content-desc="CONTINUE"]',
            '//*[contains(@content-desc, "Continue")]'
        ]);
    }

    /**
     * Close Button on error dialogs ("Close")
     */
    async getCloseButton() {
        return await this.findFirstElement([
            '~Close',
            '//android.widget.Button[@content-desc="Close" or @content-desc="CLOSE"]',
            '//*[contains(@content-desc, "Close")]'
        ]);
    }

    /**
     * Invalid PIN / Wrong PIN Error Banner or Dialog
     */
    async getInvalidPinError() {
        return await this.findFirstElement([
            '//*[contains(@content-desc, "Invalid PIN") or contains(@content-desc, "incorrect PIN") or contains(@text, "Invalid PIN")]',
            '//*[contains(@content-desc, "Invalid") or contains(@text, "Invalid")]',
            '~Invalid PIN'
        ]);
    }

    /**
     * Dismisses any popup dialog / alert
     */
    async dismissAlert() {
        try {
            const btn = await this.findFirstElement([
                '//android.widget.Button[@content-desc="OK" or @content-desc="Ok" or @content-desc="Close" or @content-desc="Dismiss"]',
                '~OK',
                '~Close',
                '//*[@resource-id="android:id/button1"]'
            ], 2000);
            if (await btn.isExisting() && await btn.isDisplayed()) {
                await btn.click();
            }
        } catch (e) { }
    }

    /**
     * Back to Home / Close button on Success Sheet
     */
    async getBackToHomeButton() {
        return await this.findFirstElement([
            '//android.widget.Button[@content-desc="Home" or @content-desc="Back to Home" or @content-desc="HOME"]',
            '//*[@content-desc="Home" or @content-desc="Back to Home"]'
        ]);
    }

    // ====================
    // Action Methods
    // ====================

    /**
     * Navigates to Payment screen from Home dashboard tile
     */
    async navigateToPayment() {
        Logger.info('Navigating to Merchant Payment screen...');
        let tile = await this.getPaymentServiceTile();
        let retries = 0;
        while (!(await tile.isExisting() && await tile.isDisplayed()) && retries < 5) {
            Logger.info(`Not on Home Dashboard (attempt ${retries + 1}), returning to Home...`);
            const homeBtn = await this.getBackToHomeButton();
            if (await homeBtn.isExisting() && await homeBtn.isDisplayed()) {
                await homeBtn.click();
                if (typeof driver !== 'undefined' && driver.pause) await driver.pause(1500);
            } else if (typeof driver !== 'undefined' && driver.back) {
                try { await driver.back(); } catch (e) { }
                if (typeof driver !== 'undefined' && driver.pause) await driver.pause(1200);
            }
            tile = await this.getPaymentServiceTile();
            retries++;
        }

        if (await tile.isExisting() && await tile.isDisplayed()) {
            await tile.click();
            if (typeof driver !== 'undefined' && driver.pause) await driver.pause(2000);
        }
    }

    /**
     * Searches and selects merchant recipient number
     */
    async selectMerchantRecipient(phone = '01904555508') {
        Logger.info(`Searching and selecting merchant recipient: ${phone}`);
        const input = await this.getSearchInput();
        if (await input.isExisting() && await input.isDisplayed()) {
            await input.click();
            await input.setValue(phone);
            if (typeof driver !== 'undefined' && driver.pause) await driver.pause(1500);

            const row = await this.getRecipientRow(phone);
            if (await row.isExisting() && await row.isDisplayed()) {
                Logger.info(`Clicking recipient row for ${phone}...`);
                await row.click();
                if (typeof driver !== 'undefined' && driver.pause) await driver.pause(2000);
            }
        }
    }

    /**
     * Enters payment amount into field_merchant_payment.amount_field
     */
    async enterAmount(amount) {
        Logger.info(`Entering payment amount: ${amount}`);
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
     * Enters reference into field_merchant_payment.reference_field
     */
    async enterReference(ref) {
        Logger.info(`Entering payment reference note: ${ref}`);
        const input = await this.getReferenceInput();
        if (await input.isExisting() && await input.isDisplayed()) {
            await input.click();
            await input.setValue(ref);
            await Helpers.hideKeyboard();
            if (typeof driver !== 'undefined' && driver.pause) await driver.pause(500);
        }
    }

    /**
     * Clicks Proceed button
     */
    async clickProceed() {
        Logger.info('Clicking Proceed button...');
        const btn = await this.getProceedButton();
        if (await btn.isExisting() && await btn.isDisplayed()) {
            await btn.click();
            if (typeof driver !== 'undefined' && driver.pause) await driver.pause(1500);
        }
    }

    /**
     * Checks if Proceed button is enabled
     */
    async isProceedButtonEnabled() {
        try {
            const btn = await this.getProceedButton();
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

    /**
     * Enters PIN into field_merchant_payment.pin_field using native keycodes
     */
    async enterPin(pin) {
        Logger.info(`Entering authorization PIN: ${pin}`);
        const pinInput = await this.getPinInput();
        if (await pinInput.isExisting() && await pinInput.isDisplayed()) {
            await pinInput.click();
            if (typeof driver !== 'undefined' && driver.pause) await driver.pause(300);

            const digitMap = { '0': 7, '1': 8, '2': 9, '3': 10, '4': 11, '5': 12, '6': 13, '7': 14, '8': 15, '9': 16 };
            for (const char of pin.toString()) {
                const keycode = digitMap[char];
                if (keycode && typeof driver !== 'undefined' && driver.pressKeyCode) {
                    try {
                        await driver.pressKeyCode(keycode);
                    } catch (e) { }
                }
            }
            await Helpers.hideKeyboard();
            if (typeof driver !== 'undefined' && driver.pause) await driver.pause(500);
        }
    }

    /**
     * Clicks Confirm PIN button
     */
    async clickConfirmPin() {
        Logger.info('Clicking Confirm PIN button...');
        const btn = await this.getConfirmPinButton();
        if (await btn.isExisting() && await btn.isDisplayed()) {
            await btn.click();
            if (typeof driver !== 'undefined' && driver.pause) await driver.pause(1500);
        }
    }

    /**
     * Performs 3.5s Tap and Hold on Hold to Pay button
     */
    async tapAndHoldToPay(holdTimeMs = 3500) {
        Logger.info('Performing 3.5s Tap and Hold gesture on Hold to Pay button...');
        const holdBtn = await this.getHoldToPayButton();
        if (await holdBtn.isExisting() && await holdBtn.isDisplayed()) {
            try {
                const location = await holdBtn.getLocation();
                const size = await holdBtn.getSize();
                const centerX = Math.round(location.x + size.width / 2);
                const centerY = Math.round(location.y + size.height / 2);

                Logger.info(`Holding button down at coordinates (${centerX}, ${centerY}) for ${holdTimeMs}ms...`);
                await driver.action('pointer', { parameters: { pointerType: 'touch' } })
                    .move({ x: centerX, y: centerY })
                    .down({ button: 0 })
                    .pause(holdTimeMs)
                    .up({ button: 0 })
                    .perform();
            } catch (e) {
                Logger.info(`Fallback click on Hold to Pay button: ${e.message}`);
                await holdBtn.click();
            }
            if (typeof driver !== 'undefined' && driver.pause) await driver.pause(3000);
        }
    }

    /**
     * Checks if success confirmation sheet is displayed
     */
    async isSuccessSheetDisplayed() {
        try {
            const sheet = await this.getSuccessConfirmationSheet();
            return await sheet.isExisting() && await sheet.isDisplayed();
        } catch (e) {
            return false;
        }
    }
}

export default new PaymentPage();
