import 'dotenv/config';
import path from 'path';
import fs from 'fs';

export const config = {
    // ====================
    // Runner Configuration
    // ====================
    runner: 'local',
    port: parseInt(process.env.APPIUM_PORT, 10) || 4723,
    hostname: process.env.APPIUM_HOST || '127.0.0.1',
    path: '/',

    // ==================
    // Specify Test Files
    // ==================
    specs: [
        './test/specs/**/*.e2e.js'
    ],
    suites: {
        smoke: [
            './test/specs/smoke/smoke.e2e.js'
        ],
        regression: [
            './test/specs/**/*.e2e.js'
        ],
        authentication: [
            './test/specs/authentication/login.e2e.js'
        ],
        account: [
            './test/specs/account/account.e2e.js'
        ],
        transfer: [
            './test/specs/transfer/sendMoney.e2e.js',
            './test/specs/transfer/sendMoneyFavorites.e2e.js'
        ],
        favorites: [
            './test/specs/transfer/sendMoneyFavorites.e2e.js'
        ],
        autopay: [
            './test/specs/transfer/sendMoneyAutoPay.e2e.js'
        ],
        transaction: [
            './test/specs/transaction/history.e2e.js'
        ]
    },
    exclude: [],

    // ============
    // Capabilities
    // ============
    maxInstances: 1,
    capabilities: [{
        platformName: 'Android',
        'appium:automationName': 'UiAutomator2',
        'appium:deviceName': 'Android Device',
        'appium:app': path.resolve(process.cwd(), process.env.APP_PATH || './apps/app-uat-release.apk'),
        'appium:appPackage': process.env.APP_PACKAGE || 'com.fintech23.muktopay.uat',
        'appium:appActivity': process.env.APP_ACTIVITY || 'fintech23.skt.wallet.fintech23_wallet.MainActivity',
        'appium:autoGrantPermissions': false,
        'appium:noReset': true,
        'appium:fullReset': false
    }],

    logLevel: process.env.LOG_LEVEL || 'info',
    bail: 0,
    baseUrl: 'http://localhost',
    waitforTimeout: parseInt(process.env.DEFAULT_TIMEOUT, 10) || 15000,
    connectionRetryTimeout: 120000,
    connectionRetryCount: 3,

    services: [
        ['appium', {
            args: {
                address: process.env.APPIUM_HOST || '127.0.0.1',
                port: parseInt(process.env.APPIUM_PORT, 10) || 4723
            },
            logPath: './logs/'
        }]
    ],

    framework: 'mocha',
    reporters: ['spec'],

    mochaOpts: {
        ui: 'bdd',
        timeout: 120000
    },

    // ===================
    // Test Lifecycle Hooks
    // ===================
    onPrepare: function () {
        console.log('[LOG] Starting Mukto Pay Mobile Automation Test Suite...');
        const screenshotsDir = path.resolve(process.cwd(), './screenshots');
        if (!fs.existsSync(screenshotsDir)) {
            fs.mkdirSync(screenshotsDir, { recursive: true });
        }
    },

    afterTest: async function (test, context, { error, result, duration, passed, retries }) {
        if (!passed) {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const cleanTitle = test.title.replace(/[^a-zA-Z0-9]/g, '_');
            const screenshotPath = `./screenshots/FAILED_${cleanTitle}_${timestamp}.png`;
            try {
                await browser.saveScreenshot(screenshotPath);
                console.log(`[SCREENSHOT] Saved failure screenshot to: ${screenshotPath}`);
            } catch (err) {
                console.error(`[ERROR] Failed to save screenshot: ${err.message}`);
            }
        }
    },

    onComplete: function (exitCode) {
        console.log(`[LOG] Test suite run complete with exit code: ${exitCode}`);
    }
};
