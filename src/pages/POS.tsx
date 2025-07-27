import { useState, useEffect, useCallback } from 'react';
import { Plus, Minus, ShoppingCart, CreditCard, Package, Home, ArrowLeft, Maximize, Minimize } from 'lucide-react';
import { useFullscreen } from '@/contexts/FullscreenContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Product, CartItem, Sale } from '@/types/pos';
import { storage } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';
import { printReceipt } from '@/utils/receiptPrinter';
const POS = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'categories' | 'products'>('categories');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const { isFullscreen, toggleFullscreen } = useFullscreen();
  const {
    toast
  } = useToast();
  useEffect(() => {
    loadProducts();
  }, []);

  // Barcode scanning
  useEffect(() => {
    let barcode = '';
    let timeout: NodeJS.Timeout;

    const handleKeyPress = (e: KeyboardEvent) => {
      // Clear timeout on new input
      clearTimeout(timeout);
      
      if (e.key === 'Enter') {
        // Enter key indicates end of barcode scan
        if (barcode.length > 0) {
          handleBarcodeScanned(barcode);
          barcode = '';
        }
      } else if (e.key.length === 1) {
        // Add character to barcode
        barcode += e.key;
        
        // Auto-submit after 100ms of no input (for scanners that don't send Enter)
        timeout = setTimeout(() => {
          if (barcode.length > 0) {
            handleBarcodeScanned(barcode);
            barcode = '';
          }
        }, 100);
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => {
      window.removeEventListener('keypress', handleKeyPress);
      clearTimeout(timeout);
    };
  }, [products]);

  const handleBarcodeScanned = useCallback((scannedBarcode: string) => {
    const product = products.find(p => p.barcode === scannedBarcode);
    if (product) {
      addToCart(product);
      toast({
        title: "Product Added",
        description: `${product.name} added to cart via barcode scan`,
        variant: "default"
      });
    } else {
      toast({
        title: "Product Not Found",
        description: `No product found with barcode: ${scannedBarcode}`,
        variant: "destructive"
      });
    }
  }, [products, toast]);
  const loadProducts = () => {
    const loadedProducts = storage.getProducts();
    setProducts(loadedProducts);
  };

  // Get unique categories
  const categories = Array.from(new Set(products.map(product => product.category).filter(Boolean))) as string[];
  const filteredProducts = viewMode === 'products' && selectedCategory ? products.filter(product => product.category === selectedCategory && (product.name.toLowerCase().includes(searchTerm.toLowerCase()) || product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase()))) : products.filter(product => product.name.toLowerCase().includes(searchTerm.toLowerCase()) || product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredCategories = categories.filter(category => category.toLowerCase().includes(searchTerm.toLowerCase()));
  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    setViewMode('products');
    setSearchTerm('');
  };
  const handleBackToCategories = () => {
    setViewMode('categories');
    setSelectedCategory('');
    setSearchTerm('');
  };
  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === product.id);
      if (existingItem) {
        return prevCart.map(item => item.product.id === product.id ? {
          ...item,
          quantity: item.quantity + 1
        } : item);
      } else {
        return [...prevCart, {
          product,
          quantity: 1
        }];
      }
    });
  };
  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(prevCart => prevCart.map(item => item.product.id === productId ? {
        ...item,
        quantity: newQuantity
      } : item));
    }
  };
  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
  };
  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
  };
  const getCartProfit = () => {
    return cart.reduce((profit, item) => profit + (item.product.price - item.product.cost) * item.quantity, 0);
  };
  const handleCheckout = () => {
    if (cart.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add items to cart before checkout",
        variant: "destructive"
      });
      return;
    }
    const orderNumber = storage.getNextOrderNumber();
    const sale: Sale = {
      id: orderNumber,
      items: [...cart],
      total: getCartTotal(),
      profit: getCartProfit(),
      timestamp: new Date(),
      paymentMethod: 'cash'
    };
    storage.addSale(sale);

    // Get company information for receipt
    const companyInfo = (() => {
      try {
        const saved = localStorage.getItem('company_info');
        return saved ? JSON.parse(saved) : {
          name: '',
          address: '',
          telephone: '',
          email: '',
          logo: undefined
        };
      } catch {
        return {
          name: '',
          address: '',
          telephone: '',
          email: '',
          logo: undefined
        };
      }
    })();

    // Prepare receipt data
    const receiptData = {
      orderNumber,
      items: cart.map(item => ({
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
        total: item.product.price * item.quantity
      })),
      total: getCartTotal(),
      timestamp: sale.timestamp
    };

    // Print receipt
    printReceipt(receiptData, companyInfo);
    setCart([]);
    toast({
      title: "Sale Completed",
      description: `Sale of $${sale.total.toFixed(2)} completed successfully. Receipt printed.`,
      variant: "default"
    });
  };
  return <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-center">
      {/* Products/Categories Section */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-bold text-foreground">
              {viewMode === 'categories' ? 'Categories' : selectedCategory}
            </h1>
            {viewMode === 'products' && <Button variant="outline" size="sm" onClick={handleBackToCategories} className="flex items-center space-x-2 rounded-xl bg-[#1c71e9] text-slate-50">
                <ArrowLeft className="h-4 w-4" />
                <span className="text-slate-50 text-base text-center font-bold">Back to Categories</span>
              </Button>}
          </div>
          <div className="flex items-center space-x-2">
            {viewMode === 'categories' && <Button variant="ghost" size="sm" onClick={handleBackToCategories} className="flex items-center space-x-2">
                <Home className="h-4 w-4" />
                <span>Categories</span>
              </Button>}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={toggleFullscreen}
              className="flex items-center space-x-2"
            >
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
              <span>{isFullscreen ? 'Exit' : 'Fullscreen'}</span>
            </Button>
          </div>
        </div>

        <Input placeholder={viewMode === 'categories' ? "Search categories..." : "Search products..."} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="max-w-md" />

        {/* Categories View */}
        {viewMode === 'categories' && <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredCategories.map(category => {
            const categoryProducts = products.filter(p => p.category === category);
            const firstProductImage = categoryProducts.find(p => p.image)?.image;
            return <Card key={category} className="shadow-soft hover:shadow-medium transition-smooth cursor-pointer" onClick={() => handleCategoryClick(category)}>
                    <CardHeader className="pb-2">
                      {firstProductImage && <div className="w-full h-24 bg-muted rounded-lg overflow-hidden mb-2">
                          <img src={firstProductImage} alt={category} className="w-full h-full object-cover" />
                        </div>}
                      <CardTitle className="text-lg">{category}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {categoryProducts.length} product{categoryProducts.length !== 1 ? 's' : ''}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          ${Math.min(...categoryProducts.map(p => p.price)).toFixed(2)} - 
                          ${Math.max(...categoryProducts.map(p => p.price)).toFixed(2)}
                        </span>
                        <Button size="sm" variant="outline">
                          View Products
                        </Button>
                      </div>
                    </CardContent>
                  </Card>;
          })}
            </div>

            {filteredCategories.length === 0 && <Card className="p-12 text-center">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {searchTerm ? 'No categories found' : 'No categories available'}
                </h3>
                <p className="text-muted-foreground">
                  {searchTerm ? 'Try adjusting your search term' : 'Add products with categories to start'}
                </p>
              </Card>}
          </>}

        {/* Products View */}
        {viewMode === 'products' && <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredProducts.map(product => <Card key={product.id} className="shadow-soft hover:shadow-medium transition-smooth cursor-pointer" onClick={() => addToCart(product)}>
                  <CardHeader className="pb-2">
                    {product.image && <div className="w-full h-24 bg-muted rounded-lg overflow-hidden mb-2">
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                      </div>}
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    {product.category && <p className="text-sm text-muted-foreground">{product.category}</p>}
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-primary">${product.price.toFixed(2)}</span>
                      <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary-hover">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {product.description && <p className="text-sm text-muted-foreground mt-2">{product.description}</p>}
                  </CardContent>
                </Card>)}
            </div>

            {filteredProducts.length === 0 && <Card className="p-12 text-center">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {searchTerm ? 'No products found' : 'No products in this category'}
                </h3>
                <p className="text-muted-foreground">
                  {searchTerm ? 'Try adjusting your search term' : 'This category is empty'}
                </p>
              </Card>}
          </>}
      </div>

      {/* Cart Section */}
      <div className="space-y-3">
        <Card className="shadow-medium">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Cart ({cart.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {cart.map(item => <div key={item.product.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                  <div className="flex items-center space-x-2 flex-1">
                    {item.product.image && <div className="w-10 h-10 bg-background rounded overflow-hidden flex-shrink-0">
                        <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                      </div>}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate text-sm">{item.product.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        ${item.product.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button size="sm" variant="outline" onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="h-8 w-8 p-0">
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-6 text-center text-sm">{item.quantity}</span>
                    <Button size="sm" variant="outline" onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="h-8 w-8 p-0">
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>)}

              {cart.length === 0 && <div className="text-center py-6">
                  <ShoppingCart className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground text-sm">Your cart is empty</p>
                </div>}
            </div>
          </CardContent>
        </Card>

        {cart.length > 0 && <Card className="shadow-medium fixed bottom-4 right-4 w-80 z-50 border-2">
            <CardContent className="pt-4">
              <div className="space-y-2">
                <div className="flex justify-between text-base">
                  <span>Subtotal:</span>
                  <span>${getCartTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Profit:</span>
                  <span className="text-success">${getCartProfit().toFixed(2)}</span>
                </div>
                <hr />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>${getCartTotal().toFixed(2)}</span>
                </div>
                <Button className="w-full bg-success text-success-foreground hover:bg-success/90 shadow-soft text-base py-4 mt-3" onClick={handleCheckout}>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Complete Sale
                </Button>
              </div>
            </CardContent>
          </Card>}
      </div>
    </div>;
};
export default POS;