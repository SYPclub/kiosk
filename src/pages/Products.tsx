
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Product } from '@/types/pos';
import { storage } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';
import ImageUpload from '@/components/ImageUpload';

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    cost: '',
    price: '',
    category: '',
    description: '',
    image: undefined as string | undefined,
    inventory: '',
    barcode: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = () => {
    const loadedProducts = storage.getProducts();
    setProducts(loadedProducts);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      cost: '',
      price: '',
      category: '',
      description: '',
      image: undefined,
      inventory: '',
      barcode: ''
    });
    setEditingProduct(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.cost || !formData.price) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const cost = parseFloat(formData.cost);
    const price = parseFloat(formData.price);

    if (isNaN(cost) || isNaN(price) || cost < 0 || price < 0) {
      toast({
        title: "Validation Error",
        description: "Please enter valid positive numbers for cost and price",
        variant: "destructive"
      });
      return;
    }

    const inventory = parseInt(formData.inventory) || 0;

    const product: Product = {
      id: editingProduct?.id || Date.now().toString(),
      name: formData.name,
      cost,
      price,
      category: formData.category,
      description: formData.description,
      image: formData.image,
      inventory,
      barcode: formData.barcode || undefined,
      createdAt: editingProduct?.createdAt || new Date(),
      updatedAt: new Date()
    };

    if (editingProduct) {
      storage.updateProduct(product);
      toast({
        title: "Product Updated",
        description: `${product.name} has been updated successfully`
      });
    } else {
      storage.addProduct(product);
      toast({
        title: "Product Added",
        description: `${product.name} has been added successfully`
      });
    }

    loadProducts();
    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name ?? '',
      cost: product.cost != null ? product.cost.toString() : '',
      price: product.price != null ? product.price.toString() : '',
      category: product.category ?? '',
      description: product.description ?? '',
      image: product.image,
      inventory: product.inventory != null ? product.inventory.toString() : '',
      barcode: product.barcode ?? ''
    });
    setIsDialogOpen(true);
  };


  const handleDelete = (product: Product) => {
    storage.deleteProduct(product.id);
    loadProducts();
    toast({
      title: "Product Deleted",
      description: `${product.name} has been deleted`
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground">Manage your product inventory</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary-hover shadow-soft" onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="image">Product Image</Label>
                <ImageUpload
                  image={formData.image}
                  onImageChange={(image) => setFormData({...formData, image})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter product name"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cost">Cost Price *</Label>
                  <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.cost}
                    onChange={(e) => setFormData({...formData, cost: e.target.value})}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Sale Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  placeholder="Enter category"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="inventory">Inventory Quantity</Label>
                <Input
                  id="inventory"
                  type="number"
                  min="0"
                  value={formData.inventory}
                  onChange={(e) => setFormData({...formData, inventory: e.target.value})}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="barcode">Barcode</Label>
                <Input
                  id="barcode"
                  value={formData.barcode}
                  onChange={(e) => setFormData({...formData, barcode: e.target.value})}
                  placeholder="Enter product barcode"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Enter product description"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary-hover">
                  {editingProduct ? 'Update' : 'Add'} Product
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
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
                <div className="flex space-x-1">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(product)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(product)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Cost:</span>
                  <span className="font-medium">${product.cost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Price:</span>
                  <span className="font-medium text-primary">${product.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Profit:</span>
                  <span className="font-medium text-success">
                    ${(product.price - product.cost).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Stock:</span>
                  <span className={`font-medium ${product.inventory < 10 ? 'text-destructive' : 'text-foreground'}`}>
                    {product.inventory} units
                  </span>
                </div>
                {product.barcode && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Barcode:</span>
                    <span className="font-medium text-xs">{product.barcode}</span>
                  </div>
                )}
                {product.description && (
                  <p className="text-sm text-muted-foreground mt-2">{product.description}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {products.length === 0 && (
        <Card className="p-12 text-center">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No products yet</h3>
          <p className="text-muted-foreground mb-4">Add your first product to get started</p>
          <Button onClick={() => setIsDialogOpen(true)} className="bg-primary text-primary-foreground hover:bg-primary-hover">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </Card>
      )}
    </div>
  );
};

export default Products;
