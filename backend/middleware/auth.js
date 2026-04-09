const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
        ? authHeader.slice(7)
        : null;

    if (!token) {
        return res.status(401).json({ message: "Missing auth token" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "fitness_secret_key");
        req.user = decoded;
        return next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};

const requireAdmin = (req, res, next) => {
    if (!req.user || !req.user.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
    }
    return next();
};

const optionalAuth = (req, res, next) => {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
        ? authHeader.slice(7)
        : null;

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || "fitness_secret_key");
            req.user = decoded;
        } catch (error) {
            // Token invalid but allow request to proceed without user
            req.user = null;
        }
    }
    
    return next();
};

module.exports = {
    verifyToken,
    requireAdmin,
    optionalAuth
};
