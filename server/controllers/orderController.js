const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Service = require('../models/Service');
const DownloadAccess = require('../models/DownloadAccess');
const { sendOrderConfirmationEmail } = require('../utils/email');

async function ensureDownloadAccessForOrder(order) {
    if (order.paymentStatus !== 'paid') return;
    const buyerId = order.buyer?._id || order.buyer;
    const digitalProducts = [];

    const addIfDigital = async (productRef) => {
        const p = typeof productRef === 'object' && productRef?.type ? productRef : await Product.findById(productRef).lean();
        if (p && p.type === 'digital') digitalProducts.push(p);
    };

    for (const item of order.products || []) {
        if (item.product) await addIfDigital(item.product);
    }
    for (const li of order.lineItems || []) {
        if (li.itemType === 'product' && li.product) await addIfDigital(li.product);
    }

    const seen = new Set();
    for (const product of digitalProducts) {
        const productId = product._id?.toString?.() || product._id;
        if (seen.has(productId)) continue;
        seen.add(productId);
        const existing = await DownloadAccess.findOne({ user: buyerId, order: order._id, product: productId });
        if (existing) continue;
        const maxDownloads = product.downloadLimit ?? null;
        let expiresAt = null;
        if (product.downloadExpiryDays) {
            expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + product.downloadExpiryDays);
        }
        await DownloadAccess.create({
            user: buyerId,
            order: order._id,
            product: productId,
            maxDownloads,
            expiresAt
        });
    }
}

