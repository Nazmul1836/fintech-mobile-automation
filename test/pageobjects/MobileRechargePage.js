import BasePage from './Page.js';
import LoginPage from './LoginPage.js';
import Logger from '../utils/logger.js';
import Helpers from '../utils/helpers.js';
import testData from '../utils/testData.js';

/**
 * Mobile Recharge Page Object for Mukto Pay UAT financial test automation.
 */
class MobileRechargePage extends BasePage {
    /**
     * Service tile on Home dashboard
     */
    async getRechargeServiceTile() {
        return await this.findFirstElement([
            'android=new UiSelector().resourceId("dashboard.home.service_tile.recharge")',
            '~dashboard.home.service_tile.recharge',
            '//android.widget.Button[contains(@resource-id, "recharge")]',
            '//*[contains(@content-desc, "Mobile Recharge") or contains(@content-desc, "Recharge")]'
        ], 10000);
    }

    /**
     * Navigates to Mobile Recharge screen from Home dashboard
     */
    async navigateToMobileRecharge() {
        Logger.info('Navigating to Mobile Recharge from Home dashboard...');
        if (await LoginPage.isDisplayed()) {
            Logger.info('Login screen detected on navigate: Logging in user...');
            await LoginPage.login(testData.user.phone, testData.user.pin, testData.user.otp);
            await driver.pause(2000);
        }

        const tile = await this.getRechargeServiceTile();
        await tile.waitForDisplayed({ timeout: 10000 });
        await tile.click();
        if (typeof driver !== 'undefined' && driver.pause) await driver.pause(2000);
    }

    /**
     * Phone / Search Input field on Mobile Recharge screen
     */
    async getPhoneInput() {
        return await this.findFirstElement([
            '//android.widget.EditText[1]',
            '//android.widget.EditText',
            '//*[@resource-id="recharge.phone_input"]'
        ], 5000);
    }

    /**
     * Continue button after entering phone number (exact Appium Inspector selectors)
     */
    async getContinueButton() {
        return await this.findFirstElement([
            '//android.widget.Button[@content-desc="Continue"]',
            'android=new UiSelector().description("Continue")',
            '~Continue',
            '//android.view.View[@content-desc="Continue"]',
            '//*[contains(@content-desc, "Continue")]'
        ], 5000);
    }

    /**
     * Clicks suggested phone number item card from search suggestions list (e.g. 0\n01855853271\n01855853271)
     */
    async selectSuggestedNumber(phone) {
        Logger.info(`Selecting suggested number card for ${phone}...`);
        try {
            const item = await this.findFirstElement([
                `//android.view.View[contains(@content-desc, "${phone}")]`,
                `android=new UiSelector().descriptionContains("${phone}")`,
                `//*[contains(@content-desc, "${phone}")]`
            ], 3000);
            if (await item.isExisting() && await item.isDisplayed()) {
                await item.click();
                if (typeof driver !== 'undefined' && driver.pause) await driver.pause(1500);
            }
        } catch (e) {
            Logger.info(`Suggested number card note: ${e.message}`);
        }
    }

    /**
     * Clicks recent contact card (specifically targets the list item card, avoiding the search bar)
     */
    async selectRecentContact(name = 'Ammu') {
        Logger.info(`Selecting recent contact card for ${name}...`);
        const item = await this.findFirstElement([
            `//android.view.View[contains(@content-desc, "${name}") and contains(@content-desc, "017")]`,
            `android=new UiSelector().descriptionContains("${name}").descriptionContains("017")`,
            `//*[contains(@content-desc, "01712188953")]`,
            `//android.view.View[contains(@content-desc, "${name}")]`
        ], 5000);
        await item.waitForDisplayed({ timeout: 5000 });
        await item.click();
        if (typeof driver !== 'undefined' && driver.pause) await driver.pause(1500);
    }

    /**
     * Operator Selection tile (Robi, Grameenphone, Banglalink, Teletalk, Airtel)
     */
    async getOperatorTile(operatorName = 'Robi') {
        return await this.findFirstElement([
            `~${operatorName}`,
            `//android.view.View[@content-desc="${operatorName}"]`,
            `//android.widget.Button[@content-desc="${operatorName}"]`,
            `//*[contains(@content-desc, "${operatorName}")]`
        ], 5000);
    }

    /**
     * Amount Input field
     */
    async getAmountInput() {
        return await this.findFirstElement([
            '//android.widget.EditText[1]',
            '//android.widget.EditText'
        ], 5000);
    }

    /**
     * Proceed button on Amount screen
     */
    async getProceedButton() {
        return await this.findFirstElement([
            '~Proceed',
            '//android.widget.Button[@content-desc="Proceed"]',
            '//android.view.View[@content-desc="Proceed"]',
            '//android.widget.ImageView[contains(@content-desc, "Proceed")]',
            '//*[contains(@content-desc, "Proceed")]',
            '//android.widget.Button[last()]'
        ], 5000);
    }

