const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { sendOrderConfirmationEmail } = require('../utils/email');

// @desc    Create a new order from cart
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
    const { items, shippingAddress } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
        res.status(400);
        throw new Error('Cart is empty');
    }

    const buyerId = req.user.id;

    // Validate items and calculate total server-side
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
        const { productId, quantity, options = {} } = item;

        if (!productId || !quantity || quantity < 1) {
            res.status(400);
            throw new Error('Invalid cart item: productId and quantity required');
        }

        const product = await Product.findById(productId);
        if (!product) {
            res.status(404);
            throw new Error(`Product ${productId} not found`);
        }
        if (!product.isActive || product.status !== 'active') {
            res.status(400);
            throw new Error(`Product "${product.title}" is not available`);
        }

        // Stock check for physical products
        if (product.type === 'physical') {
            if (product.stock < quantity) {
                res.status(400);
                throw new Error(`Insufficient stock for "${product.title}". Available: ${product.stock}`);
            }
        }

        const lineTotal = product.price * quantity;
        totalAmount += lineTotal;

        orderItems.push({
            product: productId,
            quantity,
            options
        });
    }

    // Create order
    const order = await Order.create({
        buyer: buyerId,
        products: orderItems,
        totalAmount,
        shippingAddress: shippingAddress || {},
        status: 'pending',
        paymentStatus: 'pending'
    });

    // Update product stock and sales for physical products
    for (const item of items) {
        const product = await Product.findById(item.productId);
        if (product && product.type === 'physical') {
            product.stock -= item.quantity;
            product.sales = (product.sales || 0) + item.quantity;
            if (product.stock <= 0) {
                product.status = 'sold_out';
            }
            await product.save();
        }
    }

    const populatedOrder = await Order.findById(order._id)
        .populate('products.product', 'title price images type vendor')
        .populate('buyer', 'name email');

    try {
        await sendOrderConfirmationEmail(populatedOrder);
    } catch (e) {
        console.error('Order confirmation email failed:', e.message);
    }

    res.status(201).json(populatedOrder);
});

// @desc    Get current user's orders
// @route   GET /api/orders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({ buyer: req.user.id })
        .populate('products.product', 'title price images type')
        .sort('-createdAt')
        .lean();

    res.json(orders);
});

// @desc    Get single order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id)
        .populate('products.product', 'title price images type vendor')
        .populate('buyer', 'name email');

    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    // Only buyer can view their order
    if (!order.buyer || String(order.buyer._id) !== String(req.user.id)) {
        res.status(403);
        throw new Error('Not authorized to view this order');
    }

    res.json(order);
});

// @desc    Get invoice for order (JSON or HTML)
// @route   GET /api/orders/:id/invoice
// @access  Private
const getInvoice = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id)
        .populate('products.product', 'title price type')
        .populate('buyer', 'name email');

    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    if (!order.buyer || String(order.buyer._id) !== String(req.user.id)) {
        res.status(403);
        throw new Error('Not authorized to view this invoice');
    }

    const lineItems = order.products.map(p => {
        const price = p.product?.price || 0;
        const lineTotal = price * (p.quantity || 1);
        return {
            title: p.product?.title || 'Unknown',
            quantity: p.quantity,
            price,
            lineTotal,
            type: p.product?.type
        };
    });

    const subtotal = order.totalAmount;
    const tax = Math.round(subtotal * 0.18 * 100) / 100;
    const total = Math.round((subtotal + tax) * 100) / 100;

    const invoiceData = {
        orderId: order._id,
        orderNumber: `#INV-${order._id.toString().slice(-8).toUpperCase()}`,
        date: order.createdAt,
        buyer: {
            name: order.buyer?.name,
            email: order.buyer?.email
        },
        shippingAddress: order.shippingAddress,
        items: lineItems,
        subtotal,
        tax,
        total,
        currency: order.currency || 'INR',
        status: order.status,
        paymentStatus: order.paymentStatus
    };

    const format = req.query.format || 'json';

    if (format === 'html') {
        const html = buildInvoiceHtml(invoiceData);
        res.setHeader('Content-Type', 'text/html');
        return res.send(html);
    }

    res.json(invoiceData);
});

