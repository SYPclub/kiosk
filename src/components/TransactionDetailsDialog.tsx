
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sale } from '@/types/pos';
import { Calendar, ShoppingBag, DollarSign } from 'lucide-react';

interface TransactionDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  sale: Sale | null;
}

const TransactionDetailsDialog = ({ isOpen, onClose, sale }: TransactionDetailsDialogProps) => {
  if (!sale) return null;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Transaction Details - {sale.id}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Transaction Info */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Date:</span>
                  <span className="font-medium">{formatDate(sale.timestamp)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Payment:</span>
                  <Badge variant="outline">{sale.paymentMethod || 'cash'}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-medium mb-4">Items Purchased</h3>
              <div className="space-y-3">
                {sale.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      {item.product.image && (
                        <div className="w-12 h-12 bg-background rounded overflow-hidden">
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <h4 className="font-medium">{item.product.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(item.product.price)} each
                        </p>
                        {item.product.category && (
                          <Badge variant="secondary" className="text-xs mt-1">
                            {item.product.category}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {item.quantity} × {formatCurrency(item.product.price)}
                      </div>
                      <div className="text-sm font-bold text-primary">
                        {formatCurrency(item.quantity * item.product.price)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Totals */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex justify-between text-lg">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(sale.total)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Profit:</span>
                  <span className="text-success">{formatCurrency(sale.profit)}</span>
                </div>
                <hr />
                <div className="flex justify-between text-xl font-bold">
                  <span>Total:</span>
                  <span className="text-primary">{formatCurrency(sale.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionDetailsDialog;
