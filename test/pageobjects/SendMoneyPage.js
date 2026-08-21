import Page from './Page.js';
import WaitUtils from '../utils/waitUtils.js';
import Logger from '../utils/logger.js';
import Helpers from '../utils/helpers.js';

class SendMoneyPage extends Page {
    // ====================
    // Locators
    // ====================

    /**
     * Send Money Service tile on Home Dashboard screen
     */
    async getSendMoneyServiceTile() {
        return await this.findFirstElement([
            '~dashboard.home.menu_tile.send_money',
            '//*[@resource-id="dashboard.home.menu_tile.send_money"]',
            'android=new UiSelector().resourceId("dashboard.home.menu_tile.send_money")',
            '//android.widget.ImageView[contains(@content-desc, "Send Money")]'
        ]);
    }

    /**
     * Phonebook search or mobile number entry field
     */
    async getContactSearchInput() {
        return await this.findFirstElement([
            '//*[@resource-id="core.search_field"]',
            '~core.search_field',
            '//android.widget.EditText[@resource-id="core.search_field"]',
            '//android.widget.EditText[1]'
        ]);
    }

    /**
     * Non-Mukto Pay Action Button
     */
    async getNonMuktoPayAction() {
        return await this.findFirstElement([
            '//*[@resource-id="send_money.non_mukto_pay_action"]',
            '~send_money.non_mukto_pay_action'
        ]);
    }

    /**
     * Favorite Numbers Action Button / Tab
     */
    async getFavoriteNumbersAction() {
        return await this.findFirstElement([
            '//*[@resource-id="send_money.favorite_numbers_action"]',
            '~send_money.favorite_numbers_action',
            '//android.widget.ImageView[contains(@content-desc, "Favorite Numbers")]',
            '//*[contains(@content-desc, "Favorite Numbers")]'
        ]);
    }

    /**
     * Add Favorite Button ("+ Add Favorite")
     */
    async getAddFavoriteButton() {
        return await this.findFirstElement([
            '//*[contains(@content-desc, "Add Favorite")]',
            '~Add Favorite',
            '~+ Add Favorite',
            '//android.widget.Button[contains(@content-desc, "Add Favorite")]',
            'android=new UiSelector().descriptionContains("Add Favorite")'
        ]);
    }

    /**
     * PIN field for Add Favorite ("core.pin_field")
     */
    async getFavoritePinInput() {
        return await this.findFirstElement([
            '//*[@resource-id="core.pin_field"]',
            '//android.widget.EditText[@resource-id="core.pin_field"]',
            'android=new UiSelector().resourceId("core.pin_field")'
        ]);
    }

    /**
     * Clears prefilled name field and sets custom favorite name
     */
    async setFavoriteName(name = 'Test Name') {
        Logger.info(`Setting Favorite Name to: ${name}`);
        const nameInput = await this.findFirstElement([
            '//android.widget.EditText[2]',
            'android=new UiSelector().className("android.widget.EditText").instance(1)',
            '//android.widget.EditText[contains(@text, "Name") or contains(@text, "018")]'
        ]);

        if (await nameInput.isExisting() && await nameInput.isDisplayed()) {
            await nameInput.click();
            if (typeof driver !== 'undefined' && driver.pressKeyCode) {
                for (let i = 0; i < 15; i++) {
                    try { await driver.pressKeyCode(67); } catch (e) { }
                }
            }
            await nameInput.setValue(name);
            await Helpers.hideKeyboard();
            if (typeof driver !== 'undefined' && driver.pause) await driver.pause(500);
        }
    }

