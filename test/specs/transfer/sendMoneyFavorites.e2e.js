import LoginPage from '../../pageobjects/LoginPage.js';
import SendMoneyPage from '../../pageobjects/SendMoneyPage.js';
import testData from '../../utils/testData.js';
import Logger from '../../utils/logger.js';

describe('Send Money Favorites Automation Suite - Mukto Pay UAT', () => {

    const targetFavoritePhone = '01833183699';
    const favoriteName = 'Test Favorite';

    before(async () => {
        Logger.info('Performing clean app restart for Favorites test suite...');
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
            Logger.info('Logging in primary user for Favorites suite...');
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

    it('TC 1: should navigate to Favorite Numbers tab and check Add Favorite button state', async () => {
        Logger.info('Navigating to Send Money screen...');
        await SendMoneyPage.navigateToSendMoney();
        await driver.pause(1000);

        Logger.info('Tapping Favorite Numbers action tile...');
        const favTile = await SendMoneyPage.getFavoriteNumbersAction();
        if (await favTile.isExisting() && await favTile.isDisplayed()) {
            await favTile.click();
            await driver.pause(1500);
        }

        const addFavBtn = await SendMoneyPage.getAddFavoriteButton();
        const isExisting = await addFavBtn.isExisting();
        Logger.info(`Add Favorite button existing: ${isExisting}`);
        expect(isExisting).toBe(true);
    });

    it('TC 2: should add registered number 01833183699 to favorite', async () => {
        Logger.info(`Adding registered mobile number ${targetFavoritePhone} as favorite...`);
        const addFavBtn = await SendMoneyPage.getAddFavoriteButton();
        if (await addFavBtn.isExisting() && await addFavBtn.isDisplayed()) {
            await addFavBtn.click();
            await driver.pause(1500);
        }

        Logger.info(`Searching phone number ${targetFavoritePhone} in search input...`);
        const searchInput = await SendMoneyPage.getContactSearchInput();
        if (await searchInput.isExisting() && await searchInput.isDisplayed()) {
            await searchInput.click();
            await searchInput.setValue(targetFavoritePhone);
            await driver.pause(1000);
        }

        Logger.info(`Clicking Add Favorite button after entering phone ${targetFavoritePhone}...`);
        const confirmAddBtn = await SendMoneyPage.getAddFavoriteButton();
        if (await confirmAddBtn.isExisting() && await confirmAddBtn.isDisplayed()) {
            await confirmAddBtn.click();
            await driver.pause(1500);
        }

        Logger.info(`Clearing prefilled Favorite Name field and setting custom name '${favoriteName}'...`);
        await SendMoneyPage.setFavoriteName(favoriteName);
        await driver.pause(1000);

        Logger.info('Clicking Proceed button on Add Favorite form...');
        await SendMoneyPage.clickProceed();
        await driver.pause(1500);

        Logger.info(`Entering favorite PIN ${testData.user.pin} into core.pin_field...`);
        await SendMoneyPage.enterFavoritePin(testData.user.pin);
        await driver.pause(1000);

        await SendMoneyPage.clickConfirmPin();
        await driver.pause(2500);

        const successSheet = await SendMoneyPage.getAddFavoriteSuccessSheet();
        const isSuccess = await successSheet.isExisting();
        Logger.info(`Add Favorite success sheet displayed: ${isSuccess}`);
        expect(isSuccess).toBe(true);
    });

    it('TC 3: 1st Payment - should make payment directly after adding favorite', async () => {
        Logger.info(`Executing 1st payment directly after adding favorite number ${targetFavoritePhone}...`);
        const sendMoneyBtn = await SendMoneyPage.findFirstElement([
            '//android.widget.Button[@content-desc="Send Money"]',
            '~Send Money'
        ], 3000);

        if (await sendMoneyBtn.isExisting() && await sendMoneyBtn.isDisplayed()) {
            await sendMoneyBtn.click();
            await driver.pause(1500);
        } else {
            await SendMoneyPage.selectRecipient(targetFavoritePhone);
            await driver.pause(1500);
        }

        // Enter amount 500 Tk
        await SendMoneyPage.enterAmount(500);
        await SendMoneyPage.enterReference('Favorite Transfer 1');
        await SendMoneyPage.clickProceed();
        await driver.pause(1500);

        // Enter PIN and hold to pay
        await SendMoneyPage.enterPin(testData.user.pin);
        await SendMoneyPage.clickConfirmPin();
        await driver.pause(1500);

        await SendMoneyPage.tapAndHoldToPay(3500);
        await driver.pause(3000);

        const isSuccess = await SendMoneyPage.isSuccessSheetDisplayed();
        Logger.info(`1st Payment to favorite success status: ${isSuccess}`);
        expect(isSuccess).toBe(true);

        const homeBtn = await SendMoneyPage.getBackToHomeButton();
        if (await homeBtn.isExisting()) {
            await homeBtn.click();
            await driver.pause(1500);
        }
    });

    it('TC 4: 2nd Payment - should make payment again by searching favorite number', async () => {
        Logger.info(`Executing 2nd payment by searching favorite number ${targetFavoritePhone} in Favorites list...`);
        
        // 1. Navigate to Send Money screen
        await SendMoneyPage.navigateToSendMoney();
        await driver.pause(1000);

        // 2. Click Favorite Numbers action tile
        const favTile = await SendMoneyPage.getFavoriteNumbersAction();
        if (await favTile.isExisting() && await favTile.isDisplayed()) {
            await favTile.click();
            await driver.pause(1500);
        }

        // 3. Search and select favorite phone number 01833183699 from Favorite list
        const favCard = await SendMoneyPage.findFirstElement([
            `android=new UiSelector().descriptionContains("${targetFavoritePhone}")`,
            `android=new UiSelector().descriptionContains("${favoriteName}")`,
            `//*[contains(@content-desc, "${targetFavoritePhone}")]`,
            `//*[contains(@content-desc, "${favoriteName}")]`
        ], 3000);

        if (await favCard.isExisting() && await favCard.isDisplayed()) {
            Logger.info(`Clicking favorite card item for ${targetFavoritePhone}...`);
            await favCard.click();
            await driver.pause(1500);
        } else {
            await SendMoneyPage.selectRecipient(targetFavoritePhone);
            await driver.pause(1500);
        }

        // 4. Enter amount 500 Tk and reference
        await SendMoneyPage.enterAmount(500);
        await SendMoneyPage.enterReference('Favorite Transfer 2');
        await SendMoneyPage.clickProceed();
        await driver.pause(1500);

        // 5. Enter PIN, click Confirm PIN, and Tap & Hold to Pay
        await SendMoneyPage.enterPin(testData.user.pin);
        await SendMoneyPage.clickConfirmPin();
        await driver.pause(1500);

        await SendMoneyPage.tapAndHoldToPay(3500);
        await driver.pause(3000);

        const isSuccess = await SendMoneyPage.isSuccessSheetDisplayed();
        Logger.info(`2nd Payment by searching favorite number success status: ${isSuccess}`);
        expect(isSuccess).toBe(true);

        // Return Home
        const homeBtn = await SendMoneyPage.getBackToHomeButton();
        if (await homeBtn.isExisting()) {
            await homeBtn.click();
            await driver.pause(1500);
        }
    });

    it('TC 5: should delete the favorite number', async () => {
        Logger.info(`Deleting favorite number ${targetFavoritePhone}...`);
        await SendMoneyPage.navigateToSendMoney();
        await driver.pause(1000);

        const favTile = await SendMoneyPage.getFavoriteNumbersAction();
        if (await favTile.isExisting() && await favTile.isDisplayed()) {
            await favTile.click();
            await driver.pause(1500);
        }

        Logger.info(`Deleting favorite item for phone ${targetFavoritePhone}...`);
        await SendMoneyPage.deleteFavoriteItem(targetFavoritePhone);
        await driver.pause(1500);
    });
});
