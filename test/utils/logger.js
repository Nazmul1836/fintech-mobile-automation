/**
 * Custom Logger utility for clean test execution output.
 */
class Logger {
    static info(message) {
        console.log(`[INFO] ${message}`);
    }

    static warn(message) {
        console.warn(`[WARN] ${message}`);
    }

    static error(message) {
        console.error(`[ERROR] ${message}`);
    }

    static step(stepName) {
        console.log(`\n[STEP] === ${stepName} ===`);
    }
}

export default Logger;
