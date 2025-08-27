// /src/models/quicknote.ts
import mongoose from 'mongoose';

const NoteSchema = new mongoose.Schema({
  title: { type: String, default: 'Untitled' },
  content: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.models.Note || mongoose.model('Note', NoteSchema);