async function buildOrderFromItems(items, buyerId, shippingAddress = {}) {
    let totalAmount = 0;
    const productsArray = [];
    const lineItemsArray = [];

    for (const item of items) {
        const { productId, serviceId, quantity = 1, options = {}, customizations, scheduledDate } = item;

        if (productId) {
            const product = await Product.findById(productId);
            if (!product) throw new Error(`Product ${productId} not found`);
            if (!product.isActive || product.status !== 'active') {
                throw new Error(`Product "${product.title}" is not available`);
            }
            if (product.type === 'physical' && product.stock < quantity) {
                throw new Error(`Insufficient stock for "${product.title}". Available: ${product.stock}`);
            }
            const lineTotal = product.price * quantity;
            totalAmount += lineTotal;
            productsArray.push({ product: productId, quantity, options });
            lineItemsArray.push({
                itemType: 'product',
                product: productId,
                quantity,
                unitPrice: product.price,
                options
            });
        } else if (serviceId) {
            const service = await Service.findById(serviceId).populate('vendor', 'name');
            if (!service) throw new Error(`Service ${serviceId} not found`);
            if (!service.isActive) throw new Error(`Service "${service.title}" is not available`);
            const unitPrice = service.basePrice;
            const lineTotal = unitPrice * quantity;
            totalAmount += lineTotal;
            lineItemsArray.push({
                itemType: 'service',
                service: serviceId,
                quantity,
                unitPrice,
                options: {},
                customizations: customizations || undefined,
                scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined
            });
        } else {
            throw new Error('Invalid cart item: productId or serviceId required');
        }
    }

    const order = await Order.create({
        buyer: buyerId,
        products: productsArray,
        lineItems: lineItemsArray,
        totalAmount,
        shippingAddress,
        status: 'pending',
        paymentStatus: 'pending'
    });

    for (const item of items) {
        if (item.productId) {
            const product = await Product.findById(item.productId);
            if (product && product.type === 'physical') {
                product.stock -= item.quantity;
                product.sales = (product.sales || 0) + item.quantity;
                if (product.stock <= 0) product.status = 'sold_out';
                await product.save();
            }
        }
    }

    return order;
}

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
    const order = await buildOrderFromItems(items, buyerId, shippingAddress || {});

    const populatedOrder = await Order.findById(order._id)
        .populate('products.product', 'title price images type vendor')
        .populate('lineItems.product', 'title price images type')
        .populate('lineItems.service', 'title basePrice deliveryTime vendor')
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
        .populate('lineItems.product', 'title price images type')
        .populate('lineItems.service', 'title basePrice coverImage deliveryTime')
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
        .populate('lineItems.product', 'title price images type vendor')
        .populate('lineItems.service', 'title basePrice coverImage deliveryTime vendor')
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

    const itemsForInvoice = (order.lineItems && order.lineItems.length > 0)
        ? order.lineItems.map(li => {
            const price = li.unitPrice || (li.product?.price || li.service?.basePrice || 0);
            const qty = li.quantity || 1;
            const title = li.product?.title || li.service?.title || 'Unknown';
            return { title, quantity: qty, price, lineTotal: price * qty, type: li.product ? (li.product.type || 'product') : 'service' };
        })
        : order.products.map(p => {
            const price = p.product?.price || 0;
            const lineTotal = price * (p.quantity || 1);
            return { title: p.product?.title || 'Unknown', quantity: p.quantity, price, lineTotal, type: p.product?.type };
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
        items: itemsForInvoice,
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

// @desc    Get secure download URL for digital product in order (controlled access)
// @route   GET /api/orders/:orderId/download/:productId
// @access  Private
const getDownloadUrl = asyncHandler(async (req, res) => {
    const { orderId, productId } = req.params;
    const userId = req.user.id;

    const order = await Order.findById(orderId)
        .populate('products.product')
        .populate('lineItems.product');
    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    const buyerId = order.buyer?._id?.toString?.() || order.buyer?.toString?.();
    if (buyerId !== userId) {
        res.status(403);
        throw new Error('Not authorized to download from this order');
    }

    let product = null;
    const fromProducts = order.products?.find(p => p.product && String(p.product._id) === String(productId));
    const fromLineItems = order.lineItems?.find(li => li.itemType === 'product' && li.product && String(li.product._id) === String(productId));

    if (fromProducts?.product) product = fromProducts.product;
    else if (fromLineItems?.product) product = fromLineItems.product;

    if (!product) {
        res.status(404);
        throw new Error('Product not found in this order');
    }
    if (product.type !== 'digital') {
        res.status(400);
        throw new Error('This product is not a digital download');
    }

    let access = await DownloadAccess.findOne({ user: userId, order: orderId, product: productId });
    if (!access) {
        if (order.paymentStatus !== 'paid') {
            res.status(403);
            throw new Error('Download access requires payment confirmation');
        }
        access = await DownloadAccess.create({
            user: userId,
            order: orderId,
            product: productId,
            maxDownloads: product.downloadLimit ?? null,
            expiresAt: product.downloadExpiryDays ? (() => { const d = new Date(); d.setDate(d.getDate() + product.downloadExpiryDays); return d; })() : null
        });
    }

    if (access.isRevoked) {
        res.status(403);
        throw new Error('Download access has been revoked');
    }
    if (access.expiresAt && new Date() > access.expiresAt) {
        res.status(403);
        throw new Error('Download access has expired');
    }
    if (access.maxDownloads != null && access.downloadCount >= access.maxDownloads) {
        res.status(403);
        throw new Error('Download limit reached');
    }

    const downloadUrl = product.downloadUrl || product.images?.[0];
    if (!downloadUrl) {
        res.status(404);
        throw new Error('Download not available for this product');
    }

    access.downloadCount += 1;
    access.lastDownloadAt = new Date();
    await access.save();

    const ext = (downloadUrl.match(/\.(jpg|jpeg|png|gif|webp|pdf|zip)(\?|$)/i) || [])[1] || 'file';
    const fileName = `${product.title.replace(/[^a-z0-9]/gi, '_')}.${ext}`;

    res.json({
        url: downloadUrl,
        fileName,
        remainingDownloads: access.maxDownloads != null ? Math.max(0, access.maxDownloads - access.downloadCount) : null,
        expiresAt: access.expiresAt || null
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
    updateOrderStatus,
    buildOrderFromItems,
    ensureDownloadAccessForOrder
};
