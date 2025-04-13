// Types for Bakugan data
export interface Bakugan {
  _id: string;
  names: string[];
  size: string;
  element: string;
  specialProperties: string;
  imageUrl: string;
  currentPrice: number;
  referenceUri: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface PricePoint {
  _id: string;
  bakuganId: string;
  price: number;
  timestamp: string;
  notes: string;
  referenceUri?: string;
}

// Element definitions with images
export const elements = [
  { value: 'Pyrus', image: '/element/Pyrus.svg' },
  { value: 'Aquos', image: '/element/Aquos.webp' },
  { value: 'Ventus', image: '/element/ventus.png' },
  { value: 'Subterra', image: '/element/Subterra.png' },
  { value: 'Haos', image: '/element/Haos.webp' },
  { value: 'Darkus', image: '/element/Darkus.webp' },
];
