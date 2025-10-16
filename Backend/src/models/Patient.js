import mongoose from 'mongoose';

const { Schema } = mongoose;

const ContactInfoSchema = new Schema(
  {
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
  },
  { _id: false }
);

const PatientSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    age: { type: Number, min: 0, max: 130, required: true },
    gender: { type: String, enum: ['male', 'female', 'other'], default: 'other' },
    contactInfo: { type: ContactInfoSchema, default: {} },
    assignedPsychologist: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    organization: { type: Schema.Types.ObjectId, ref: 'Organization', default: null, index: true },
    triageRecords: [{ type: Schema.Types.ObjectId, ref: 'Triage' }],
  },
  { timestamps: true }
);

PatientSchema.index({ name: 1, organization: 1 });

PatientSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => { delete ret.__v; return ret; },
});

export default mongoose.model('Patient', PatientSchema);


