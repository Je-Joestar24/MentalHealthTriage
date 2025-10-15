import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    meta: { type: Object }
}, { timestamps: true });

export default mongoose.model('Item', itemSchema);
