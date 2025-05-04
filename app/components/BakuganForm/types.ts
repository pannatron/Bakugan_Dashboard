export interface PriceHistory {
  price: number;
  timestamp: string;
  notes?: string;
  referenceUri?: string;
}

export interface BakuganRecommendation {
  _id: string;
  names: string[];
  size: string;
  element: string;
  specialProperties: string;
  series?: string;
  imageUrl?: string;
  currentPrice: number;
  priceHistory?: PriceHistory[];
}

export interface ElementOption {
  value: string;
  image: string;
}

export interface AddBakuganFormProps {
  onAddBakugan: (
    names: string[],
    size: string,
    element: string,
    specialProperties: string,
    series: string,
    imageUrl: string,
    currentPrice: number,
    referenceUri: string,
    date: string,
    difficultyOfObtaining?: number
  ) => void;
  onUpdateBakugan?: (
    id: string,
    price: number,
    referenceUri: string,
    notes: string,
    date: string
  ) => void;
}
