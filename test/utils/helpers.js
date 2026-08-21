import Logger from './logger.js';

/**
 * Mobile interaction and application lifecycle helpers.
 */
class Helpers {
    /**
     * Safely hides the mobile software keyboard if currently displayed.
     * Never sends hardware BACK key (keyCode 4) to prevent unintended app navigation.
     */
    static async hideKeyboard() {
        try {
            if (typeof driver !== 'undefined' && driver.isKeyboardShown) {
                const isShown = await driver.isKeyboardShown();
                if (isShown) {
                    await driver.hideKeyboard();
                }
            }
        } catch (err) {
            // Ignore if keyboard is already hidden
        }
    }

    /**
     * Swipes up / scrolls down on mobile screen to reveal lower elements.
     */
    static async scrollDown() {
        Logger.info('Scrolling down to reveal lower fields...');
        try {
            if (typeof driver !== 'undefined' && driver.getWindowSize) {
                const { width, height } = await driver.getWindowSize();
                await driver.performActions([
                    {
                        type: 'pointer',
                        id: 'finger1',
                        parameters: { pointerType: 'touch' },
                        actions: [
                            { type: 'pointerMove', duration: 0, x: Math.floor(width / 2), y: Math.floor(height * 0.7) },
                            { type: 'pointerDown', button: 0 },
                            { type: 'pointerMove', duration: 500, x: Math.floor(width / 2), y: Math.floor(height * 0.3) },
                            { type: 'pointerUp', button: 0 }
                        ]
                    }
                ]);
                await driver.releaseActions();
            }
        } catch (err) {
            Logger.warn(`Scroll gesture skipped: ${err.message}`);
        }
    }
}

export default Helpers;
