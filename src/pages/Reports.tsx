import { useState, useEffect } from 'react';
import { Calendar, DollarSign, ShoppingBag, TrendingUp, Package, Archive, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sale, SalesReport, Product } from '@/types/pos';
import { storage } from '@/lib/storage';
import TransactionDetailsDialog from '@/components/TransactionDetailsDialog';

const Reports = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [filteredSales, setFilteredSales] = useState<Sale[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [report, setReport] = useState<SalesReport | null>(null);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    loadSales();
    loadProducts();
  }, []);

  useEffect(() => {
    filterSales();
  }, [sales, startDate, endDate]);

  const loadSales = () => {
    const loadedSales = storage.getSales();
    setSales(loadedSales);
  };

  const loadProducts = () => {
    const loadedProducts = storage.getProducts();
    setProducts(loadedProducts);
  };

  const filterSales = () => {
    let filtered = [...sales];

    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      filtered = filtered.filter(sale => sale.timestamp >= start);
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter(sale => sale.timestamp <= end);
    }

    setFilteredSales(filtered);
    generateReport(filtered);
  };

  const generateReport = (salesData: Sale[]) => {
    if (salesData.length === 0) {
      setReport(null);
      return;
    }

    const totalSales = salesData.reduce((sum, sale) => sum + sale.total, 0);
    const totalProfit = salesData.reduce((sum, sale) => sum + sale.profit, 0);
    const totalTransactions = salesData.length;
    const averageTransactionValue = totalSales / totalTransactions;

    // Best selling products
    const productMap = new Map();
    salesData.forEach(sale => {
      sale.items.forEach(item => {
        const existing = productMap.get(item.product.id);
        if (existing) {
          existing.quantity += item.quantity;
        } else {
          productMap.set(item.product.id, {
            product: item.product,
            quantity: item.quantity
          });
        }
      });
    });

    const bestSellingProducts = Array.from(productMap.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // Sales by date
    const dateMap = new Map();
    salesData.forEach(sale => {
      const dateKey = sale.timestamp.toISOString().split('T')[0];
      const existing = dateMap.get(dateKey);
      if (existing) {
        existing.sales += sale.total;
        existing.profit += sale.profit;
      } else {
        dateMap.set(dateKey, {
          date: dateKey,
          sales: sale.total,
          profit: sale.profit
        });
      }
    });

    const salesByDate = Array.from(dateMap.values())
      .sort((a, b) => a.date.localeCompare(b.date));

    setReport({
      totalSales,
      totalProfit,
      totalTransactions,
      averageTransactionValue,
      bestSellingProducts,
      salesByDate
    });
  };

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const handleTransactionClick = (sale: Sale) => {
    setSelectedSale(sale);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedSale(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Sales Reports</h1>
          <p className="text-muted-foreground">Track your business performance</p>
        </div>
      </div>

      {/* Date Filter */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Date Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {report && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{formatCurrency(report.totalSales)}</div>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{formatCurrency(report.totalProfit)}</div>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Transactions</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{report.totalTransactions}</div>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Transaction</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(report.averageTransactionValue)}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Best Selling Products */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Best Selling Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            {report?.bestSellingProducts.length ? (
              <div className="space-y-3">
                {report.bestSellingProducts.map((item, index) => (
                  <div key={item.product.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <span className="font-medium">{item.product.name}</span>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(item.product.price)} each
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{item.quantity} sold</div>
                      <div className="text-sm text-success">
                        {formatCurrency(item.quantity * item.product.price)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No sales data available</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShoppingBag className="h-5 w-5 mr-2" />
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredSales.length ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredSales
                  .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                  .slice(0, 10)
                  .map((sale) => (
                    <div 
                      key={sale.id} 
                      className="flex items-center justify-between p-3 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors"
                      onClick={() => handleTransactionClick(sale)}
                    >
                      <div>
                        <div className="font-medium">{formatCurrency(sale.total)}</div>
                        <div className="text-sm text-muted-foreground">
                          {sale.id} • {formatDate(sale.timestamp)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {sale.items.length} item{sale.items.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-success font-medium">
                          +{formatCurrency(sale.profit)}
                        </div>
                        <div className="text-xs text-muted-foreground">profit</div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No transactions found</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Inventory Overview */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Archive className="h-5 w-5 mr-2" />
            Inventory Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          {products.length > 0 ? (
            <div className="space-y-4">
              {/* Inventory Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-foreground">
                    {products.reduce((total, product) => total + product.inventory, 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Items</div>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    ${products.reduce((total, product) => total + (product.inventory * product.cost), 0).toFixed(2)}
                  </div>
                  <div className="text-sm text-muted-foreground">Inventory Value</div>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-destructive">
                    {products.filter(product => product.inventory < 10).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Low Stock Items</div>
                </div>
              </div>

              {/* Low Stock Alert */}
              {products.filter(product => product.inventory < 10).length > 0 && (
                <div className="border border-destructive rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <AlertTriangle className="h-5 w-5 text-destructive mr-2" />
                    <h4 className="font-medium text-destructive">Low Stock Alert</h4>
                  </div>
                  <div className="space-y-2">
                    {products
                      .filter(product => product.inventory < 10)
                      .map((product) => (
                        <div key={product.id} className="flex justify-between items-center p-2 bg-destructive/10 rounded">
                          <span className="font-medium">{product.name}</span>
                          <span className="text-destructive font-bold">{product.inventory} units left</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Top Inventory by Value */}
              <div>
                <h4 className="font-medium mb-3">Top Inventory by Value</h4>
                <div className="space-y-2">
                  {products
                    .sort((a, b) => (b.inventory * b.cost) - (a.inventory * a.cost))
                    .slice(0, 5)
                    .map((product) => (
                      <div key={product.id} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <div>
                          <span className="font-medium">{product.name}</span>
                          <p className="text-sm text-muted-foreground">
                            {product.inventory} units @ ${product.cost.toFixed(2)} each
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">${(product.inventory * product.cost).toFixed(2)}</div>
                          <div className="text-sm text-muted-foreground">value</div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No products found</p>
          )}
        </CardContent>
      </Card>

      {!report && sales.length === 0 && (
        <Card className="p-12 text-center">
          <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No sales data</h3>
          <p className="text-muted-foreground">Start making sales to see your reports here</p>
        </Card>
      )}

      <TransactionDetailsDialog
        isOpen={isDialogOpen}
        onClose={closeDialog}
        sale={selectedSale}
      />
    </div>
  );
};

export default Reports;