function buildInvoiceHtml(data) {
    const dateStr = new Date(data.date).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'long', year: 'numeric'
    });
    const itemsRows = data.items.map(item => `
        <tr>
            <td>${escapeHtml(item.title)}</td>
            <td>${item.quantity}</td>
            <td>₹${item.price.toLocaleString()}</td>
            <td>₹${(item.lineTotal).toLocaleString()}</td>
        </tr>
    `).join('');

    const addr = data.shippingAddress;
    const addrStr = [addr?.street, addr?.city, addr?.state, addr?.pincode, addr?.phone].filter(Boolean).join(', ') || '-';

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Invoice ${data.orderNumber}</title>
    <style>
        * { box-sizing: border-box; }
        body { font-family: system-ui, sans-serif; max-width: 700px; margin: 40px auto; padding: 20px; color: #333; }
        h1 { font-size: 24px; margin-bottom: 8px; }
        .meta { color: #666; font-size: 14px; margin-bottom: 24px; }
        table { width: 100%; border-collapse: collapse; margin: 24px 0; }
        th { text-align: left; padding: 12px; background: #f5f5f5; border-bottom: 2px solid #ddd; }
        td { padding: 12px; border-bottom: 1px solid #eee; }
        .totals { margin-left: auto; width: 280px; }
        .totals tr td:first-child { text-align: right; padding-right: 16px; }
        .totals .total { font-weight: bold; font-size: 18px; }
        .status { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
        .status.pending { background: #fef3c7; color: #92400e; }
        .status.paid { background: #d1fae5; color: #065f46; }
        .status.completed { background: #dbeafe; color: #1e40af; }
        @media print { body { margin: 0; } }
    </style>
</head>
<body>
    <h1>Invoice ${data.orderNumber}</h1>
    <p class="meta">Date: ${dateStr} | Status: <span class="status ${data.status}">${data.status}</span> | Payment: <span class="status ${data.paymentStatus}">${data.paymentStatus}</span></p>

    <p><strong>Bill To</strong><br>${escapeHtml(data.buyer?.name || '')}<br>${escapeHtml(data.buyer?.email || '')}</p>
    <p><strong>Shipping Address</strong><br>${escapeHtml(addrStr)}</p>

    <table>
        <thead>
            <tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr>
        </thead>
        <tbody>${itemsRows}</tbody>
    </table>

    <table class="totals">
        <tr><td>Subtotal</td><td>₹${data.subtotal.toLocaleString()}</td></tr>
        <tr><td>Tax (18%)</td><td>₹${data.tax.toLocaleString()}</td></tr>
        <tr class="total"><td>Total</td><td>₹${data.total.toLocaleString()} ${data.currency}</td></tr>
    </table>

    <p style="margin-top: 40px; font-size: 12px; color: #888;">Thank you for your order. — KalaVPP</p>
</body>
</html>`;
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

// @desc    Get secure download URL for digital product in order
// @route   GET /api/orders/:orderId/download/:productId
// @access  Private
const getDownloadUrl = asyncHandler(async (req, res) => {
    const { orderId, productId } = req.params;
    const userId = req.user.id;

    const order = await Order.findById(orderId).populate('products.product');
    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    if (String(order.buyer) !== String(userId)) {
        res.status(403);
        throw new Error('Not authorized to download from this order');
    }

    const orderItem = order.products.find(
        p => p.product && String(p.product._id) === String(productId)
    );
    if (!orderItem) {
        res.status(404);
        throw new Error('Product not found in this order');
    }

    const product = orderItem.product;
    if (product.type !== 'digital') {
        res.status(400);
        throw new Error('This product is not a digital download');
    }

    const downloadUrl = product.downloadUrl || product.images?.[0];
    if (!downloadUrl) {
        res.status(404);
        throw new Error('Download not available for this product');
    }

    const ext = (downloadUrl.match(/\.(jpg|jpeg|png|gif|webp|pdf|zip)(\?|$)/i) || [])[1] || 'file';
    const fileName = `${product.title.replace(/[^a-z0-9]/gi, '_')}.${ext}`;

    res.json({
        url: downloadUrl,
        fileName
    });
});

// @desc    Update order status (vendor or admin only)
// @route   PATCH /api/orders/:id
// @access  Private (vendor whose product in order, or admin)
const updateOrderStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const order = await Order.findById(req.params.id).populate('products.product', 'vendor');

    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isAdmin && req.user.role === 'vendor') {
        const hasVendorProduct = order.products.some(
            p => p.product && String(p.product.vendor) === String(userId)
        );
        if (!hasVendorProduct) {
            res.status(403);
            throw new Error('Not authorized to update this order');
        }
    } else if (!isAdmin) {
        res.status(403);
        throw new Error('Only vendors and admins can update order status');
    }

    order.status = status;
    await order.save();

    const updated = await Order.findById(order._id)
        .populate('products.product', 'title price images type')
        .populate('buyer', 'name email');
    res.json(updated);
});

module.exports = {
    createOrder,
    getMyOrders,
    getOrderById,
    getInvoice,
    getDownloadUrl,
    updateOrderStatus
};
