'use client';

export interface PricePoint {
  price: number;
  timestamp: string;
  notes?: string;
  referenceUri?: string;
}

export interface Bakugan {
  _id: string;
  names: string[];
  size: string;
  element: string;
  specialProperties: string;
  imageUrl: string;
  currentPrice: number;
  referenceUri: string;
  priceHistory?: PricePoint[];
}

export interface Recommendation {
  _id: string;
  bakuganId: Bakugan;
  rank: number;
  reason: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecommendedBakuganProps {
  onToggle: () => void;
  useSimpleView: boolean;
  setUseSimpleView: (value: boolean) => void;
}
