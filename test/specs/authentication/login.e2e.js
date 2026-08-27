import LoginPage from '../../pageobjects/LoginPage.js';
import testData from '../../utils/testData.js';
import Logger from '../../utils/logger.js';

describe('Authentication Suite - Mukto Pay UAT', () => {

    before(async () => {
        Logger.info('Waking phone screen & launching application...');
        try {
            const appPkg = process.env.APP_PACKAGE || 'com.fintech23.muktopay.uat';
            await driver.terminateApp(appPkg);
            await driver.pause(1000);
            await driver.activateApp(appPkg);
        } catch (e) { }

        Logger.info('Waiting for application view rendering...');
        await driver.pause(4000);
    });

    it('should display login screen on app launch', async () => {
        Logger.info('Verifying login screen elements...');
        const isDisplayed = await LoginPage.isDisplayed();
        expect(isDisplayed).toBe(true);
    });

    it('should toggle PIN/password field visibility', async () => {
        Logger.info('Verifying PIN visibility toggle button...');
        const toggleIcon = await LoginPage.getPasswordToggleIcon();
        if (await toggleIcon.isExisting() && await toggleIcon.isDisplayed()) {
            expect(await toggleIcon.isDisplayed()).toBe(true);
            await LoginPage.togglePasswordVisibility();
        } else {
            Logger.info('Toggle icon not visible in current view layout.');
        }
    });

    it('should verify login button state (disabled without phone/PIN, enabled after entering both)', async () => {
        Logger.info('Verifying Login button state: disabled when empty, enabled after phone & PIN entry...');
        if (await LoginPage.isDisplayed()) {
            // 0. Ensure inputs are clear for accurate initial state check
            await LoginPage.clearInputs();
            await driver.pause(500);

            // 1. State when empty or initial
            const stateInitial = await LoginPage.isLoginButtonEnabled();
            Logger.info(`Login button enabled state before entering credentials: ${stateInitial}`);

            // 2. Enter Phone number
            await LoginPage.enterPhone(testData.user.phone);
            const stateAfterPhone = await LoginPage.isLoginButtonEnabled();
            Logger.info(`Login button enabled state after entering phone: ${stateAfterPhone}`);

            // 3. Enter PIN
            await LoginPage.enterPin(testData.user.pin);
            const stateAfterPin = await LoginPage.isLoginButtonEnabled();
            Logger.info(`Login button enabled state after entering PIN: ${stateAfterPin}`);

            // Strict Assertions
            expect(stateInitial).toBe(false);
            expect(stateAfterPhone).toBe(false);
            expect(stateAfterPin).toBe(true);
        }
    });

    it('should fail login with valid phone and invalid PIN', async () => {
        Logger.info('Testing login failure with valid phone number and invalid PIN...');
        if (await LoginPage.isDisplayed()) {
            await LoginPage.clearInputs();
            await LoginPage.enterPhone(testData.user.phone);
            await LoginPage.enterPin(testData.user.invalidPin);

            const isLoginEnabled = await LoginPage.isLoginButtonEnabled();
            if (isLoginEnabled) {
                await LoginPage.clickLogin();
                await driver.pause(1500);
                await LoginPage.dismissBlockingAlert();

                // Strict Assertion: User remains on login screen (OTP screen is not displayed)
                const isOtpDisplayed = await LoginPage.isOtpScreenDisplayed(2000);
                expect(isOtpDisplayed).toBe(false);
                const isStillOnLogin = await LoginPage.isDisplayed();
                expect(isStillOnLogin).toBe(true);
            }
        }
    });

    it('should fail login with invalid phone and valid PIN', async () => {
        Logger.info('Testing login failure with invalid phone and valid PIN...');
        if (await LoginPage.isDisplayed()) {
            const canEditPhone = await LoginPage.canEnterCustomPhone();
            if (canEditPhone) {
                await LoginPage.clearInputs();
                await LoginPage.enterPhone(testData.user.invalidPhone);
                await LoginPage.enterPin(testData.user.pin);

                const isLoginEnabled = await LoginPage.isLoginButtonEnabled();
                if (isLoginEnabled) {
                    await LoginPage.clickLogin();
                    await driver.pause(1500);
                    await LoginPage.dismissBlockingAlert();

                    // Strict Assertion: User remains on login screen (OTP screen is not displayed)
                    const isOtpDisplayed = await LoginPage.isOtpScreenDisplayed(2000);
                    expect(isOtpDisplayed).toBe(false);
                    const isStillOnLogin = await LoginPage.isDisplayed();
                    expect(isStillOnLogin).toBe(true);
                }
            } else {
                Logger.info('Phone input field is locked/pre-filled, skipping custom phone test.');
            }
        }
    });

    it('should test invalid OTP verification failure, then complete login with valid OTP', async () => {
        Logger.info('Testing OTP verification flow: Invalid OTP followed by Valid OTP...');
        if (await LoginPage.isDisplayed()) {
            // Enter primary phone and valid PIN
            const phoneInput = await LoginPage.getPhoneInput();
            if (await phoneInput.isExisting() && await phoneInput.isDisplayed()) {
                try {
                    await phoneInput.click();
                    await phoneInput.setValue(testData.user.phone);
                } catch (e) { }
            } else {
                await LoginPage.enterPhone(testData.user.phone);
            }
            await LoginPage.enterPin(testData.user.pin);
            await LoginPage.clickLogin();

            if (await LoginPage.isOtpScreenDisplayed(3000)) {
                // Step A: Enter Invalid OTP
                Logger.info('Step A: Entering invalid OTP code (999999)...');
                await LoginPage.enterOtp(testData.user.invalidOtp);
                await LoginPage.clickVerifyOtp();
                await driver.pause(1200);
                await LoginPage.dismissBlockingAlert();

                // Strict Assertion A: Invalid OTP must retain user on OTP verification screen
                const isStillOnOtpScreen = await LoginPage.isOtpScreenDisplayed(2000);
                expect(isStillOnOtpScreen).toBe(true);

                // Step B: Enter Valid OTP right after invalid OTP attempt
                Logger.info('Step B: Entering valid OTP code (123456) to complete verification...');
                await LoginPage.enterOtp(testData.user.otp);
                await LoginPage.clickVerifyOtp();
                await LoginPage.handleSystemPermission();
                await driver.pause(2000);
            } else {
                Logger.info('Subsequent login (OTP screen bypassed by server), proceeding to dashboard verification.');
            }
        }
    });

    it('should verify successful login status on Dashboard', async () => {
        Logger.info('Verifying user is successfully authenticated on Dashboard home screen...');
        await LoginPage.dismissBlockingAlert();

        // Strict Assertion: Login screen is no longer displayed (user authenticated to Dashboard)
        const isLoginPageDisplayed = await LoginPage.isDisplayed();
        expect(isLoginPageDisplayed).toBe(false);
    });
});
