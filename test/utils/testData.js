import 'dotenv/config';

/**
 * Centralized test dataset for Mukto Pay UAT financial test automation.
 */
export const testData = {
    user: {
        phone: process.env.TEST_USER_PHONE || '01712188953',
        pin: process.env.TEST_USER_PIN || '12121',
        otp: process.env.TEST_USER_OTP || '123456',
        invalidOtp: '999999',
        password: process.env.TEST_USER_PASSWORD || 'SecretPassword123!',
        invalidPin: '11111',
        invalidPhone: '01928232611'
    },

    errorMessages: {
        invalidCredentials: 'Invalid mobile number or PIN',
        invalidOtp: 'Invalid OTP'
    },

    transfer: {
        receiverPhone: process.env.TEST_RECEIVER_PHONE || '01329484257',
        amount: parseInt(process.env.TEST_TRANSFER_AMOUNT, 10) || 500,
        minAmount: parseInt(process.env.TEST_TRANSFER_MIN_AMOUNT, 10) || 10,
        maxAmount: parseInt(process.env.TEST_TRANSFER_MAX_AMOUNT, 10) || 50000
    }
};

export default testData;
