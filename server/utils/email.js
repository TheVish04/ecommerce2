let nodemailer;
try {
    nodemailer = require('nodemailer');
} catch (e) {
    nodemailer = null;
}

let transporter = null;
if (nodemailer && process.env.SMTP_HOST) {
    transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: process.env.SMTP_USER ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        } : undefined
    });
}

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
    if (!transporter || !order.buyer?.email) return;
    await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@kalavpp.com',
        to: order.buyer.email,
        subject: `Order Confirmed #${order._id?.toString().slice(-8).toUpperCase()} - KalaVPP`,
        html: buildOrderEmailHtml(order)
    });
};

module.exports = { sendOrderConfirmationEmail };
