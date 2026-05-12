export interface PriceReport {
  id: string;
  product: string;
  market: string;
  price: number;
  currency: string;
  unit: string;
  date: string;
  reporterId: string;
}

export interface SellerInsight {
  date: string;
  yourPrice: number;
  marketAverage: number;
  suggestedPrice: number;
}

export const PRODUCTS = [
  "White Rice (Long Grain)",
  "Maize Flour",
  "Cassava Tubers",
  "Red Kidney Beans",
  "Cooking Oil (Palm)",
];

export const MARKETS = [
  "Kinshasa Grand Market",
  "Nairobi Wakulima",
  "Lagos Mile 12",
  "Dar es Salaam Kariakoo",
  "Accra Makola",
];

export const INITIAL_MOCK_REPORTS: PriceReport[] = [
  { id: "1", product: "White Rice (Long Grain)", market: "Kinshasa Grand Market", price: 1200, currency: "CDF", unit: "1kg", date: "2023-10-24", reporterId: "seller_01" },
  { id: "2", product: "White Rice (Long Grain)", market: "Kinshasa Grand Market", price: 1250, currency: "CDF", unit: "1kg", date: "2023-10-24", reporterId: "seller_02" },
  { id: "3", product: "Maize Flour", market: "Nairobi Wakulima", price: 90, currency: "KES", unit: "1kg", date: "2023-10-24", reporterId: "seller_03" },
  { id: "4", product: "Maize Flour", market: "Nairobi Wakulima", price: 95, currency: "KES", unit: "1kg", date: "2023-10-25", reporterId: "seller_03" },
];

export const generateMockInsights = (): SellerInsight[] => {
  const data: SellerInsight[] = [];
  const basePrice = 1200; // CDF for Rice
  let currentMarketAvg = 1250;
  
  for (let i = 14; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    
    // Simulate market price fluctuations
    currentMarketAvg += (Math.random() - 0.5) * 50;
    const yourPrice = currentMarketAvg + (Math.random() > 0.5 ? 20 : -30);
    
    data.push({
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      marketAverage: Math.round(currentMarketAvg),
      yourPrice: Math.round(yourPrice),
      suggestedPrice: Math.round(currentMarketAvg - 5) // Slightly undercut to drive volume
    });
  }
  return data;
};
