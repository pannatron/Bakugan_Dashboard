'use client';

export interface PricePoint {
  price: number;
  timestamp: string;
  notes?: string;
  referenceUri?: string;
}

export interface BakuganCardProps {
  id: string;
  names: string[];
  size: string;
  element: string;
  specialProperties: string;
  imageUrl: string;
  currentPrice: number;
  referenceUri: string;
  priceHistory: PricePoint[];
  onUpdatePrice: (id: string, price: number, notes: string, referenceUri: string, date: string) => void;
  onUpdateDetails?: (
    id: string,
    names: string[],
    size: string,
    element: string,
    specialProperties: string,
    imageUrl: string,
    referenceUri: string
  ) => void;
}

export interface PriceTrend {
  trend: 'up' | 'down' | 'stable';
  percentage: string;
}
