import mongoose from 'mongoose';

const { Schema } = mongoose;

export const SEVERITY_LEVELS = ['low', 'moderate', 'high'];
export const DURATION_UNITS = ['days', 'weeks', 'months', 'years'];
export const COURSE_TYPES = ['Continuous', 'Episodic', 'Either'];

const TriageSchema = new Schema(
  {
    patient: { type: Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    psychologist: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    symptoms: [{ type: String, trim: true }], // Array of hashtag-style symptoms
    duration: { type: Number, default: null }, // Duration value
    durationUnit: { type: String, enum: DURATION_UNITS, default: 'months' }, // Unit for duration
    course: { type: String, enum: COURSE_TYPES, default: null }, // Course type
    preliminaryDiagnosis: { type: String, default: '', trim: true },
    severityLevel: { type: String, enum: SEVERITY_LEVELS, required: true },
    notes: { type: String, default: '', trim: true },
  },
  { timestamps: true }
);

TriageSchema.index({ patient: 1, createdAt: -1 });

TriageSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => { delete ret.__v; return ret; },
});

export default mongoose.model('Triage', TriageSchema);


