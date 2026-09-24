import Page from './Page.js';
import WaitUtils from '../utils/waitUtils.js';
import Logger from '../utils/logger.js';
import Helpers from '../utils/helpers.js';
import path from 'path';

class LoginPage extends Page {
    // Direct, highly reliable Flutter input locators
    async getPhoneInput() {
        return await this.findFirstElement([
            '//android.widget.EditText[1]',
            'android=new UiSelector().className("android.widget.EditText").instance(0)',
            '//android.view.View[@content-desc="Mobile Number"]/following-sibling::android.widget.EditText[1]'
        ]);
    }

    async getPinInput() {
        return await this.findFirstElement([
            '//*[@resource-id="field_core.pin_field"]',
            '//android.widget.EditText[@resource-id="field_core.pin_field"]',
            'android=new UiSelector().resourceId("field_core.pin_field")',
            '//android.widget.EditText[2]',
            'android=new UiSelector().className("android.widget.EditText").instance(1)',
            '//android.view.View[@content-desc="Enter PIN"]/following-sibling::android.widget.EditText[1]',
            '//android.widget.EditText[last()]'
        ]);
    }

    async getOtpInput() {
        return await this.findFirstElement([
            '//android.view.View[contains(@content-desc, "OTP") or contains(@content-desc, "Verification")]/following-sibling::android.widget.EditText[1]',
            '//android.view.View[contains(@content-desc, "OTP")]//android.widget.EditText[1]'
        ]);
    }

    async getPasswordToggleIcon() {
        return await this.findFirstElement([
            '//android.widget.EditText[2]/following-sibling::android.widget.ImageView[1]',
            '//android.widget.ImageView[last()]',
            '~ic_eye',
            '~toggle_password'
        ]);
    }

    async getLoginButton() {
        return await this.findFirstElement([
            '//android.widget.Button[@content-desc="Login" or @content-desc="LOGIN" or @content-desc="Log In"]',
            '//*[@content-desc="Login" or @content-desc="LOGIN"]',
            '~login.login_button',
            '//*[@resource-id="login.login_button"]'
        ]);
    }

    async getOtpVerifyButton() {
        return await this.findFirstElement([
            '//android.widget.Button[@content-desc="Verify" or @content-desc="VERIFY"]',
            '//*[@content-desc="Verify" or @content-desc="VERIFY"]'
        ]);
    }

    async getErrorMessageBanner() {
        return await this.findFirstElement([
            '//*[contains(@content-desc, "Invalid") or contains(@text, "Invalid")]',
            '//*[contains(@content-desc, "incorrect") or contains(@text, "incorrect")]',
            '~error_message_banner'
        ]);
    }

    /**
     * Checks if the Login button is enabled / interactable.
     */
    async isLoginButtonEnabled() {
        try {
            const el = await this.getLoginButton();
            if (await el.isExisting() && await el.isDisplayed()) {
                const desc = await el.getAttribute('content-desc');
                if (desc && (desc.toLowerCase().includes('login') || desc.toLowerCase().includes('log in'))) {
                    const isEnabled = await el.isEnabled();
                    const enabledAttr = await el.getAttribute('enabled');
                    const clickableAttr = await el.getAttribute('clickable');
                    return isEnabled && enabledAttr !== 'false' && clickableAttr !== 'false';
                }
            }
            return false;
        } catch (e) {
            return false;
        }
    }

    /**
     * Checks if custom phone number entry is allowed (field editable & not locked/pre-filled to primary user).
     */
    async canEnterCustomPhone() {
        try {
            const el = await this.getPhoneInput();
            if (await el.isExisting() && await el.isDisplayed()) {
                const text = await el.getText();
                if (text && text.length > 5) {
                    return false; // Pre-filled / locked to primary user
                }
                return true;
            }
            return false;
        } catch (e) {
            return false;
        }
    }

