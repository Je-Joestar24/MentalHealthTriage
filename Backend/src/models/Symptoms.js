import mongoose from 'mongoose';

const { Schema } = mongoose;

const SymptomsSchema = new Schema({
  name: { type: String, required: true, unique: true, trim: true }, // Prettified e.g. "Depressed mood"
}, { timestamps: true });

export default mongoose.model('Symptom', SymptomsSchema);
