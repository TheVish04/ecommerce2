const nodemailer = require("nodemailer");

/**
 * IMPORTANT ENV VARIABLES (must exist in Vercel dashboard)
 *
 * SMTP_HOST=smtp.gmail.com
 * SMTP_PORT=465
 * SMTP_USER=yourgmail@gmail.com
 * SMTP_PASS=GMAIL_APP_PASSWORD
 * SMTP_FROM=KalaVPP <yourgmail@gmail.com>
 */

const EMAIL_SEND_TIMEOUT_MS = 15000; // 15s max (serverless safe)
let cachedTransporter = null;

/* ------------------ TRANSPORTER ------------------ */

const getTransporter = () => {
  if (cachedTransporter) return cachedTransporter;

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    console.warn("[Email] SMTP not configured");
    return null;
  }

  cachedTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 8000,
  });

  return cachedTransporter;
};

/* ------------------ SEND WITH TIMEOUT ------------------ */

const sendMailWithTimeout = (mailOptions) => {
  const transporter = getTransporter();
  if (!transporter) {
    return Promise.reject(new Error("SMTP not configured"));
  }

  return Promise.race([
    transporter.sendMail(mailOptions),
    new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error("Email send timed out")),
        EMAIL_SEND_TIMEOUT_MS
      )
    ),
  ]);
};

/* ------------------ EMAIL TEMPLATES ------------------ */

const buildOrderEmailHtml = (order) => {
  const items = (order.products || [])
    .map(
      (p) =>
        `<tr>
          <td>${p.product?.title || "Item"}</td>
          <td>${p.quantity}</td>
          <td>₹${(p.product?.price || 0) * p.quantity}</td>
        </tr>`
    )
    .join("");

  const addr = order.shippingAddress || {};
  const addrStr = [
    addr.street,
    addr.city,
    addr.state,
    addr.pincode,
    addr.phone,
  ]
    .filter(Boolean)
    .join(", ");

  return `
<!DOCTYPE html>
<html>
<body style="font-family:system-ui;max-width:600px;margin:auto;padding:20px">
<h2>Order Confirmed</h2>
<p>Hi ${order.buyer?.name || "Customer"},</p>
<table width="100%" border="1" cellspacing="0" cellpadding="8">
<tr><th>Item</th><th>Qty</th><th>Amount</th></tr>
${items}
</table>
<p><strong>Total:</strong> ₹${order.totalAmount}</p>
<p><strong>Shipping:</strong> ${addrStr || "N/A"}</p>
<hr />
<p style="font-size:12px;color:#666">— KalaVPP</p>
</body>
</html>`;
};

const buildPasswordResetEmailHtml = (user, resetUrl) => `
<!DOCTYPE html>
<html>
<body style="font-family:system-ui;max-width:600px;margin:auto;padding:20px">
<h2>Reset Your Password</h2>
<p>Hi ${user.name || "User"},</p>
<p>Click the link below to reset your password:</p>
<a href="${resetUrl}">${resetUrl}</a>
<p>This link expires in 10 minutes.</p>
<hr />
<p style="font-size:12px;color:#666">— KalaVPP</p>
</body>
</html>`;

const buildVerificationOtpEmailHtml = (user, otp) => `
<!DOCTYPE html>
<html>
<body style="font-family:system-ui;max-width:600px;margin:auto;padding:20px">
<h2>Verify Your Email</h2>
<p>Hi ${user.name || "User"},</p>
<p>Your OTP:</p>
<h1 style="letter-spacing:6px">${otp}</h1>
<p>Expires in 10 minutes.</p>
<hr />
<p style="font-size:12px;color:#666">— KalaVPP</p>
</body>
</html>`;

/* ------------------ SENDERS ------------------ */

const sendOrderConfirmationEmail = async (order) => {
  if (!order?.buyer?.email) return;
  try {
    await sendMailWithTimeout({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: order.buyer.email,
      subject: "Order Confirmed - KalaVPP",
      html: buildOrderEmailHtml(order),
    });
  } catch (err) {
    console.error("[Email] Order email failed:", err.message);
  }
};

const sendPasswordResetEmail = async (user, token) => {
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const resetUrl = `${clientUrl}/resetpassword/${token}`;

  return sendMailWithTimeout({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: user.email,
    subject: "Reset Your Password - KalaVPP",
    html: buildPasswordResetEmailHtml(user, resetUrl),
  });
};

const sendVerificationOtpEmail = async (user, otp) => {
  return sendMailWithTimeout({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: user.email,
    subject: "Verify Your Email - KalaVPP",
    html: buildVerificationOtpEmailHtml(user, otp),
  });
};

/* ------------------ EXPORTS ------------------ */

module.exports = {
  sendOrderConfirmationEmail,
  sendPasswordResetEmail,
  sendVerificationOtpEmail,
};