    /**
     * Deletes a favorite item from the Favorite Numbers list screen by entering PIN
     */
    async deleteFavoriteItem(phone, pin = '12121') {
        Logger.info(`Deleting favorite item for phone: ${phone}...`);
        const cleanPhone = phone.toString().replace(/^\+88/, '').replace(/^88/, '');
        
        const deleteBtn = await this.findFirstElement([
            `//*[contains(@content-desc, "${cleanPhone}")]//following-sibling::*`,
            `//*[contains(@content-desc, "${cleanPhone}")]/..//android.widget.ImageView[last()]`,
            `//android.widget.ImageView[contains(@content-desc, "${cleanPhone}")]`,
            '//android.widget.ImageView[contains(@content-desc, "delete") or contains(@content-desc, "remove")]'
        ], 3000);

        if (await deleteBtn.isExisting() && await deleteBtn.isDisplayed()) {
            await deleteBtn.click();
            if (typeof driver !== 'undefined' && driver.pause) await driver.pause(1500);

            // Enter PIN to confirm deletion
            const pinInput = await this.getFavoritePinInput();
            if (await pinInput.isExisting() && await pinInput.isDisplayed()) {
                Logger.info('Entering PIN to confirm favorite removal...');
                await this.enterFavoritePin(pin);
                await driver.pause(1000);
                await this.clickConfirmPin();
                await driver.pause(2000);

                // Dismiss "Successful! ... Removed." dialog sheet by clicking "Go to Favorite"
                const goToFavBtn = await this.findFirstElement([
                    '//android.widget.Button[@content-desc="Go to Favorite" or contains(@content-desc, "Go to Favorite")]',
                    '~Go to Favorite',
                    '//*[contains(@content-desc, "Go to Favorite")]'
                ], 3000);
                if (await goToFavBtn.isExisting() && await goToFavBtn.isDisplayed()) {
                    Logger.info('Clicking "Go to Favorite" button to dismiss removal success popup...');
                    await goToFavBtn.click();
                    await driver.pause(1500);
                }
            }
        }
    }

    /**
     * Add Favorite Success Screen / Sheet
     */
    async getAddFavoriteSuccessSheet() {
        return await this.findFirstElement([
            '//*[contains(@content-desc, "add successful") or contains(@content-desc, "Your Favorite Number")]',
            '//*[contains(@content-desc, "Congratulation")]'
        ]);
    }

    /**
     * No Matching Account Found Error Banner
     */
    async getNoMatchingAccountError() {
        return await this.findFirstElement([
            '//*[contains(@content-desc, "no matching account") or contains(@content-desc, "No matching account") or contains(@text, "No matching account")]',
            '//*[contains(@content-desc, "not found") or contains(@text, "not found")]'
        ]);
    }

    /**
     * Auto Pay Action Tile / Tab
     */
    async getAutoPayAction() {
        return await this.findFirstElement([
            '//*[contains(@content-desc, "Auto Pay")]',
            '//*[@resource-id="send_money.auto_pay_action"]',
            '~send_money.auto_pay_action',
            'android=new UiSelector().descriptionContains("Auto Pay")'
        ]);
    }

    /**
     * Enable New Auto Pay Button
     */
    async getEnableNewAutoPayButton() {
        return await this.findFirstElement([
            '~Enable New Auto Pay',
            '//android.widget.Button[contains(@content-desc, "Enable New Auto Pay")]',
            '//*[contains(@content-desc, "Enable New Auto Pay")]',
            'android=new UiSelector().descriptionContains("Enable New Auto Pay")'
        ]);
    }

    /**
     * Auto Pay Service Selection - Send Money
     */
    async getAutoPayServiceSendMoney() {
        return await this.findFirstElement([
            '~Send Money',
            '//android.widget.Button[@content-desc="Send Money"]',
            '//*[contains(@content-desc, "Send Money")]'
        ]);
    }

    /**
     * Auto Pay Amount Input (Second EditText on Auto Pay Form screen)
     */
    async getAutoPayAmountInput() {
        return await this.findFirstElement([
            'android=new UiSelector().className("android.widget.EditText").instance(1)',
            '//android.widget.EditText[2]',
            '//android.widget.EditText[contains(@text, "200") or contains(@text, "Amount")]'
        ]);
    }

    /**
     * Auto Pay Frequency Option ("Every 30 Days")
     */
    async getAutoPayFrequencyOption() {
        return await this.findFirstElement([
            '//android.widget.RadioButton[contains(@content-desc, "Every 30 Days")]',
            'android=new UiSelector().descriptionContains("Every 30 Days")',
            '//*[contains(@content-desc, "Every 30 Days")]',
            '~Every 30 Days'
        ]);
    }

