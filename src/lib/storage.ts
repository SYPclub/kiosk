import { Product, Sale } from '@/types/pos';

const PRODUCTS_KEY = 'pos_products';
const SALES_KEY = 'pos_sales';
const ORDER_COUNTER_KEY = 'pos_order_counter';
const DAILY_COUNTER_KEY = 'pos_daily_counter';

export const storage = {
  // Order counter management
  getNextOrderNumber: (): string => {
    try {
      const today = new Date();
      const day = today.getDate().toString().padStart(2, '0');
      const year = today.getFullYear().toString().slice(-2);
      const todayKey = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${day}`;
      
      // Get or create daily counter
      const dailyCounterData = localStorage.getItem(DAILY_COUNTER_KEY);
      let dailyCounters = dailyCounterData ? JSON.parse(dailyCounterData) : {};
      
      // Reset counter if it's a new day or increment existing
      const currentDayCounter = dailyCounters[todayKey] || 0;
      const newCounter = currentDayCounter + 1;
      
      // Update daily counters
      dailyCounters[todayKey] = newCounter;
      localStorage.setItem(DAILY_COUNTER_KEY, JSON.stringify(dailyCounters));
      
      return `C-${day}-${year}-${newCounter}`;
    } catch (error) {
      console.error('Error generating order number:', error);
      const today = new Date();
      const day = today.getDate().toString().padStart(2, '0');
      const year = today.getFullYear().toString().slice(-2);
      return `C-${day}-${year}-${Date.now()}`;
    }
  },

  // Products
  getProducts: (): Product[] => {
    try {
      const products = localStorage.getItem(PRODUCTS_KEY);
      return products ? JSON.parse(products) : [];
    } catch (error) {
      console.error('Error loading products:', error);
      return [];
    }
  },

  saveProducts: (products: Product[]): void => {
    try {
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
    } catch (error) {
      console.error('Error saving products:', error);
    }
  },

  addProduct: (product: Product): void => {
    const products = storage.getProducts();
    products.push(product);
    storage.saveProducts(products);
  },

  updateProduct: (updatedProduct: Product): void => {
    const products = storage.getProducts();
    const index = products.findIndex(p => p.id === updatedProduct.id);
    if (index !== -1) {
      products[index] = updatedProduct;
      storage.saveProducts(products);
    }
  },

  deleteProduct: (productId: string): void => {
    const products = storage.getProducts();
    const filtered = products.filter(p => p.id !== productId);
    storage.saveProducts(filtered);
  },

  // Sales
  getSales: (): Sale[] => {
    try {
      const sales = localStorage.getItem(SALES_KEY);
      return sales ? JSON.parse(sales).map((sale: any) => ({
        ...sale,
        timestamp: new Date(sale.timestamp)
      })) : [];
    } catch (error) {
      console.error('Error loading sales:', error);
      return [];
    }
  },

  saveSales: (sales: Sale[]): void => {
    try {
      localStorage.setItem(SALES_KEY, JSON.stringify(sales));
    } catch (error) {
      console.error('Error saving sales:', error);
    }
  },

  addSale: (sale: Sale): void => {
    const sales = storage.getSales();
    sales.push(sale);
    storage.saveSales(sales);
  },

  // Clear all data
  clearAll: (): void => {
    localStorage.removeItem(PRODUCTS_KEY);
    localStorage.removeItem(SALES_KEY);
    localStorage.removeItem(ORDER_COUNTER_KEY);
    localStorage.removeItem(DAILY_COUNTER_KEY);
  }
};
