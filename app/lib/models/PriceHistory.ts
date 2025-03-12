import mongoose, { Document, Schema } from 'mongoose';
import { IBakugan } from './Bakugan';

export interface IPriceHistory extends Document {
  bakuganId: IBakugan['_id'];
  price: number;
  timestamp: Date | string;
  notes: string;
  referenceUri: string; // URI for price reference
}

const PriceHistorySchema = new Schema<IPriceHistory>(
  {
    bakuganId: {
      type: Schema.Types.ObjectId,
      ref: 'Bakugan',
      required: true,
      index: true,
    },
    price: {
      type: Number,
      required: true,
    },
    timestamp: {
      type: Schema.Types.Mixed, // Allow both Date and String
      required: true, // Make it required to ensure we always have a timestamp
      index: true,
    },
    notes: {
      type: String,
      default: '',
    },
    referenceUri: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    strict: true,
  }
);

// Create indexes
PriceHistorySchema.index({ bakuganId: 1, timestamp: -1 });

// Pre-save hook to ensure required fields
PriceHistorySchema.pre('save', function (next) {
  if (!this.bakuganId) {
    next(new Error('Bakugan ID is required'));
  }
  if (this.price === undefined || this.price === null) {
    next(new Error('Price is required'));
  }
  if (!this.timestamp) {
    next(new Error('Timestamp is required'));
  }
  next();
});

const PriceHistory = mongoose.models.PriceHistory || mongoose.model<IPriceHistory>('PriceHistory', PriceHistorySchema);

export default PriceHistory;
