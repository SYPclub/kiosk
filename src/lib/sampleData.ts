import { Product } from '@/types/pos';
import { storage } from './storage';

export const initializeSampleData = () => {
  // Only add sample data if no products exist
  const existingProducts = storage.getProducts();
  
  if (existingProducts.length === 0) {
    const sampleProducts: Product[] = [
      {
        id: '1',
        name: 'Coffee',
        cost: 0.50,
        price: 2.50,
        category: 'Beverages',
        description: 'Premium coffee blend',
        inventory: 50,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        name: 'Sandwich',
        cost: 2.00,
        price: 6.99,
        category: 'Food',
        description: 'Fresh sandwich with premium ingredients',
        inventory: 25,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '3',
        name: 'Tea',
        cost: 0.30,
        price: 2.00,
        category: 'Beverages',
        description: 'Organic tea selection',
        inventory: 75,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '4',
        name: 'Pastry',
        cost: 1.50,
        price: 4.50,
        category: 'Food',
        description: 'Freshly baked pastry',
        inventory: 15,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '5',
        name: 'Juice',
        cost: 1.00,
        price: 3.50,
        category: 'Beverages',
        description: 'Fresh fruit juice',
        inventory: 30,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '6',
        name: 'Salad',
        cost: 2.50,
        price: 8.99,
        category: 'Food',
        description: 'Fresh garden salad',
        inventory: 20,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    storage.saveProducts(sampleProducts);
  }
};