import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No valid token provided' });
    }

    const token = authHeader.split(' ')[1];

    // Default Secret matching the Java Implementation fallback or a local default
    const JWT_SECRET = process.env.JWT_SECRET || '472D4B6150645367566B5970337336763979244226452948404D6351';

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = {
            email: decoded.sub,      // Subject holds email
            tenantId: decoded.tenantId,
            userId: decoded.id       // Adding User ID mapping natively for Node convenience
        };
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Invalid or expired token', error: error.message });
    }
};
