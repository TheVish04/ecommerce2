const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401);
            throw new Error('Not authorized');
        }

        if (!roles.includes(req.user.role)) {
            res.status(403);
            throw new Error(`User role ${req.user.role} is not authorized to access this route`);
        }

        if (req.user.role === 'vendor' && req.user.vendorStatus === 'rejected') {
            res.status(403);
            throw new Error('Your vendor account has been rejected');
        }

        if (req.user.role === 'vendor' && req.user.vendorStatus === 'pending') {
            res.status(403);
            throw new Error('Your vendor account is pending approval');
        }

        next();
    };
};

module.exports = { authorize };
