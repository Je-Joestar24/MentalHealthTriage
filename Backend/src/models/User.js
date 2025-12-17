import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const { Schema } = mongoose;

export const USER_ROLES = ['super_admin', 'company_admin', 'psychologist'];

const UserSchema = new Schema(
  {
    name: { type: String, trim: true, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8 },
    role: { type: String, enum: USER_ROLES, default: 'psychologist', index: true },
    organization: { type: Schema.Types.ObjectId, ref: 'Organization', default: null, index: true },
    specialization: { type: String, trim: true, default: '' },
    experience: { type: Number, min: 0, default: 0 },
    isActive: { type: Boolean, default: true },
    subscriptionStartDate: { 
      type: Date, 
      default: Date.now,
      index: true 
    },
    subscriptionEndDate: { 
      type: Date, 
      required: false,
      index: true 
    },
    // Stripe integration fields
    stripe_customer_id: { type: String, default: null, index: true },
    stripe_subscription_id: { type: String, default: null, index: true },
    is_paid: { type: Boolean, default: false, index: true },
    subscription_status: {
      type: String,
      enum: ['active', 'incomplete', 'past_due', 'canceled', 'unpaid'],
      default: 'incomplete',
      index: true
    },
    // Subscription cancellation management
    cancel_at_period_end: { type: Boolean, default: false, index: true },
    cancellationRequestedAt: { type: Date, default: null },
    cancellationReason: { type: String, default: '' },
    account_type: {
      type: String,
      enum: ['individual', 'organization'],
      default: null,
      index: true
    },
    trial_end_at: { type: Date, default: null },
  },
  { timestamps: true }
);

// Indexes for faster role/org queries
UserSchema.index({ role: 1, organization: 1 });

// Virtual field to check if user subscription is expired
UserSchema.virtual('isSubscriptionExpired').get(function() {
  if (!this.subscriptionEndDate) return false;
  return new Date() > this.subscriptionEndDate;
});

// Virtual field to get days remaining in user subscription
UserSchema.virtual('daysRemaining').get(function() {
  if (!this.subscriptionEndDate) return null;
  const now = new Date();
  const endDate = this.subscriptionEndDate;
  const diffTime = endDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
});

// Virtual field to check if user has active subscription
UserSchema.virtual('hasActiveSubscription').get(function() {
  if (!this.subscriptionEndDate) return true; // No end date means unlimited
  return new Date() <= this.subscriptionEndDate;
});

// Hide sensitive/internal fields when converting to JSON/objects
const toJSONTransform = (doc, ret) => {
  delete ret.password;
  delete ret.__v;
  return ret;
};
UserSchema.set('toJSON', { virtuals: true, transform: toJSONTransform });
UserSchema.set('toObject', { virtuals: true, transform: toJSONTransform });

// Password hashing middleware
UserSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance method for password comparison
UserSchema.methods.comparePassword = async function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model('User', UserSchema);


