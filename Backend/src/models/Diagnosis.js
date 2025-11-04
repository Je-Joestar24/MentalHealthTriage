import mongoose from 'mongoose';

const { Schema } = mongoose;

export const DIAGNOSIS_TYPES = ['global', 'organization', 'personal'];
export const DIAGNOSIS_SYSTEMS = ['DSM-5', 'ICD-10'];

const DurationRuleSchema = new Schema(
  {
    min: { type: Number, default: null },
    unit: { type: String, enum: ['days', 'weeks', 'months', 'years'], default: 'months' },
    max: { type: Number, default: null },
  },
  { _id: false }
);

const DiagnosisSchema = new Schema(
  {
    // Core identifiers
    name: { type: String, required: true, trim: true }, // e.g., "Persistent Depressive Disorder (Dysthymia)"
    // Legacy single-system fields (kept for backward compatibility and simple creates)
    system: { type: String, enum: DIAGNOSIS_SYSTEMS, default: 'DSM-5', index: true },
    code: { type: String, trim: true }, // e.g., "300.4" or "F34.1"

    // Optional dual-code support (CSV imports / updates)
    dsm5Code: { type: String, trim: true, index: true },
    icd10Code: { type: String, trim: true, index: true },

    // Hierarchical context
    section: { type: String, trim: true }, // e.g., "Section II: Diagnostic Criteria and Codes"
    chapter: { type: String, trim: true }, // e.g., "Depressive Disorders"

    // Descriptions and summaries
    fullCriteriaSummary: { type: String, trim: true },
    keySymptomsSummary: { type: String, trim: true },

    // Symptom list (hashtags-style input in UI)
    symptoms: [{ type: String, trim: true }], // e.g., ["hopelessness", "low energy", "insomnia"]

    // For screening tools
    validatedScreenerParaphrased: { type: String, trim: true },
    exactScreenerItem: { type: String, trim: true },

    // Duration and severity
    typicalDuration: DurationRuleSchema, // maps to "Typical Duration Rules" in UI
    durationContext: { type: String, trim: true }, // e.g., "≥2 years (≥1 year youth)"
    severity: { type: Schema.Types.Mixed }, // String or array (CSV imports use arrays from semicolon-separated values)

    // Course and specifiers
    course: { type: String, enum: ['Continuous', 'Episodic', 'Either'], default: 'Either' },
    specifiers: { type: Schema.Types.Mixed }, // String or array (CSV imports use arrays from semicolon-separated values)

    // Misc
    notes: { type: String, trim: true },
    criteriaPage: { type: Number },

    // Original source control
    type: { type: String, enum: DIAGNOSIS_TYPES, required: true, default: 'personal', index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    organization: { type: Schema.Types.ObjectId, ref: 'Organization', default: null },
  },
  { timestamps: true }
);

// Indexes for faster lookup
DiagnosisSchema.index({ name: 1, system: 1, code: 1, organization: 1 });
DiagnosisSchema.index({ name: 1, dsm5Code: 1, icd10Code: 1, organization: 1 });

// Clean JSON output
DiagnosisSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model('Diagnosis', DiagnosisSchema);



