import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError.js';

const protect = (roles = []) => {
    return (req, res, next) => {
        try {
            const token = req.headers.authorization?.split(' ')[1]; // Get token from headers

            
            if (!token) {
                throw new AppError('Access denied. No token provided.', 401);
            }

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            console.log(decoded.role);
            
            // Check if the user has the required role
            if (roles.length && !roles.includes(decoded.role)) {
                throw new AppError('Access denied. Insufficient permissions.', 403);
            }

            next();
        } catch (err) {
            next(new AppError(`Unauthorized: ${err.message}`, 401));
        }
    };
};

export default protect;
