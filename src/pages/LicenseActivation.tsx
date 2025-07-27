
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShieldCheck, AlertCircle } from 'lucide-react';

const VALID_LICENSE_KEYS = [
  'YTMG3'
];

interface LicenseActivationProps {
  onActivationSuccess: () => void;
}

const LicenseActivation = ({ onActivationSuccess }: LicenseActivationProps) => {
  const [licenseKey, setLicenseKey] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleActivation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate activation process
    setTimeout(() => {
      const formattedKey = licenseKey.trim().toUpperCase();
      
      if (VALID_LICENSE_KEYS.includes(formattedKey)) {
        // Store activation status
        localStorage.setItem('bms_pos_activated', 'true');
        localStorage.setItem('bms_pos_license_key', formattedKey);
        localStorage.setItem('bms_pos_activation_date', new Date().toISOString());
        
        onActivationSuccess();
      } else {
        setError('Invalid license key. Please check your key and try again.');
      }
      
      setIsLoading(false);
    }, 1000);
  };

  const formatLicenseKey = (value: string) => {
    // Remove all non-alphanumeric characters and convert to uppercase
    const cleaned = value.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    
    // Add dashes every 5 characters
    const formatted = cleaned.match(/.{1,5}/g)?.join('-') || cleaned;
    
    // Limit to 29 characters (5+1+5+1+5+1+5+1+5 = 29)
    return formatted.substring(0, 29);
  };

  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatLicenseKey(e.target.value);
    setLicenseKey(formatted);
    setError('');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-primary rounded-full flex items-center justify-center">
            <ShieldCheck className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">License Activation</CardTitle>
          <CardDescription>
            Enter your license key to activate BMS POS
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleActivation} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="license-key">License Key</Label>
              <Input
                id="license-key"
                type="text"
                placeholder="XXXXX-XXXXX-XXXXX-XXXXX-XXXXX"
                value={licenseKey}
                onChange={handleKeyChange}
                className="font-mono text-center"
                maxLength={29}
                required
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || licenseKey.length < 29}
            >
              {isLoading ? 'Activating...' : 'Activate License'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>Contact support if you need assistance with your license key.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LicenseActivation;
