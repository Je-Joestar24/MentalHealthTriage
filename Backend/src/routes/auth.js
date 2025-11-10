import { Router } from 'express';
import { login, seedSuperAdmin, logout, updateProfile } from '../controllers/authController.js';
import jwt from 'jsonwebtoken';

const router = Router();

// Simple JWT auth middleware for protected routes
const JWT_SECRET = process.env.JWT_SECRET || 'dev_super_secret_change_me';
function requireAuth(req, res, next) {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        req.user = payload;
        return next();
    } catch (e) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
}

// Public routes
router.post('/login', login);
router.get('/seed-super-admin', seedSuperAdmin);

// Protected routes
router.post('/logout', requireAuth, logout);
router.put('/profile', requireAuth, updateProfile);

export default router;


