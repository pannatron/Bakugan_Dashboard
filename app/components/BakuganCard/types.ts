'use client';

export interface PricePoint {
  price: number;
  timestamp: string;
  notes?: string;
  referenceUri?: string;
  difficultyOfObtaining?: number;
}

export interface BakuganCardProps {
  id: string;
  names: string[];
  size: string;
  element: string;
  specialProperties: string;
  series?: string;
  imageUrl: string;
  currentPrice: number;
  referenceUri: string;
  priceHistory: PricePoint[];
  isInFavorites?: boolean;
  isInPortfolio?: boolean;
  favoriteId?: string;
  portfolioId?: string;
  quantity?: number;
  activeTab?: 'portfolio' | 'favorites' | 'main';
  onUpdatePrice: (id: string, price: number, notes: string, referenceUri: string, date: string, difficultyOfObtaining?: number) => void;
  onUpdateDetails?: (
    id: string,
    names: string[],
    size: string,
    element: string,
    specialProperties: string,
    series: string,
    imageUrl: string,
    referenceUri: string,
    difficultyOfObtaining: number
  ) => Promise<boolean>;
  onDeleteBakugan?: (id: string) => void;
  onAddToFavorite?: (id: string) => void;
  onRemoveFromFavorite?: (favoriteId: string) => void;
  onAddToPortfolio?: (id: string, quantity?: number) => void;
  onRemoveFromPortfolio?: (portfolioId: string) => void;
  onUpdatePortfolioQuantity?: (portfolioId: string, quantity: number) => void;
}

export interface PriceTrend {
  trend: 'up' | 'down' | 'stable';
  percentage: string;
}
