import mongoose from 'mongoose';

const { Schema } = mongoose;

const OrganizationSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    admin: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    psychologists: [{ type: Schema.Types.ObjectId, ref: 'User', index: true }],
    // Maximum allowed psychologists (seats) for this organization
    psychologistSeats: { type: Number, default: 4, min: 0 },
    patients: [{ type: Schema.Types.ObjectId, ref: 'Patient', index: true }],
    diagnosisCatalog: [{ type: Schema.Types.ObjectId, ref: 'Diagnosis' }],
    registrationToken: { type: String, default: null },
    subscriptionStatus: { 
      type: String, 
      enum: ['active', 'inactive'], 
      default: 'active',
      index: true 
    },
    subscriptionStartDate: { 
      type: Date, 
      default: Date.now,
      index: true 
    },
    subscriptionEndDate: { 
      type: Date, 
      required: true,
      index: true 
    },
    // Stripe integration fields
    stripe_customer_id: { type: String, default: null, index: true },
    stripe_subscription_id: { type: String, default: null, index: true },
    subscription_status: {
      type: String,
      enum: ['active', 'incomplete', 'past_due', 'canceled', 'unpaid'],
      default: 'incomplete',
      index: true
    },
    is_paid: { type: Boolean, default: false, index: true },
    seats_limit: { type: Number, default: 4, min: 4 }, // Minimum 4 seats for organizations
    // Subscription cancellation management
    cancel_at_period_end: { type: Boolean, default: false, index: true },
    cancellationRequestedAt: { type: Date, default: null },
    cancellationReason: { type: String, default: '' },
  },
  { timestamps: true }
);

OrganizationSchema.index({ name: 1 }, { unique: true, sparse: true });

// Virtual field to check if subscription is expired
OrganizationSchema.virtual('isSubscriptionExpired').get(function() {
  return new Date() > this.subscriptionEndDate;
});

// Virtual field to get the effective status (includes automatic expiration)
// Uses subscription_status from Stripe, not the old subscriptionStatus field
OrganizationSchema.virtual('effectiveStatus').get(function() {
  if (this.isSubscriptionExpired) {
    return 'expired';
  }
  // Use Stripe subscription_status as source of truth
  return (this.subscription_status === 'active' && this.is_paid) ? 'active' : this.subscription_status;
});

// Virtual field to get days remaining in subscription
OrganizationSchema.virtual('daysRemaining').get(function() {
  const now = new Date();
  const endDate = this.subscriptionEndDate;
  const diffTime = endDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
});

OrganizationSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret.__v;
    // Map subscription_status (Stripe) to subscriptionStatus for frontend compatibility
    // subscription_status is the source of truth from Stripe
    if (ret.subscription_status) {
      // Map Stripe status to legacy status for frontend
      if (ret.subscription_status === 'active' && ret.is_paid) {
        ret.subscriptionStatus = 'active';
      } else {
        ret.subscriptionStatus = 'inactive';
      }
    }
    return ret;
  },
});

export default mongoose.model('Organization', OrganizationSchema);


