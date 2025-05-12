import mongoose, { Schema, Document } from 'mongoose';

export interface ICountry extends Document {
  name: string;
  code: string;
  participationType: string; // 'combat', 'medical', 'material'
  region: string;
  flag: string;
  language: string;
  description: string;
  statistics: {
    soldiers?: number;
    casualties?: number;
    startDate?: Date;
    endDate?: Date;
  };
  history: string;
  relations: string;
}

const CountrySchema: Schema = new Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  participationType: { 
    type: String, 
    required: true, 
    enum: ['combat', 'medical', 'material'] 
  },
  region: { type: String, required: true },
  flag: { type: String, default: '' },
  language: { type: String, required: true },
  description: { type: String, default: '' },
  statistics: {
    soldiers: { type: Number },
    casualties: { type: Number },
    startDate: { type: Date },
    endDate: { type: Date }
  },
  history: { type: String, default: '' },
  relations: { type: String, default: '' }
});

CountrySchema.index({ name: 1 });
CountrySchema.index({ code: 1 }, { unique: true });
CountrySchema.index({ participationType: 1 });
CountrySchema.index({ region: 1 });

export default mongoose.model<ICountry>('Country', CountrySchema);