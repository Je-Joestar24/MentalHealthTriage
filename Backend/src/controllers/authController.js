import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User, { USER_ROLES } from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_super_secret_change_me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

function generateToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export async function login(req, res, next) {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }

        const user = await User.findOne({ email: email.toLowerCase().trim(), isActive: true });
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

        const token = generateToken({ sub: user.id, role: user.role });
        return res.json({
            token,
            user: user.toJSON(),
        });
    } catch (err) {
        next(err);
    }
}

export async function seedSuperAdmin(req, res, next) {
    try {
        const email = 'super@gmail.com';
        const password = 'super4DM!n';
        const existing = await User.findOne({ email });
        if (existing) {
            return res.json({ message: 'Super admin already exists', user: existing.toJSON() });
        }

        const user = new User({
            name: 'Super Admin',
            email,
            password,
            role: 'super_admin',
        });
        await user.save();
        return res.status(201).json({ message: 'Super admin created', user: user.toJSON() });
    } catch (err) {
        next(err);
    }
}


export async function logout(req, res, next) {
    try {
        // With stateless JWT, server-side logout is a no-op.
        // Client should discard the token. We can still return 200.
        return res.json({ message: 'Logged out' });
    } catch (err) {
        next(err);
    }
}


