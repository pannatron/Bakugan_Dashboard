import mongoose, { Document, Schema } from 'mongoose';

export interface IRecommendation extends Document {
  bakuganId: mongoose.Types.ObjectId;
  rank: number;
  reason: string;
  createdAt: Date;
  updatedAt: Date;
}

const RecommendationSchema = new Schema<IRecommendation>(
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
      max: 3,
      unique: true,
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
RecommendationSchema.index({ rank: 1 }, { unique: true });
RecommendationSchema.index({ bakuganId: 1 }, { unique: true });

const Recommendation = mongoose.models.Recommendation || mongoose.model<IRecommendation>('Recommendation', RecommendationSchema);

export default Recommendation;
