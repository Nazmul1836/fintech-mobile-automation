import WaitUtils from '../utils/waitUtils.js';
import Logger from '../utils/logger.js';

/**
 * Base Page Object class containing common elements and navigation helpers.
 */
export default class Page {
    constructor() {
        this.title = 'Mukto Pay Page';
    }

    /**
     * Tries multiple selector strategies with polling until one matches and is displayed.
     */
    async findFirstElement(selectors, timeout = 5000) {
        const startTime = Date.now();
        while (Date.now() - startTime < timeout) {
            for (const selector of selectors) {
                try {
                    const el = await $(selector);
                    if (await el.isExisting() && await el.isDisplayed()) {
                        return el;
                    }
                } catch (e) {
                    // Try next selector
                }
            }
            if (typeof driver !== 'undefined' && driver.pause) {
                await driver.pause(300);
            }
        }
        // Default to first selector if none matched after polling
        return $(selectors[0]);
    }
}
