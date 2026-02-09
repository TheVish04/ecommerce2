// Email functionality disabled/mocked
const sendOrderConfirmationEmail = async (order) => {
    console.log(`[Mock Email] Order Confirmation for ${order?.buyer?.email}`);
    return Promise.resolve();
};

const sendPasswordResetEmail = async (user, token) => {
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const resetUrl = `${clientUrl}/resetpassword/${token}`;
    console.log(`[Mock Email] Password Reset for ${user.email}. Link: ${resetUrl}`);
    return Promise.resolve();
};

const sendVerificationOtpEmail = async (user, otp) => {
    console.log(`[Mock Email] Verify Email for ${user.email}. OTP: ${otp}`);
    return Promise.resolve();
};

const verifyConnection = async () => {
    console.log('[Mock Email] Connection verified (mocked)');
    return { success: true };
};

module.exports = {
    sendOrderConfirmationEmail,
    sendPasswordResetEmail,
    sendVerificationOtpEmail,
    verifyConnection
};