import mongoose, { Document, Schema } from 'mongoose';

export interface IBakugan extends Document {
  names: string[]; // Multiple names (Thai, English, or community names)
  size: string; // B1, B2, B3
  element: string; // Element type
  specialProperties: string; // Normal, Clear, Pearl, Prototype, Painted
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

// Create indexes
BakuganSchema.index({ 'names.0': 1 });

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
