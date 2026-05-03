// Import jsonwebtoken package to verify JWT tokens
const jwt = require('jsonwebtoken');

// Authentication middleware function
const auth = (req, res, next) => {
    // Get token from Authorization header
    // Example: Authorization: Bearer abc123token
    const token = req.header('Authorization');
    // If no token found, deny access
    if (!token) return res.status(401).json({ error: 'No token, authorization denied' });

    try {
        // Remove "Bearer " text from token
        // Then verify token using secret key from .env file
        const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
        // Store decoded user data inside req.user
        // Example: { id: "12345", email: "user@gmail.com" }
        req.user = decoded;
        // Move to next middleware or route handler
        next();
    } catch (error) {
        // If token is invalid, return 401 Unauthorized error   
        res.status(401).json({ error: 'Token is not valid' });
    }
};
// Export middleware to use in other files
module.exports = auth;
