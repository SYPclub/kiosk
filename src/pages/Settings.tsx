
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Upload, Download, Building2, Database } from 'lucide-react';
import { storage } from '@/lib/storage';
import ImageUpload from '@/components/ImageUpload';
import { useToast } from '@/hooks/use-toast';

interface CompanyInfo {
  name: string;
  address: string;
  telephone: string;
  email: string;
  logo?: string;
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  thanksMessage?: string;
}

const Settings = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load company info from localStorage
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(() => {
    try {
      const saved = localStorage.getItem('company_info');
      return saved ? JSON.parse(saved) : {
        name: '',
        address: '',
        telephone: '',
        email: '',
        logo: undefined,
        facebook: '',
        instagram: '',
        tiktok: '',
        thanksMessage: 'Thank you for shopping with us!'
      };
    } catch {
      return {
        name: '',
        address: '',
        telephone: '',
        email: '',
        logo: undefined,
        facebook: '',
        instagram: '',
        tiktok: '',
        thanksMessage: 'Thank you for shopping with us!'
      };
    }
  });

  const handleCompanyInfoChange = (field: keyof CompanyInfo, value: string | undefined) => {
    const updated = { ...companyInfo, [field]: value };
    setCompanyInfo(updated);
    localStorage.setItem('company_info', JSON.stringify(updated));
  };

  const handleExportData = () => {
    try {
      const products = storage.getProducts();
      const sales = storage.getSales();
      const company = companyInfo;
      
      const exportData = {
        products,
        sales,
        company,
        exportDate: new Date().toISOString(),
        version: '1.0'
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `pos-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: "Database has been exported successfully.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export database. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importData = JSON.parse(e.target?.result as string);
        
        // Validate import data structure
        if (!importData.products || !importData.sales) {
          throw new Error('Invalid backup file format');
        }

        // Import products
        if (importData.products.length > 0) {
          storage.saveProducts(importData.products);
        }

        // Import sales
        if (importData.sales.length > 0) {
          storage.saveSales(importData.sales.map((sale: any) => ({
            ...sale,
            timestamp: new Date(sale.timestamp)
          })));
        }

        // Import company info
        if (importData.company) {
          setCompanyInfo(importData.company);
          localStorage.setItem('company_info', JSON.stringify(importData.company));
        }

        toast({
          title: "Import Successful",
          description: "Database has been imported successfully.",
        });

        // Clear the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (error) {
        toast({
          title: "Import Failed",
          description: "Failed to import database. Please check the file format.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      storage.clearAll();
      localStorage.removeItem('company_info');
      setCompanyInfo({
        name: '',
        address: '',
        telephone: '',
        email: '',
        logo: undefined,
        facebook: '',
        instagram: '',
        tiktok: '',
        thanksMessage: 'Thank you for shopping with us!'
      });
      
      toast({
        title: "Data Cleared",
        description: "All data has been cleared successfully.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your company information and database settings.
        </p>
      </div>

      {/* Company Information Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Company Information
          </CardTitle>
          <CardDescription>
            Update your company details that will appear on receipts and reports.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company-name">Company Name</Label>
              <Input
                id="company-name"
                value={companyInfo.name}
                onChange={(e) => handleCompanyInfoChange('name', e.target.value)}
                placeholder="Enter company name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-email">Email</Label>
              <Input
                id="company-email"
                type="email"
                value={companyInfo.email}
                onChange={(e) => handleCompanyInfoChange('email', e.target.value)}
                placeholder="Enter email address"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company-phone">Telephone</Label>
              <Input
                id="company-phone"
                value={companyInfo.telephone}
                onChange={(e) => handleCompanyInfoChange('telephone', e.target.value)}
                placeholder="Enter phone number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-address">Address</Label>
              <Textarea
                id="company-address"
                value={companyInfo.address}
                onChange={(e) => handleCompanyInfoChange('address', e.target.value)}
                placeholder="Enter company address"
                rows={3}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Company Logo</Label>
            <ImageUpload
              image={companyInfo.logo}
              onImageChange={(image) => handleCompanyInfoChange('logo', image)}
              className="max-w-xs"
            />
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Social Media</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="facebook">Facebook ID</Label>
                <Input
                  id="facebook"
                  value={companyInfo.facebook || ''}
                  onChange={(e) => handleCompanyInfoChange('facebook', e.target.value)}
                  placeholder="Facebook page ID"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram ID</Label>
                <Input
                  id="instagram"
                  value={companyInfo.instagram || ''}
                  onChange={(e) => handleCompanyInfoChange('instagram', e.target.value)}
                  placeholder="Instagram handle"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tiktok">TikTok ID</Label>
                <Input
                  id="tiktok"
                  value={companyInfo.tiktok || ''}
                  onChange={(e) => handleCompanyInfoChange('tiktok', e.target.value)}
                  placeholder="TikTok username"
                />
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="thanks-message">Thank You Message</Label>
            <Textarea
              id="thanks-message"
              value={companyInfo.thanksMessage || 'Thank you for shopping with us!'}
              onChange={(e) => handleCompanyInfoChange('thanksMessage', e.target.value)}
              placeholder="Customize your thank you message"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Database Management Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Management
          </CardTitle>
          <CardDescription>
            Export, import, or clear your database. Use export to backup your data.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button onClick={handleExportData} variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Data
            </Button>
            
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="hidden"
              />
              <Button 
                onClick={() => fileInputRef.current?.click()} 
                variant="outline" 
                className="flex items-center gap-2 w-full"
              >
                <Upload className="h-4 w-4" />
                Import Data
              </Button>
            </div>

            <Button 
              onClick={handleClearData} 
              variant="destructive" 
              className="flex items-center gap-2"
            >
              <Database className="h-4 w-4" />
              Clear All Data
            </Button>
          </div>
          
          <div className="text-sm text-muted-foreground space-y-1">
            <p><strong>Export:</strong> Creates a backup file with all your products, sales, and company data.</p>
            <p><strong>Import:</strong> Restores data from a previously exported backup file.</p>
            <p><strong>Clear:</strong> Permanently removes all data. This action cannot be undone.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