    /**
     * Fast non-blocking alert check (<100ms). Dismisses alert if present.
     * Includes user-specified check for Close / Re-Try modal dialog on pre-filled 2nd login.
     */
    async dismissBlockingAlert() {
        try {
            // Check accessibility id "Close" or "Re-Try" as instructed
            const closeBtn = await $('~Close');
            const retryBtn = await $('~Re-Try');
            const isClosePresent = (await closeBtn.isExisting() && await closeBtn.isDisplayed());
            const isRetryPresent = (await retryBtn.isExisting() && await retryBtn.isDisplayed());

            if (isClosePresent || isRetryPresent) {
                Logger.info('Detected Close/Re-Try popup on pre-filled login screen!');
                const imgClose = await $('android=new UiSelector().className("android.widget.ImageView")');
                if (await imgClose.isExisting() && await imgClose.isDisplayed()) {
                    Logger.info('Clicking android.widget.ImageView to close popup...');
                    await imgClose.click();
                    if (typeof driver !== 'undefined' && driver.pause) await driver.pause(500);
                } else if (isClosePresent) {
                    await closeBtn.click();
                    if (typeof driver !== 'undefined' && driver.pause) await driver.pause(500);
                }
                return;
            }

            // Check App Update popup dismissal buttons (Later, Not Now, Cancel, Skip, Remind Me Later)
            const updateDismissSelectors = [
                '//*[@content-desc="Later" or @content-desc="LATER" or @content-desc="Not Now" or @content-desc="NOT NOW" or @content-desc="Cancel" or @content-desc="CANCEL" or @content-desc="Skip" or @content-desc="SKIP" or @content-desc="Remind Me Later" or @content-desc="Ignore"]',
                '//*[@text="Later" or @text="LATER" or @text="Not Now" or @text="NOT NOW" or @text="Cancel" or @text="CANCEL" or @text="Skip" or @text="SKIP" or @text="Remind Me Later" or @text="Ignore"]'
            ];
            for (const selector of updateDismissSelectors) {
                const btn = await $(selector);
                if (await btn.isExisting() && await btn.isDisplayed()) {
                    Logger.info(`Dismissing App Update popup via ${selector}...`);
                    await btn.click();
                    if (typeof driver !== 'undefined' && driver.pause) await driver.pause(1000);
                    return;
                }
            }

            const alertBtn = await $('//*[@content-desc="OK" or @content-desc="Ok" or @content-desc="CLOSE" or @content-desc="Close" or @content-desc="Got it" or @content-desc="DISMISS" or @text="OK" or @text="Ok"]');
            if (await alertBtn.isExisting() && await alertBtn.isDisplayed()) {
                Logger.info('Dismissing blocking alert popup...');
                await alertBtn.click();
                if (typeof driver !== 'undefined' && driver.pause) await driver.pause(500);
            }
        } catch (e) { }
    }

    /**
     * Automatically handles Android system permission dialogs (e.g. Notification & Location permissions).
     */
    async handleSystemPermission() {
        try {
            const permissionSelectors = [
                '//*[@resource-id="com.android.permissioncontroller:id/permission_allow_button"]',
                '//*[@resource-id="com.android.permissioncontroller:id/permission_allow_foreground_only_button"]',
                '//*[@resource-id="android:id/button1"]',
                '//*[@text="Allow" or @text="ALLOW" or @content-desc="Allow" or @content-desc="ALLOW"]',
                '//*[contains(@text, "While using the app") or contains(@text, "WHILE USING THE APP") or contains(@content-desc, "While using the app")]'
            ];

            for (let round = 0; round < 3; round++) {
                let clickedAny = false;
                for (const selector of permissionSelectors) {
                    const btn = await $(selector);
                    if (await btn.isExisting() && await btn.isDisplayed()) {
                        Logger.info(`Granting Android system permission dialog (round ${round + 1}) via ${selector}...`);
                        await btn.click();
                        clickedAny = true;
                        if (typeof driver !== 'undefined' && driver.pause) await driver.pause(1000);
                        break;
                    }
                }
                if (!clickedAny) break;
            }
        } catch (e) { }
    }

    /**
     * Clears phone and PIN input fields to reset login form state.
     */
    async clearInputs() {
        try {
            const phone = await this.getPhoneInput();
            if (await phone.isExisting() && await phone.isDisplayed()) {
                await phone.click();
                if (typeof driver !== 'undefined' && driver.pressKeyCode) {
                    for (let i = 0; i < 15; i++) {
                        try { await driver.pressKeyCode(67); } catch (e) { }
                    }
                }
                try { await phone.clear(); } catch (e) { }
            }
            const pin = await this.getPinInput();
            if (await pin.isExisting() && await pin.isDisplayed()) {
                await pin.click();
                if (typeof driver !== 'undefined' && driver.pressKeyCode) {
                    for (let i = 0; i < 15; i++) {
                        try { await driver.pressKeyCode(67); } catch (e) { }
                    }
                }
                try { await pin.clear(); } catch (e) { }
            }
            await Helpers.hideKeyboard();
        } catch (e) { }
    }

