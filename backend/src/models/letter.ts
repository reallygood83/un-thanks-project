import mongoose, { Schema, Document } from 'mongoose';

export interface ILetter extends Document {
  name: string;
  email: string;
  school: string;
  grade: string;
  letterContent: string;
  translatedContent: string;
  originalContent: boolean;
  countryId: string;
  createdAt: Date;
}

const LetterSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  school: { type: String, default: '' },
  grade: { type: String, default: '' },
  letterContent: { type: String, required: true },
  translatedContent: { type: String, required: true },
  originalContent: { type: Boolean, default: true },
  countryId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// 인덱스 생성
LetterSchema.index({ countryId: 1 });
LetterSchema.index({ createdAt: -1 });

export default mongoose.model<ILetter>('Letter', LetterSchema);