    /**
     * PIN entry field
     */
    async getPinInput() {
        return await this.findFirstElement([
            '//*[@resource-id="field_mobile_recharge.pin_field"]',
            'android=new UiSelector().resourceId("field_mobile_recharge.pin_field")',
            '//android.widget.EditText[@resource-id="field_mobile_recharge.pin_field"]',
            '//android.widget.EditText',
            '//android.widget.EditText[1]'
        ], 5000);
    }

    /**
     * Confirm PIN button
     */
    async getConfirmPinButton() {
        return await this.findFirstElement([
            '~Confirm PIN',
            '//android.widget.Button[@content-desc="Confirm PIN"]',
            '//android.view.View[@content-desc="Confirm PIN"]',
            '//*[contains(@content-desc, "Confirm PIN")]',
            '//*[contains(@content-desc, "Confirm")]'
        ], 5000);
    }

    /**
     * Hold to Pay button
     */
    async getHoldToPayButton() {
        return await this.findFirstElement([
            '~Hold to Pay',
            '//android.widget.Button[@content-desc="Hold to Pay"]',
            '//android.view.View[@content-desc="Hold to Pay"]',
            '//*[contains(@content-desc, "Hold to Pay") or contains(@content-desc, "Hold")]',
            '//android.widget.ImageView[contains(@content-desc, "Hold")]',
            '//*[contains(@content-desc, "Pay")]'
        ], 10000);
    }

    /**
     * Home button on success confirmation sheet
     */
    async getHomeButton() {
        return await this.findFirstElement([
            '~Home',
            '//android.widget.Button[@content-desc="Home"]',
            '//android.view.View[@content-desc="Home"]',
            '~Back to Home',
            '//*[contains(@content-desc, "Home")]'
        ], 5000);
    }

    /**
     * Enters PIN into EditText using exact Auto Pay / Favorite PIN entry method
     */
    async enterPin(pin = '12121') {
        Logger.info(`Entering PIN ${pin} via Auto Pay native keycodes method...`);
        const pinInput = await this.findFirstElement([
            '//android.widget.EditText',
            '//*[@resource-id="field_mobile_recharge.pin_field"]',
            '//*[@resource-id="field_core.pin_field"]',
            'android=new UiSelector().className("android.widget.EditText")'
        ], 5000);

        if (await pinInput.isExisting() && await pinInput.isDisplayed()) {
            try { await pinInput.click(); } catch (e) { }
            if (typeof driver !== 'undefined' && driver.pause) await driver.pause(300);
        }

        // Fast backspaces to clear any leftover digits
        if (typeof driver !== 'undefined' && driver.pressKeyCode) {
            for (let i = 0; i < 6; i++) {
                try { await driver.pressKeyCode(67); } catch (e) { }
            }
            if (typeof driver !== 'undefined' && driver.pause) await driver.pause(200);

            // Send PIN digits via native keycodes with 150ms delay to fire Flutter onChanged events
            const digitMap = { '0': 7, '1': 8, '2': 9, '3': 10, '4': 11, '5': 12, '6': 13, '7': 14, '8': 15, '9': 16 };
            for (const char of pin.toString()) {
                const keycode = digitMap[char];
                if (keycode) {
                    try { await driver.pressKeyCode(keycode); } catch (err) { }
                    if (typeof driver !== 'undefined' && driver.pause) await driver.pause(150);
                }
            }
        }
        await Helpers.hideKeyboard();
        if (typeof driver !== 'undefined' && driver.pause) await driver.pause(800);
    }

    /**
     * Performs Hold to Pay gesture (touch down -> hold 3500ms -> touch up)
     */
    async performHoldToPay(holdTimeMs = 3500) {
        Logger.info('Performing Hold to Pay gesture for Mobile Recharge...');
        const holdBtn = await this.getHoldToPayButton();
        await holdBtn.waitForDisplayed({ timeout: 10000 });

        if (await holdBtn.isExisting() && await holdBtn.isDisplayed()) {
            try {
                const location = await holdBtn.getLocation();
                const size = await holdBtn.getSize();
                const centerX = Math.round(location.x + size.width / 2);
                const centerY = Math.round(location.y + size.height / 2);

                await driver.action('pointer', { parameters: { pointerType: 'touch' } })
                    .move({ x: centerX, y: centerY })
                    .down({ button: 0 })
                    .pause(holdTimeMs)
                    .up({ button: 0 })
                    .perform();
            } catch (e) {
                Logger.info(`Fallback click on Hold to Pay: ${e.message}`);
                await holdBtn.click();
            }
            if (typeof driver !== 'undefined' && driver.pause) await driver.pause(3000);
        }
    }
}

export default new MobileRechargePage();
