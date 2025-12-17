import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User, { USER_ROLES } from '../models/User.js';
import {
  checkEmailAvailability,
  createTempIndividualUser,
  createTempOrganizationUser,
} from '../services/auth.service.js';
import {
  createIndividualCheckoutSession,
  createOrganizationCheckoutSession,
} from '../services/stripe.service.js';

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
            .populate({
                path: 'organization',
                select: 'name subscription_status is_paid stripe_subscription_id subscriptionStartDate subscriptionEndDate psychologistSeats seats_limit'
            });
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

        const token = generateToken({ sub: user.id, role: user.role });
        
        // For organization users, include organization subscription data in response
        const userJson = user.toJSON();
        if (user.organization && user.account_type === 'organization') {
            // Organization subscription takes precedence
            const org = user.organization;
            userJson.effectiveSubscriptionStatus = org.subscription_status;
            userJson.effectiveIsPaid = org.is_paid;
            // Map subscription_status to subscriptionStatus for frontend compatibility
            if (org.subscription_status === 'active' && org.is_paid) {
                userJson.organization.subscriptionStatus = 'active';
            } else {
                userJson.organization.subscriptionStatus = 'inactive';
            }
        } else {
            // Individual account uses own subscription
            userJson.effectiveSubscriptionStatus = user.subscription_status;
            userJson.effectiveIsPaid = user.is_paid;
        }
        
        return res.json({
            token,
            user: userJson,
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

/**
 * Check email availability for signup
 * POST /auth/check-email
 */
export async function checkEmail(req, res, next) {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                error: 'Email is required',
            });
        }

        const result = await checkEmailAvailability(email);

        return res.json({
            success: true,
            ...result,
        });
    } catch (err) {
        next(err);
    }
}

/**
 * Create temporary user before payment
 * POST /auth/create-temp-user
 */
export async function createTempUser(req, res, next) {
    try {
        const { accountType, name, email, password, companyName, adminName, seats } = req.body;

        if (!accountType || !['individual', 'organization'].includes(accountType)) {
            return res.status(400).json({
                success: false,
                error: 'Account type must be either "individual" or "organization"',
            });
        }

        if (accountType === 'individual') {
            // Individual account
            if (!name || !email || !password) {
                return res.status(400).json({
                    success: false,
                    error: 'Name, email, and password are required for individual accounts',
                });
            }

            const user = await createTempIndividualUser({ name, email, password });

            return res.status(201).json({
                success: true,
                data: {
                    user,
                    accountType: 'individual',
                },
                message: 'Temporary user created successfully',
            });
        } else {
            // Organization account
            if (!companyName || !adminName || !email || !password) {
                return res.status(400).json({
                    success: false,
                    error: 'Company name, admin name, email, and password are required for organization accounts',
                });
            }

            const result = await createTempOrganizationUser({
                companyName,
                adminName,
                email,
                password,
                seats: seats || 4,
            });

            return res.status(201).json({
                success: true,
                data: {
                    user: result.user,
                    organization: result.organization,
                    accountType: 'organization',
                },
                message: 'Temporary user and organization created successfully',
            });
        }
    } catch (err) {
        // Handle duplicate email error
        if (err.message.includes('already registered')) {
            return res.status(409).json({
                success: false,
                error: err.message,
            });
        }

        // Handle validation errors
        if (err.message.includes('required') || err.message.includes('Password must')) {
            return res.status(400).json({
                success: false,
                error: err.message,
            });
        }

        next(err);
    }
}

/**
 * Create Stripe checkout session
 * POST /auth/create-checkout-session
 */
export async function createCheckoutSession(req, res, next) {
    try {
        const { userId, organizationId, accountType, seats, successUrl, cancelUrl } = req.body;

        if (!accountType || !['individual', 'organization'].includes(accountType)) {
            return res.status(400).json({
                success: false,
                error: 'Account type must be either "individual" or "organization"',
            });
        }

        if (!successUrl || !cancelUrl) {
            return res.status(400).json({
                success: false,
                error: 'Success URL and cancel URL are required',
            });
        }

        // Fetch user to get Stripe customer ID
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found',
            });
        }

        if (!user.stripe_customer_id) {
            return res.status(400).json({
                success: false,
                error: 'Stripe customer ID not found. Please create user first.',
            });
        }

        let session;

        if (accountType === 'individual') {
            // Create individual checkout session
            session = await createIndividualCheckoutSession({
                customerId: user.stripe_customer_id,
                userId: user._id.toString(),
                successUrl,
                cancelUrl,
            });
        } else {
            // Organization account
            if (!organizationId) {
                return res.status(400).json({
                    success: false,
                    error: 'Organization ID is required for organization accounts',
                });
            }

            const seatCount = Math.max(4, parseInt(seats, 10) || 4);

            session = await createOrganizationCheckoutSession({
                customerId: user.stripe_customer_id,
                organizationId,
                seats: seatCount,
                successUrl,
                cancelUrl,
            });
        }

        return res.json({
            success: true,
            data: {
                sessionId: session.id,
                url: session.url,
            },
            message: 'Checkout session created successfully',
        });
    } catch (err) {
        // Handle Stripe errors
        if (err.message.includes('Stripe') || err.message.includes('checkout')) {
            return res.status(400).json({
                success: false,
                error: err.message,
            });
        }

        next(err);
    }
}