    /**
     * Continue Button
     */
    async getContinueButton() {
        return await this.findFirstElement([
            '~Continue',
            '//android.widget.Button[@content-desc="Continue"]',
            '//android.widget.Button[contains(@content-desc, "Continue")]',
            '//*[contains(@content-desc, "Continue")]'
        ]);
    }

    /**
     * Confirm Deletion "Yes" Button
     */
    async getConfirmYesButton() {
        return await this.findFirstElement([
            '~Yes',
            '//android.widget.Button[@content-desc="Yes"]',
            '//*[contains(@content-desc, "Yes")]'
        ]);
    }

    /**
     * Deletes an Auto Pay item for the specified phone number by clicking trash icon, entering PIN, and confirming.
     */
    async deleteAutoPayItem(phone = '01833183699', pin = '12121') {
        Logger.info(`Deleting Auto Pay item for phone ${phone}...`);
        const cleanPhone = phone.toString().replace(/^\+88/, '').replace(/^88/, '');

        const deleteIcon = await this.findFirstElement([
            `//*[contains(@content-desc, "${cleanPhone}")]/..//android.widget.ImageView[last()]`,
            `//*[contains(@content-desc, "${cleanPhone}")]//following-sibling::android.widget.ImageView`,
            'android=new UiSelector().className("android.widget.ImageView").instance(3)',
            '//android.widget.ImageView[contains(@content-desc, "delete") or contains(@content-desc, "remove")]',
            '//android.widget.ImageView[last()]'
        ], 3000);

        if (await deleteIcon.isExisting() && await deleteIcon.isDisplayed()) {
            await deleteIcon.click();
            if (typeof driver !== 'undefined' && driver.pause) await driver.pause(1500);

            const yesBtn = await this.getConfirmYesButton();
            if (await yesBtn.isExisting() && await yesBtn.isDisplayed()) {
                Logger.info('Clicking "Yes" button on deletion confirmation dialog...');
                await yesBtn.click();
                if (typeof driver !== 'undefined' && driver.pause) await driver.pause(1500);

                const pinInput = await this.getFavoritePinInput();
                if (await pinInput.isExisting() && await pinInput.isDisplayed()) {
                    Logger.info('Entering PIN to confirm Auto Pay removal...');
                    await this.enterFavoritePin(pin);
                    if (typeof driver !== 'undefined' && driver.pause) await driver.pause(1000);
                    await this.clickConfirmPin();
                    if (typeof driver !== 'undefined' && driver.pause) await driver.pause(2000);
                }
            }
        }
    }

    /**
     * Amount input field on Send Money screen
     */
    async getAmountInput() {
        return await this.findFirstElement([
            '//android.widget.EditText[contains(@text, "Amount") or contains(@text, "0")]',
            '//android.widget.EditText[1]',
            'android=new UiSelector().className("android.widget.EditText").instance(0)'
        ]);
    }

    /**
     * Reference / Note input field (optional)
     */
    async getReferenceInput() {
        return await this.findFirstElement([
            '//android.widget.EditText[contains(@text, "Reference") or contains(@text, "Note")]',
            '//android.widget.EditText[2]',
            'android=new UiSelector().className("android.widget.EditText").instance(1)'
        ]);
    }

    /**
     * Proceed / Continue button on Send Money / Amount screen
     */
    async getProceedButton() {
        return await this.findFirstElement([
            '~Proceed',
            '//android.widget.Button[@content-desc="Proceed" or @content-desc="PROCEED"]',
            '//android.widget.Button[contains(@content-desc, "Proceed")]',
            '//*[@content-desc="Proceed"]'
        ]);
    }

    /**
     * PIN entry input on Send Money Confirm screen
     */
    async getPinInput() {
        return await this.findFirstElement([
            '//android.widget.EditText[contains(@text, "PIN") or contains(@text, "Pin")]',
            '//android.widget.EditText[last()]',
            'android=new UiSelector().className("android.widget.EditText").instance(0)'
        ]);
    }

