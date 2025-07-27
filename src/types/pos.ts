export interface Product {
  id: string;
  name: string;
  cost: number;
  price: number;
  category?: string;
  description?: string;
  image?: string; // Base64 encoded image or URL
  inventory: number;
  barcode?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Sale {
  id: string;
  items: CartItem[];
  total: number;
  profit: number;
  timestamp: Date;
  paymentMethod?: 'cash' | 'card' | 'other';
}

export interface SalesReport {
  totalSales: number;
  totalProfit: number;
  totalTransactions: number;
  averageTransactionValue: number;
  bestSellingProducts: { product: Product; quantity: number }[];
  salesByDate: { date: string; sales: number; profit: number }[];
}
