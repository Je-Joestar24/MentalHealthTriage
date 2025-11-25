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

        const user = await User.findOne({ email: email.toLowerCase().trim(), isActive: true })
            .populate('organization', 'name');
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

export async function updateProfile(req, res, next) {
    try {
        const userId = req.user?.sub || req.user?._id;
        
        if (!userId) {
            return res.status(401).json({ success: false, error: 'Authentication required' });
        }

        const { 
            name, 
            email, 
            specialization, 
            experience, 
            current_password: currentPassword, 
            new_password: newPassword 
        } = req.body || {};

        if (!name && !email && !newPassword && specialization === undefined && experience === undefined) {
            return res.status(400).json({
                success: false,
                error: 'At least one field must be provided for update'
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        // Update name if provided
        if (name !== undefined) {
            const trimmedName = name.trim();
            if (!trimmedName) {
                return res.status(400).json({ success: false, error: 'Name cannot be empty' });
            }
            user.name = trimmedName;
        }

        // Update email if provided
        if (email !== undefined) {
            const normalizedEmail = email.toLowerCase().trim();
            if (!normalizedEmail) {
                return res.status(400).json({ success: false, error: 'Email cannot be empty' });
            }

            if (normalizedEmail !== user.email) {
                const existingUser = await User.findOne({
                    email: normalizedEmail,
                    _id: { $ne: userId }
                });

                if (existingUser) {
                    return res.status(409).json({ success: false, error: 'Email is already in use' });
                }

                user.email = normalizedEmail;
            }
        }

        // Handle password change
        if (newPassword !== undefined && newPassword !== '') {
            if (!currentPassword) {
                return res.status(400).json({
                    success: false,
                    error: 'Current password is required to set a new password'
                });
            }

            const isCurrentValid = await user.comparePassword(currentPassword);
            if (!isCurrentValid) {
                return res.status(400).json({
                    success: false,
                    error: 'Current password is incorrect'
                });
            }

            if (String(newPassword).length < 8) {
                return res.status(400).json({
                    success: false,
                    error: 'New password must be at least 8 characters long'
                });
            }

            user.password = newPassword;
        }

        // Update specialization if provided
        if (specialization !== undefined) {
            user.specialization = specialization.trim() || '';
        }

        // Update experience if provided
        if (experience !== undefined) {
            const experienceNum = Number(experience);
            if (isNaN(experienceNum) || experienceNum < 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Experience must be a non-negative number'
                });
            }
            user.experience = experienceNum;
        }

        await user.save();
        
        // Populate organization before returning
        await user.populate('organization', 'name');

        return res.json({
            success: true,
            data: user.toJSON(),
            message: 'Profile updated successfully'
        });
    } catch (err) {
        next(err);
    }
}