    /**
     * Confirm PIN button on PIN Entry screen ("Confirm PIN")
     */
    async getConfirmPinButton() {
        return await this.findFirstElement([
            '//android.widget.Button[@content-desc="Confirm PIN" or @content-desc="CONFIRM PIN" or @text="Confirm PIN"]',
            '~Confirm PIN',
            '//android.widget.Button[contains(@content-desc, "Confirm PIN")]'
        ]);
    }

    /**
     * Hold to Pay button on final summary review screen ("Hold to Pay")
     */
    async getHoldToPayButton() {
        return await this.findFirstElement([
            '~Hold to Pay',
            '//*[@resource-id="core.tap_and_hold_button"]',
            'android=new UiSelector().resourceId("core.tap_and_hold_button")',
            '//android.widget.Button[@content-desc="Hold to Pay"]'
        ]);
    }

    /**
     * Available Balance text on Send Money screen
     */
    async getAvailableBalanceText() {
        return await this.findFirstElement([
            '//*[contains(@content-desc, "Available Balance") or contains(@content-desc, "Balance")]',
            '//*[contains(@text, "Balance")]'
        ]);
    }

    /**
     * Insufficient Balance Error Banner/Dialog
     */
    async getInsufficientBalanceError() {
        return await this.findFirstElement([
            '//android.view.View[@content-desc="Insufficient Balance"]',
            '~Insufficient Balance',
            '//*[contains(@content-desc, "Insufficient Balance") or contains(@text, "Insufficient Balance")]'
        ]);
    }

    /**
     * Dismisses any modal dialog or popup alert (e.g. OK, Close, Dismiss)
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
     * Validation Error Message Banner / Alert
     */
    async getErrorMessageBanner() {
        return await this.findFirstElement([
            '//*[contains(@content-desc, "Insufficient") or contains(@content-desc, "Invalid") or contains(@content-desc, "Limit") or contains(@content-desc, "minimum")]',
            '//*[contains(@text, "Insufficient") or contains(@text, "Invalid")]'
        ]);
    }

    /**
     * Dynamically parses numerical available wallet balance from UI text
     */
    async getParsedAvailableBalance() {
        try {
            const el = await this.getAvailableBalanceText();
            if (await el.isExisting() && await el.isDisplayed()) {
                const desc = (await el.getAttribute('content-desc')) || (await el.getText()) || '';
                const numbersOnly = desc.replace(/[^0-9.]/g, '');
                const val = parseFloat(numbersOnly);
                if (!isNaN(val) && val > 0) return val;
            }
        } catch (e) { }
        return 32000.00; // Default estimate fallback
    }

    /**
     * Success Confirmation Sheet / Screen ("Congratulation! Your send money is successful")
     */
    async getSuccessConfirmationSheet() {
        return await this.findFirstElement([
            '//*[contains(@content-desc, "Congratulation") or contains(@text, "Congratulation")]',
            '//*[contains(@content-desc, "successful") or contains(@text, "successful")]',
            '//*[contains(@content-desc, "Transaction ID") or contains(@text, "Transaction ID")]',
            '//android.widget.Button[@content-desc="Home" or @content-desc="Share"]'
        ]);
    }

    /**
     * Home / Back to Home button on Success Sheet
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
     * Navigates to Send Money feature from Dashboard tile using exact resource-id
     */
    async navigateToSendMoney() {
        Logger.info('Navigating to Send Money screen...');
        let tile = await this.getSendMoneyServiceTile();
        if (!(await tile.isExisting() && await tile.isDisplayed())) {
            Logger.info('Not on Home Dashboard, returning to Home first...');
            const homeBtn = await this.getBackToHomeButton();
            if (await homeBtn.isExisting() && await homeBtn.isDisplayed()) {
                await homeBtn.click();
                if (typeof driver !== 'undefined' && driver.pause) await driver.pause(1500);
            } else if (typeof driver !== 'undefined' && driver.back) {
                try { await driver.back(); } catch (e) { }
                if (typeof driver !== 'undefined' && driver.pause) await driver.pause(1500);
            }
            tile = await this.getSendMoneyServiceTile();
        }

        if (await tile.isExisting() && await tile.isDisplayed()) {
            await tile.click();
            if (typeof driver !== 'undefined' && driver.pause) await driver.pause(2000);
        }
    }

