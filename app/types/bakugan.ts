// Types for Bakugan data
export interface Bakugan {
  _id: string;
  names: string[];
  size: string;
  element: string;
  specialProperties: string;
  series: string;
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

// Series definitions
export const seriesOptions = [
  { value: 'Battle Brawlers Vol.1', label: 'Battle Brawlers Vol.1' },
  { value: 'New Vestroia Vol.2', label: 'New Vestroia Vol.2' },
  { value: 'Gundalian Invaders Vol.3', label: 'Gundalian Invaders Vol.3' },
  { value: 'Mechtanium Surge Vol.4', label: 'Mechtanium Surge Vol.4' },
  { value: 'BakuTech', label: 'BakuTech' },
];
