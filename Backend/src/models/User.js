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
  },
  { timestamps: true }
);

// Indexes for faster role/org queries
UserSchema.index({ role: 1, organization: 1 });

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


