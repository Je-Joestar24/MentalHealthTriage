import mongoose from 'mongoose';

const { Schema } = mongoose;

export const DIAGNOSIS_TYPES = ['global', 'organization', 'personal'];

const DiagnosisSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: DIAGNOSIS_TYPES, required: true, default: 'personal', index: true },
    organization: { type: Schema.Types.ObjectId, ref: 'Organization', default: null },
  },
  { timestamps: true }
);

DiagnosisSchema.index({ name: 1, type: 1, organization: 1 }, { unique: false });

DiagnosisSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => { delete ret.__v; return ret; },
});

export default mongoose.model('Diagnosis', DiagnosisSchema);


