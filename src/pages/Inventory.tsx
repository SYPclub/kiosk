import { useState, useEffect } from 'react';
import { Package, Search, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Product } from '@/types/pos';
import { storage } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';

const Inventory = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [adjustmentQuantity, setAdjustmentQuantity] = useState('');
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'subtract'>('add');
  const { toast } = useToast();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = () => {
    const loadedProducts = storage.getProducts();
    setProducts(loadedProducts);
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockProducts = products.filter(product => product.inventory < 10);

  const handleInventoryAdjustment = () => {
    if (!selectedProduct || !adjustmentQuantity) {
      toast({
        title: "Validation Error",
        description: "Please enter a quantity",
        variant: "destructive"
      });
      return;
    }

    const quantity = parseInt(adjustmentQuantity);
    if (isNaN(quantity) || quantity <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid positive number",
        variant: "destructive"
      });
      return;
    }

    const newInventory = adjustmentType === 'add' 
      ? selectedProduct.inventory + quantity
      : Math.max(0, selectedProduct.inventory - quantity);

    const updatedProduct = {
      ...selectedProduct,
      inventory: newInventory,
      updatedAt: new Date()
    };

    storage.updateProduct(updatedProduct);
    loadProducts();
    setIsDialogOpen(false);
    setAdjustmentQuantity('');
    setSelectedProduct(null);

    toast({
      title: "Inventory Updated",
      description: `${selectedProduct.name} inventory ${adjustmentType === 'add' ? 'increased' : 'decreased'} by ${quantity} units`
    });
  };

  const openAdjustmentDialog = (product: Product, type: 'add' | 'subtract') => {
    setSelectedProduct(product);
    setAdjustmentType(type);
    setIsDialogOpen(true);
  };

  const totalInventoryValue = products.reduce((total, product) => 
    total + (product.inventory * product.cost), 0
  );

  const totalInventoryItems = products.reduce((total, product) => 
    total + product.inventory, 0
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Inventory Management</h1>
          <p className="text-muted-foreground">Track and manage your product inventory</p>
        </div>
      </div>

      {/* Inventory Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-soft">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Total Inventory Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">${totalInventoryValue.toFixed(2)}</div>
            <p className="text-sm text-muted-foreground">Based on cost price</p>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Total Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalInventoryItems}</div>
            <p className="text-sm text-muted-foreground">Units in stock</p>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Low Stock Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{lowStockProducts.length}</div>
            <p className="text-sm text-muted-foreground">Items below 10 units</p>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <Card className="border-destructive shadow-soft">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <AlertTriangle className="h-5 w-5 text-destructive mr-2" />
              Low Stock Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStockProducts.map((product) => (
                <div key={product.id} className="flex justify-between items-center p-2 bg-destructive/10 rounded">
                  <span className="font-medium">{product.name}</span>
                  <span className="text-destructive font-bold">{product.inventory} units</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="shadow-soft hover:shadow-medium transition-smooth">
            <CardHeader className="pb-3">
              {product.image && (
                <div className="w-full h-32 bg-muted rounded-lg overflow-hidden mb-3">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  {product.category && (
                    <p className="text-sm text-muted-foreground">{product.category}</p>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Current Stock:</span>
                  <span className={`font-bold text-lg ${product.inventory < 10 ? 'text-destructive' : 'text-foreground'}`}>
                    {product.inventory} units
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Value:</span>
                  <span className="font-medium">${(product.inventory * product.cost).toFixed(2)}</span>
                </div>
                <div className="flex space-x-2 pt-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => openAdjustmentDialog(product, 'add')}
                  >
                    <TrendingUp className="h-4 w-4 mr-1" />
                    Add Stock
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => openAdjustmentDialog(product, 'subtract')}
                  >
                    <TrendingDown className="h-4 w-4 mr-1" />
                    Remove Stock
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <Card className="p-12 text-center">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No products found</h3>
          <p className="text-muted-foreground">Try adjusting your search terms</p>
        </Card>
      )}

      {/* Inventory Adjustment Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>
              {adjustmentType === 'add' ? 'Add Stock' : 'Remove Stock'} - {selectedProduct?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={adjustmentQuantity}
                onChange={(e) => setAdjustmentQuantity(e.target.value)}
                placeholder="Enter quantity"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              Current stock: {selectedProduct?.inventory} units
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleInventoryAdjustment} className="bg-primary text-primary-foreground hover:bg-primary-hover">
                {adjustmentType === 'add' ? 'Add Stock' : 'Remove Stock'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Inventory;