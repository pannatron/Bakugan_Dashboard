import mongoose, { Document, Schema } from 'mongoose';

export interface IBakugan extends Document {
  names: string[]; // Multiple names (Thai, English, or community names)
  size: string; // B1, B2, B3
  element: string; // Element type
  specialProperties: string; // Normal, Clear, Pearl, Prototype, Painted
  series: string; // Battle Brawlers Vol.1, New Vestroia Vol.2, etc.
  imageUrl: string;
  currentPrice: number;
  referenceUri: string; // URI for price reference
  date: Date | string; // Date of record
  createdAt: Date;
  updatedAt: Date;
}

const BakuganSchema = new Schema<IBakugan>(
  {
    names: {
      type: [String],
      required: true,
      validate: {
        validator: function(v: string[]) {
          return v.length > 0;
        },
        message: 'At least one name is required'
      }
    },
    size: {
      type: String,
      required: true,
      enum: ['B1', 'B2', 'B3'],
    },
    element: {
      type: String,
      required: true,
    },
    specialProperties: {
      type: String,
      required: false,
      default: 'Normal',
    },
    series: {
      type: String,
      required: false,
      default: '',
    },
    imageUrl: {
      type: String,
      required: false,
      default: '',
    },
    currentPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    referenceUri: {
      type: String,
      required: false,
      default: '',
    },
    date: {
      type: Schema.Types.Mixed, // Allow both Date and String
      required: true, // Make it required to ensure we always have a date
    },
  },
  {
    timestamps: true,
    strict: true,
  }
);

// Create indexes for frequently queried fields
BakuganSchema.index({ 'names.0': 1 });
BakuganSchema.index({ names: 1 }); // For name searches
BakuganSchema.index({ size: 1 }); // For size filtering
BakuganSchema.index({ element: 1 }); // For element filtering
BakuganSchema.index({ specialProperties: 1 }); // For special properties filtering
BakuganSchema.index({ series: 1 }); // For series filtering
BakuganSchema.index({ currentPrice: 1 }); // For price range filtering
BakuganSchema.index({ updatedAt: -1 }); // For sorting by most recent
BakuganSchema.index({ 'names.0': 1, size: 1, element: 1 }); // Compound index for the common query pattern

// Pre-save hook to ensure required fields
BakuganSchema.pre('save', function (next) {
  if (!this.names || this.names.length === 0) {
    next(new Error('At least one name is required'));
  }
  if (!this.size) {
    next(new Error('Size is required'));
  }
  if (!this.element) {
    next(new Error('Element is required'));
  }
  if (!this.date) {
    next(new Error('Date is required'));
  }
  next();
});

const Bakugan = mongoose.models.Bakugan || mongoose.model<IBakugan>('Bakugan', BakuganSchema);

export default Bakugan;
