import mongoose, { Document, Schema } from 'mongoose';

export interface IBakutechRecommendation extends Document {
  bakuganId: mongoose.Types.ObjectId;
  rank: number;
  reason: string;
  createdAt: Date;
  updatedAt: Date;
}

const BakutechRecommendationSchema = new Schema<IBakutechRecommendation>(
  {
    bakuganId: {
      type: Schema.Types.ObjectId,
      ref: 'Bakugan',
      required: true,
    },
    rank: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      unique: true, // This creates an index automatically
    },
    reason: {
      type: String,
      required: false,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes
// Rank index is already created by the schema definition with unique: true
BakutechRecommendationSchema.index({ bakuganId: 1 }, { unique: true });

const BakutechRecommendation = mongoose.models.BakutechRecommendation || mongoose.model<IBakutechRecommendation>('BakutechRecommendation', BakutechRecommendationSchema);

export default BakutechRecommendation;
