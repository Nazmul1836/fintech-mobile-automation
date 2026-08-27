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
}

export default new RequestMoneyPage();
