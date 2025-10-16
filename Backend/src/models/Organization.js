import mongoose from 'mongoose';

const { Schema } = mongoose;

const OrganizationSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    admin: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    psychologists: [{ type: Schema.Types.ObjectId, ref: 'User', index: true }],
    patients: [{ type: Schema.Types.ObjectId, ref: 'Patient', index: true }],
    diagnosisCatalog: [{ type: Schema.Types.ObjectId, ref: 'Diagnosis' }],
    registrationToken: { type: String, default: null },
  },
  { timestamps: true }
);

OrganizationSchema.index({ name: 1 }, { unique: true, sparse: true });

OrganizationSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model('Organization', OrganizationSchema);