    /**
     * Smart Phone Entry: Handles both fresh input and pre-filled/locked phone fields.
     */
    async enterPhone(phone) {
        await this.dismissBlockingAlert();
        await this.handleSystemPermission();

        const el = await this.getPhoneInput();
        if (await el.isExisting() && await el.isDisplayed()) {
            try {
                const currentText = await el.getText();
                Logger.info(`Phone input field current value: "${currentText}", target value: "${phone}"`);

                if (currentText && currentText.includes(phone.slice(-6))) {
                    Logger.info(`Phone number ${phone} is already pre-filled.`);
                    await Helpers.hideKeyboard();
                    return;
                }
                Logger.info(`Clearing phone field and entering target phone number: ${phone}`);
                await el.click();
                if (typeof driver !== 'undefined' && driver.pressKeyCode) {
                    for (let i = 0; i < 15; i++) {
                        try { await driver.pressKeyCode(67); } catch (e) { }
                    }
                }
                try { await el.clear(); } catch (e) { }
                await el.setValue(phone);
                await Helpers.hideKeyboard();
                if (typeof driver !== 'undefined' && driver.pause) await driver.pause(500);
            } catch (e) {
                Logger.error(`Failed to enter phone number ${phone}: ${e.message}`);
                await Helpers.hideKeyboard();
            }
        } else {
            Logger.info('Phone input not displayed, skipping enterPhone.');
        }
    }

    /**
     * Rapid native keycode PIN entry with instant backspace erasure.
     */
    async enterPin(pin) {
        await this.dismissBlockingAlert();
        await this.handleSystemPermission();
        await Helpers.hideKeyboard();

        const el = await this.getPinInput();
        if (await el.isExisting() && await el.isDisplayed()) {
            Logger.info(`Entering user PIN: ${pin}`);
            await el.click();

            // Fast backspaces to erase any existing digits from previous attempts (~30ms total)
            if (typeof driver !== 'undefined' && driver.pressKeyCode) {
                for (let i = 0; i < 8; i++) {
                    try { await driver.pressKeyCode(67); } catch (e) { }
                }
            }

            // Instant native Android keycodes dispatch for Flutter PIN field
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
        } else {
            Logger.info('PIN input field not displayed (app on Dashboard), skipping enterPin.');
        }
    }

