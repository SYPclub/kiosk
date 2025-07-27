
import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ImageUploadProps {
  image?: string;
  onImageChange: (image: string | undefined) => void;
  className?: string;
}

const ImageUpload = ({ image, onImageChange, className = "" }: ImageUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Image size must be less than 2MB');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onImageChange(result);
      setIsLoading(false);
    };
    reader.onerror = () => {
      alert('Error reading file');
      setIsLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    onImageChange(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      {image ? (
        <div className="relative w-full h-32 bg-muted rounded-lg overflow-hidden">
          <img
            src={image}
            alt="Product"
            className="w-full h-full object-cover"
          />
          <Button
            type="button"
            size="sm"
            variant="destructive"
            className="absolute top-2 right-2"
            onClick={handleRemoveImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div 
          className="w-full h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
          onClick={handleUploadClick}
        >
          {isLoading ? (
            <div className="text-sm text-muted-foreground">Loading...</div>
          ) : (
            <>
              <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
              <div className="text-sm text-muted-foreground text-center">
                <div>Click to upload image</div>
                <div className="text-xs">(Max 2MB)</div>
              </div>
            </>
          )}
        </div>
      )}
      
      {image && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleUploadClick}
          className="w-full"
        >
          <Upload className="h-4 w-4 mr-2" />
          Change Image
        </Button>
      )}
    </div>
  );
};

export default ImageUpload;
