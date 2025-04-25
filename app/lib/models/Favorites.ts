import mongoose, { Document, Schema } from 'mongoose';

export interface IFavoriteItem extends Document {
  userId: string;
  bakuganId: string;
  addedAt: Date;
  notes?: string;
}

const FavoriteItemSchema = new Schema<IFavoriteItem>(
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
FavoriteItemSchema.index({ userId: 1, bakuganId: 1 }, { unique: true });

const Favorites = mongoose.models.Favorites || mongoose.model<IFavoriteItem>('Favorites', FavoriteItemSchema);

export default Favorites;