    /**
     * Rapid native keycode OTP entry on OTP verification screen.
     */
    async enterOtp(otp = '123456') {
        await this.handleSystemPermission();
        const el = await this.getOtpInput();
        if (await el.isExisting() && await el.isDisplayed()) {
            Logger.info(`Entering OTP code on verification screen: ${otp}`);
            await el.click();
            if (typeof driver !== 'undefined' && driver.pressKeyCode) {
                for (let i = 0; i < 8; i++) {
                    try { await driver.pressKeyCode(67); } catch (e) { }
                }
            }
            const digitMap = { '0': 7, '1': 8, '2': 9, '3': 10, '4': 11, '5': 12, '6': 13, '7': 14, '8': 15, '9': 16 };
            for (const char of otp.toString()) {
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

    async togglePasswordVisibility() {
        Logger.info('Toggling password visibility...');
        const el = await this.getPasswordToggleIcon();
        if (await el.isExisting() && await el.isDisplayed()) {
            await el.click();
        }
    }

    async clickLogin() {
        const el = await this.getLoginButton();
        if (await el.isExisting() && await el.isDisplayed()) {
            const desc = await el.getAttribute('content-desc');
            if (desc && (desc.toLowerCase().includes('login') || desc.toLowerCase().includes('log in'))) {
                Logger.info('Clicking Login button...');
                await el.click();
                if (typeof driver !== 'undefined' && driver.pause) await driver.pause(1500);
                await this.handleSystemPermission();
            } else {
                Logger.info('Element is not Login button, skipping clickLogin.');
            }
        } else {
            Logger.info('Login button not displayed (already on Dashboard), skipping clickLogin.');
        }
    }

    async clickVerifyOtp() {
        try {
            const el = await this.getOtpVerifyButton();
            if (await el.isExisting() && await el.isDisplayed()) {
                const desc = await el.getAttribute('content-desc');
                if (desc && desc.toLowerCase().includes('verify')) {
                    Logger.info('Clicking Verify OTP button...');
                    await el.click();
                    if (typeof driver !== 'undefined' && driver.pause) await driver.pause(1000);
                    await this.handleSystemPermission();
                } else {
                    Logger.info('Element is not Verify OTP button, skipping clickVerifyOtp.');
                }
            } else {
                Logger.info('Verify OTP button not displayed, skipping clickVerifyOtp.');
            }
        } catch (e) { }
    }

    /**
     * Smart Unified Login Method: Handles 1st time login (OTP + permissions) & subsequent login (pre-filled) automatically.
     */
    async login(phone, pin, otp = '123456') {
        Logger.step('Performing Mukto Pay Login');
        if (await this.isDisplayed()) {
            await this.enterPhone(phone);
            await this.enterPin(pin);
            await this.clickLogin();

            if (await this.isOtpScreenDisplayed(3000)) {
                Logger.info('First-time device login detected: Completing OTP & Permissions...');
                try {
                    await this.enterOtp(otp);
                    await this.clickVerifyOtp();
                    await this.handleSystemPermission();
                } catch (e) { }
            }
        } else {
            Logger.info('Already on Dashboard: Direct authentication complete!');
        }
    }

    async isDisplayed() {
        try {
            await this.dismissBlockingAlert();
            const el = await this.getLoginButton();
            if (await el.isExisting() && await el.isDisplayed()) {
                const desc = await el.getAttribute('content-desc');
                return desc && (desc.toLowerCase().includes('login') || desc.toLowerCase().includes('log in'));
            }
            return false;
        } catch (e) {
            return false;
        }
    }

    /**
     * Strict check: ONLY returns true if an actual OTP input field is visible on screen.
     */
    async isOtpScreenDisplayed(timeout = 3000) {
        try {
            const otpField = await $('//android.view.View[contains(@content-desc, "OTP") or contains(@content-desc, "Verification")]/following-sibling::android.widget.EditText[1]');
            return await otpField.isExisting() && await otpField.isDisplayed();
        } catch (e) {
            return false;
        }
    }

    /**
     * Resets app data via Appium removeApp/installApp to unbind device session, re-activates app, and logs in as target user.
     */
    async resetSessionAndLogin(phone, pin, otp = '123456') {
        const appPkg = process.env.APP_PACKAGE || 'com.fintech23.muktopay.uat';
        const appPath = path.resolve(process.cwd(), process.env.APP_PATH || './apps/app-uat-release.apk');
        Logger.info(`FORCED SESSION UNBIND: Reinstalling ${appPkg} to clear device binding and switch user to ${phone}...`);

        try {
            if (typeof driver !== 'undefined' && driver.removeApp) {
                if (await driver.isAppInstalled(appPkg)) {
                    Logger.info(`Uninstalling ${appPkg} to wipe storage...`);
                    await driver.removeApp(appPkg);
                    if (typeof driver !== 'undefined' && driver.pause) await driver.pause(1000);
                }
                Logger.info(`Reinstalling ${appPkg} from ${appPath}...`);
                await driver.installApp(appPath);
                if (typeof driver !== 'undefined' && driver.pause) await driver.pause(2000);
            }
        } catch (e) {
            Logger.info(`App reinstall unbind note: ${e.message}`);
        }

        try {
            Logger.info(`Launching fresh ${appPkg} instance...`);
            await driver.activateApp(appPkg);
            if (typeof driver !== 'undefined' && driver.pause) await driver.pause(3000);
            await this.handleSystemPermission();
        } catch (e) { }

        Logger.info(`Executing full login flow for target user: ${phone}...`);
        await this.enterPhone(phone);
        await this.enterPin(pin);
        await this.clickLogin();

        if (await this.isOtpScreenDisplayed(3500)) {
            Logger.info('OTP verification screen detected: Entering OTP and verifying...');
            await this.enterOtp(otp);
            await this.clickVerifyOtp();
            await this.handleSystemPermission();
        }
        if (typeof driver !== 'undefined' && driver.pause) await driver.pause(2500);
    }
}

export default new LoginPage();
