
import { NavLink, Outlet } from 'react-router-dom';
import { ShoppingCart, Package, BarChart3, Settings, Archive } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useFullscreen } from '@/contexts/FullscreenContext';

const Layout = () => {
  const { isFullscreen } = useFullscreen();

  if (isFullscreen) {
    return (
      <div className="min-h-screen bg-background">
        <main className="w-full h-screen p-4">
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary shadow-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <ShoppingCart className="h-8 w-8 text-primary-foreground mr-3" />
              <h1 className="text-2xl font-bold text-primary-foreground">BMS POS</h1>
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <NavLink
              to="/pos"
              className={({ isActive }) =>
                `flex items-center px-1 py-4 text-sm font-medium border-b-2 transition-smooth ${
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                }`
              }
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Point of Sale
            </NavLink>
            <NavLink
              to="/products"
              className={({ isActive }) =>
                `flex items-center px-1 py-4 text-sm font-medium border-b-2 transition-smooth ${
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                }`
              }
            >
              <Package className="h-4 w-4 mr-2" />
              Products
            </NavLink>
            <NavLink
              to="/inventory"
              className={({ isActive }) =>
                `flex items-center px-1 py-4 text-sm font-medium border-b-2 transition-smooth ${
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                }`
              }
            >
              <Archive className="h-4 w-4 mr-2" />
              Inventory
            </NavLink>
            <NavLink
              to="/reports"
              className={({ isActive }) =>
                `flex items-center px-1 py-4 text-sm font-medium border-b-2 transition-smooth ${
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                }`
              }
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Reports
            </NavLink>
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `flex items-center px-1 py-4 text-sm font-medium border-b-2 transition-smooth ${
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                }`
              }
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </NavLink>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