    /**
     * Enters recipient mobile number in core.search_field and selects the recipient
     */
    async selectRecipient(phone = '01329484257') {
        Logger.info(`Searching and selecting recipient number: ${phone} using core.search_field`);
        const input = await this.getContactSearchInput();
        if (await input.isExisting() && await input.isDisplayed()) {
            await input.click();
            await input.setValue(phone);
            await Helpers.hideKeyboard();
            if (typeof driver !== 'undefined' && driver.pause) await driver.pause(1000);

            // Select the matched contact item or typed number option
            const contactItem = await this.findFirstElement([
                `//*[contains(@content-desc, "${phone}")]`,
                `//android.view.View[contains(@content-desc, "${phone}")]`,
                '//android.widget.ImageView[1]',
                '//android.view.View[2]'
            ]);
            if (await contactItem.isExisting() && await contactItem.isDisplayed()) {
                Logger.info('Clicking matched recipient contact item...');
                await contactItem.click();
                if (typeof driver !== 'undefined' && driver.pause) await driver.pause(1500);
            }
        }
    }

    /**
     * Enters transfer amount
     */
    async enterAmount(amount) {
        Logger.info(`Entering transfer amount: ${amount}`);
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
     * Enters optional reference note
     */
    async enterReference(ref) {
        Logger.info(`Entering transfer reference note: ${ref}`);
        const input = await this.getReferenceInput();
        if (await input.isExisting() && await input.isDisplayed()) {
            await input.click();
            await input.setValue(ref);
            await Helpers.hideKeyboard();
            if (typeof driver !== 'undefined' && driver.pause) await driver.pause(500);
        }
    }

    /**
     * Clicks Proceed / Next button using content-desc="Proceed"
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
     * Enters PIN on confirmation screen using rapid native keycodes
     */
    async enterPin(pin) {
        Logger.info(`Entering authorization PIN: ${pin}`);
        await Helpers.hideKeyboard();
        const pinInput = await this.getPinInput();
        if (await pinInput.isExisting() && await pinInput.isDisplayed()) {
            await pinInput.click();

            // Erase existing digits
            if (typeof driver !== 'undefined' && driver.pressKeyCode) {
                for (let i = 0; i < 8; i++) {
                    try { await driver.pressKeyCode(67); } catch (e) { }
                }
            }

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
        }
    }

    /**
     * Enters PIN into core.pin_field during Add Favorite flow
     */
    async enterFavoritePin(pin) {
        Logger.info(`Entering Favorite PIN into core.pin_field: ${pin}`);
        await Helpers.hideKeyboard();
        const pinInput = await this.getFavoritePinInput();
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
        }
    }

    /**
     * Clicks the purple 'Confirm PIN' button on PIN entry screen
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
     * Performs a 3.5-second Tap and Hold gesture on the 'Hold to Pay' button (core.tap_and_hold_button) to execute transfer
     */
    async tapAndHoldToPay(holdTimeMs = 3500) {
        Logger.info('Performing 3.5s Tap and Hold gesture on Hold to Pay button (core.tap_and_hold_button)...');
        const holdBtn = await this.getHoldToPayButton();
        if (await holdBtn.isExisting() && await holdBtn.isDisplayed()) {
            try {
                const location = await holdBtn.getLocation();
                const size = await holdBtn.getSize();
                const centerX = Math.round(location.x + size.width / 2);
                const centerY = Math.round(location.y + size.height / 2);

                Logger.info(`Holding button down at coordinates (${centerX}, ${centerY}) for ${holdTimeMs}ms...`);

                // Perform W3C Touch Down -> Hold -> Touch Up gesture
                await driver.action('pointer', {
                    parameters: { pointerType: 'touch' }
                })
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

export default new SendMoneyPage();
