import Logger from './logger.js';

/**
 * Synchronization & explicit waiting utilities for mobile automation.
 */
class WaitUtils {
    /**
     * Waits for an element to be displayed within timeout.
     */
    static async waitForElement(element, timeout = 15000, customMsg = '') {
        const target = await element;
        const msg = customMsg || `Element ${target.selector || ''} to be displayed`;
        Logger.info(`Waiting for: ${msg}`);
        await target.waitForDisplayed({ timeout });
    }

    /**
     * Safely clicks an element.
     */
    static async safeClick(element) {
        const target = await element;
        Logger.info(`Clicking element: ${target.selector || ''}`);
        await target.waitForDisplayed({ timeout: 10000 });
        await target.click();
    }

    /**
     * Safely types text into an input element.
     */
    static async safeSetValue(element, value) {
        const target = await element;
        Logger.info(`Setting input value into: ${target.selector || ''}`);
        await target.waitForDisplayed({ timeout: 10000 });
        try {
            await target.clearValue();
        } catch (e) {
            // Ignore clear error
        }
        await target.setValue(value);
    }
}

export default WaitUtils;
