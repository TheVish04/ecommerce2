/**
 * KalaVPP - Central model exports
 */
const User = require('./User');
const Category = require('./Category');
const Product = require('./Product');
const Service = require('./Service');
const Order = require('./Order');
const Commission = require('./Commission');
const Booking = require('./Booking');
const Transaction = require('./Transaction');
const DownloadAccess = require('./DownloadAccess');

module.exports = {
    User,
    Category,
    Product,
    Service,
    Order,
    Commission,
    Booking,
    Transaction,
    DownloadAccess
};
