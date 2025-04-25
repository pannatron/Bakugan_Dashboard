import mongoose, { Document, Schema } from 'mongoose';

export interface IPortfolioItem extends Document {
  userId: string;
  bakuganId: string;
  addedAt: Date;
  notes?: string;
}

const PortfolioItemSchema = new Schema<IPortfolioItem>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    bakuganId: {
      type: String,
      required: true,
      index: true,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Create a compound index for userId and bakuganId to ensure uniqueness
PortfolioItemSchema.index({ userId: 1, bakuganId: 1 }, { unique: true });

const Portfolio = mongoose.models.Portfolio || mongoose.model<IPortfolioItem>('Portfolio', PortfolioItemSchema);

export default Portfolio;
