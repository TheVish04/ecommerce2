let nodemailer;
try {
    nodemailer = require('nodemailer');
} catch (e) {
    nodemailer = null;
}

const EMAIL_SEND_TIMEOUT_MS = 45000; // 45s - prevents signup/login from hanging too long but allows for slower SMTP

const createTransporter = () => {
    if (!nodemailer || !process.env.SMTP_HOST) return null;
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: process.env.SMTP_USER ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        } : undefined
    });
};

const sendMailWithTimeout = (options) => {
    const transporter = createTransporter();
    if (!transporter) return Promise.reject(new Error('Email service is not configured via .env'));

    console.log(`[Email] Attempting to send email to ${options.to}`);
    const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Email send timed out (45s). Check SMTP settings.')), EMAIL_SEND_TIMEOUT_MS)
    );

    return Promise.race([
        transporter.sendMail(options).then(info => {
            console.log(`[Email] Sent successfully: ${info.messageId}`);
            return info;
        }),
        timeout
    ]);
};

const buildOrderEmailHtml = (order) => {
    const items = (order.products || []).map(p =>
        `<tr><td>${p.product?.title || 'Item'}</td><td>${p.quantity}</td><td>₹${(p.product?.price || 0) * (p.quantity || 1)}</td></tr>`
    ).join('');
    const addr = order.shippingAddress;
    const addrStr = [addr?.street, addr?.city, addr?.state, addr?.pincode, addr?.phone].filter(Boolean).join(', ') || 'N/A';
    return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Order Confirmation</title></head>
<body style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1 style="color: #1e40af;">Order Confirmed!</h1>
    <p>Hi ${order.buyer?.name || 'Customer'},</p>
    <p>Thank you for your order. Your order <strong>#${order._id?.toString().slice(-8).toUpperCase()}</strong> has been placed successfully.</p>
    <h3>Order Details</h3>
    <table style="width: 100%; border-collapse: collapse;">
        <thead><tr style="background: #f3f4f6;"><th style="padding: 8px; text-align: left;">Item</th><th>Qty</th><th>Amount</th></tr></thead>
        <tbody>${items}</tbody>
    </table>
    <p><strong>Total: ₹${order.totalAmount?.toLocaleString()}</strong></p>
    <p><strong>Shipping to:</strong> ${addrStr}</p>
    <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;">
    <p style="color: #6b7280; font-size: 12px;">— KalaVPP</p>
</body>
</html>`;
};

const sendOrderConfirmationEmail = async (order) => {
    if (!order.buyer?.email) return;
    try {
        await sendMailWithTimeout({
            from: process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@kalavpp.com',
            to: order.buyer.email,
            subject: `Order Confirmed #${order._id?.toString().slice(-8).toUpperCase()} - KalaVPP`,
            html: buildOrderEmailHtml(order)
        });
    } catch (e) {
        console.error('Failed to send order email:', e.message);
    }
};

const buildCommissionPaymentEmailHtml = (commission) => {
    const vendorName = commission.vendor?.name || 'Artist';
    const serviceTitle = commission.service?.title || 'Commission';
    const budget = commission.budget?.toLocaleString() || '0';
    return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Commission Payment Confirmed</title></head>
<body style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1 style="color: #7c3aed;">Payment Received – Commission #${commission._id?.toString().slice(-8).toUpperCase()}</h1>
    <p>Hi ${commission.customer?.name || 'Customer'},</p>
    <p>Your payment of <strong>₹${budget}</strong> for the commission <strong>${serviceTitle}</strong> has been confirmed.</p>
    <p>Funds are held securely in escrow and will be released to <strong>${vendorName}</strong> once the work is completed and delivered.</p>
    <p>You can track progress in your <a href="${process.env.CLIENT_URL || 'https://kalavpp.com'}/commissions">Commissions</a> page.</p>
    <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;">
    <p style="color: #6b7280; font-size: 12px;">— KalaVPP</p>
</body>
</html>`;
};

const sendCommissionPaymentEmail = async (commission) => {
    if (!commission.customer?.email) return;
    try {
        await sendMailWithTimeout({
            from: process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@kalavpp.com',
            to: commission.customer.email,
            subject: `Payment Confirmed – Commission #${commission._id?.toString().slice(-8).toUpperCase()} - KalaVPP`,
            html: buildCommissionPaymentEmailHtml(commission)
        });
    } catch (e) {
        console.error('Failed to send commission email:', e.message);
    }
};

const buildPasswordResetEmailHtml = (user, resetUrl) => {
    const name = user.name || 'User';
    const expiresIn = '10 minutes';
    return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Reset Your Password</title></head>
<body style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1 style="color: #1e40af;">Reset Your Password</h1>
    <p>Hi ${name},</p>
    <p>You requested a password reset for your KalaVPP account.</p>
    <p>Click the button below to set a new password. This link will expire in ${expiresIn}.</p>
    <p style="margin: 28px 0;">
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">Reset Password</a>
    </p>
    <p style="color: #6b7280; font-size: 14px;">Or copy this link: <a href="${resetUrl}">${resetUrl}</a></p>
    <p style="color: #6b7280; font-size: 12px;">If you didn't request this, you can safely ignore this email.</p>
    <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;">
    <p style="color: #6b7280; font-size: 12px;">— KalaVPP</p>
</body>
</html>`;
};

const sendPasswordResetEmail = async (user, resetToken) => {
    if (!user?.email) {
        throw new Error('User email not found');
    }
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl = `${clientUrl}/resetpassword/${resetToken}`;
    await sendMailWithTimeout({
        from: process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@kalavpp.com',
        to: user.email,
        subject: 'Reset Your Password - KalaVPP',
        html: buildPasswordResetEmailHtml(user, resetUrl)
    });
};

const buildVerificationOtpEmailHtml = (user, otp) => {
    const name = user.name || 'User';
    const expiresIn = '10 minutes';
    return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Verify Your Email</title></head>
<body style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1 style="color: #1e40af;">Verify Your Email</h1>
    <p>Hi ${name},</p>
    <p>Thanks for signing up for KalaVPP! Use the OTP below to verify your email address.</p>
    <p style="margin: 28px 0; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1e40af; font-family: monospace;">${otp}</p>
    <p style="color: #6b7280; font-size: 14px;">This code will expire in ${expiresIn}.</p>
    <p style="color: #6b7280; font-size: 12px;">If you didn't create an account, you can safely ignore this email.</p>
    <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;">
    <p style="color: #6b7280; font-size: 12px;">— KalaVPP</p>
</body>
</html>`;
};

const sendVerificationOtpEmail = async (user, otp) => {
    if (!user?.email) {
        throw new Error('User email not found');
    }
    await sendMailWithTimeout({
        from: process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@kalavpp.com',
        to: user.email,
        subject: 'Verify Your Email - KalaVPP',
        html: buildVerificationOtpEmailHtml(user, otp)
    });
};

module.exports = { sendOrderConfirmationEmail, sendCommissionPaymentEmail, sendPasswordResetEmail, sendVerificationOtpEmail };
