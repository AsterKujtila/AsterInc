import React, { useState } from 'react';
import { Upload, Coins, AlertCircle, CheckCircle } from 'lucide-react';
import { CreateTokenForm as CreateTokenFormType } from '../types';
import { cn } from '../utils/cn';

interface CreateTokenFormProps {
  onSubmit: (formData: CreateTokenFormType) => void;
  isLoading: boolean;
}

const CreateTokenForm: React.FC<CreateTokenFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<CreateTokenFormType>({
    name: '',
    ticker: '',
    description: '',
    image: null,
  });

  const [errors, setErrors] = useState<Partial<CreateTokenFormType>>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const newErrors: Partial<CreateTokenFormType> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Token name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Token name must be at least 2 characters';
    }

    if (!formData.ticker.trim()) {
      newErrors.ticker = 'Ticker is required';
    } else if (!/^[A-Z]{2,5}$/.test(formData.ticker)) {
      newErrors.ticker = 'Ticker must be 2-5 uppercase letters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    if (!formData.image) {
      newErrors.image = 'Token image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof CreateTokenFormType, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setErrors(prev => ({ ...prev, image: 'Image must be less than 5MB' }));
        return;
      }
      
      setFormData(prev => ({ ...prev, image: file }));
      setErrors(prev => ({ ...prev, image: undefined }));
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-aster to-success rounded-full flex items-center justify-center mx-auto mb-4">
          <Coins className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Launch Your Meme Coin</h1>
        <p className="text-gray-400">Create and launch your token in seconds</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Token Name */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Token Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="e.g., Doge Killer"
            className={cn(
              "w-full px-4 py-3 bg-dark-surface border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-colors",
              errors.name 
                ? "border-danger focus:ring-danger" 
                : "border-dark-border focus:ring-aster"
            )}
          />
          {errors.name && (
            <div className="flex items-center mt-2 text-danger text-sm">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.name}
            </div>
          )}
        </div>

        {/* Ticker */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Ticker Symbol *
          </label>
          <input
            type="text"
            value={formData.ticker}
            onChange={(e) => handleInputChange('ticker', e.target.value.toUpperCase())}
            placeholder="e.g., DOGEK"
            maxLength={5}
            className={cn(
              "w-full px-4 py-3 bg-dark-surface border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-colors font-mono",
              errors.ticker 
                ? "border-danger focus:ring-danger" 
                : "border-dark-border focus:ring-aster"
            )}
          />
          {errors.ticker && (
            <div className="flex items-center mt-2 text-danger text-sm">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.ticker}
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Describe your token's purpose and community..."
            rows={3}
            className={cn(
              "w-full px-4 py-3 bg-dark-surface border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-colors resize-none",
              errors.description 
                ? "border-danger focus:ring-danger" 
                : "border-dark-border focus:ring-aster"
            )}
          />
          {errors.description && (
            <div className="flex items-center mt-2 text-danger text-sm">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.description}
            </div>
          )}
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Token Image *
          </label>
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className={cn(
                "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
                errors.image 
                  ? "border-danger hover:bg-danger/10" 
                  : "border-dark-border hover:bg-dark-border/50"
              )}
            >
              {imagePreview ? (
                <div className="relative w-full h-full">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                    <Upload className="w-6 h-6 text-white" />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-400">
                    Click to upload image
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG up to 5MB
                  </p>
                </div>
              )}
            </label>
          </div>
          {errors.image && (
            <div className="flex items-center mt-2 text-danger text-sm">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.image}
            </div>
          )}
        </div>

        {/* Launch Button */}
        <button
          type="submit"
          disabled={isLoading}
          className={cn(
            "w-full py-4 px-6 rounded-lg font-semibold text-white transition-all duration-200 flex items-center justify-center space-x-2",
            isLoading
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-gradient-to-r from-aster to-success hover:from-aster/90 hover:to-success/90 transform hover:scale-105 active:scale-95"
          )}
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Launching...</span>
            </>
          ) : (
            <>
              <Coins className="w-5 h-5" />
              <span>Launch Coin (0.1 SOL)</span>
            </>
          )}
        </button>

        {/* Info */}
        <div className="bg-dark-border/50 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
            <div className="text-sm text-gray-300">
              <p className="font-medium mb-1">Launch Details:</p>
              <ul className="space-y-1 text-gray-400">
                <li>• Fixed launch fee: 0.1 SOL</li>
                <li>• 100% liquidity guaranteed</li>
                <li>• Auto-graduation at $69K market cap</li>
                <li>• 1% trading fee (0.5% liquidity + 0.5% platform)</li>
              </ul>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateTokenForm;