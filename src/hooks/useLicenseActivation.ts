
import { useState, useEffect } from 'react';

export const useLicenseActivation = () => {
  const [isActivated, setIsActivated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkActivation = () => {
      const activated = localStorage.getItem('bms_pos_activated');
      setIsActivated(activated === 'true');
      setIsLoading(false);
    };

    checkActivation();
  }, []);

  const activateLicense = () => {
    setIsActivated(true);
  };

  const getLicenseInfo = () => {
    return {
      licenseKey: localStorage.getItem('bms_pos_license_key'),
      activationDate: localStorage.getItem('bms_pos_activation_date'),
    };
  };

  return {
    isActivated,
    isLoading,
    activateLicense,
    getLicenseInfo,
  };
};
