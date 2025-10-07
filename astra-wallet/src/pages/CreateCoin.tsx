import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';
import { useData } from '../contexts/DataContext';
import { Upload, Zap, AlertCircle, CheckCircle } from 'lucide-react';

const CreateCoin: React.FC = () => {
  const navigate = useNavigate();
  const { connected, balance } = useWallet();
  const { addToken } = useData();

  const [formData, setFormData] = useState({
    name: '',
    ticker: '',
    description: '',
    image: null as File | null
  });
  
  const [creating, setCreating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const LAUNCH_FEE = 0.02; // SOL

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: 'Image must be less than 2MB' }));
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, image: 'Please select a valid image file' }));
        return;
      }
      
      setFormData(prev => ({ ...prev, image: file }));
      setErrors(prev => ({ ...prev, image: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Token name is required';
    } else if (formData.name.length > 32) {
      newErrors.name = 'Token name must be 32 characters or less';
    }

    if (!formData.ticker.trim()) {
      newErrors.ticker = 'Ticker is required';
    } else if (!/^[A-Z]{1,5}$/.test(formData.ticker)) {
      newErrors.ticker = 'Ticker must be 1-5 uppercase letters only';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length > 200) {
      newErrors.description = 'Description must be 200 characters or less';
    }

    if (!connected) {
      newErrors.wallet = 'Please connect your wallet';
    } else if (balance < LAUNCH_FEE) {
      newErrors.wallet = `Insufficient balance. Need ${LAUNCH_FEE} SOL`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setCreating(true);
    
    try {
      // Simulate token creation process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Add token to the data context
      const newToken = {
        name: formData.name,
        ticker: formData.ticker,
        description: formData.description,
        marketCap: 1000, // Starting market cap
        change24h: 0,
        graduationProgress: 0,
        creator: 'user-wallet-address',
        holders: 1,
        totalSupply: 1000000000,
        price: 0.000001,
        volume24h: 0,
        liquidity: 1000
      };
      
      addToken(newToken);
      
      // Navigate to the new token's trading page
      navigate(`/coin/${formData.ticker}`);
      
    } catch (error) {
      console.error('Failed to create token:', error);
      setErrors({ submit: 'Failed to create token. Please try again.' });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-xl">
        <h1 className="mb-md">Launch Your Meme Coin</h1>
        <p className="text-muted">
          Create and launch your token on the Solana blockchain in seconds. 
          Your token will trade on a bonding curve until it reaches $69K market cap.
        </p>
      </div>

      {!connected && (
        <div className="card mb-lg" style={{ borderColor: 'var(--red)' }}>
          <div className="flex items-center gap-md">
            <AlertCircle className="text-red" size={24} />
            <div>
              <h4 className="text-red">Wallet Not Connected</h4>
              <p className="text-muted">Please connect your wallet to create a token.</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-lg">
        <div className="card">
          <h3 className="mb-lg">Token Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
            {/* Token Name */}
            <div>
              <label className="block text-sm font-medium mb-sm">
                Token Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., DogeCoin 2.0"
                className={`input ${errors.name ? 'border-red' : ''}`}
                maxLength={32}
              />
              {errors.name && (
                <p className="text-red text-sm mt-xs">{errors.name}</p>
              )}
              <p className="text-muted text-sm mt-xs">
                {formData.name.length}/32 characters
              </p>
            </div>

            {/* Ticker */}
            <div>
              <label className="block text-sm font-medium mb-sm">
                Ticker Symbol *
              </label>
              <input
                type="text"
                value={formData.ticker}
                onChange={(e) => handleInputChange('ticker', e.target.value.toUpperCase())}
                placeholder="e.g., DOGE2"
                className={`input ${errors.ticker ? 'border-red' : ''}`}
                maxLength={5}
                style={{ textTransform: 'uppercase' }}
              />
              {errors.ticker && (
                <p className="text-red text-sm mt-xs">{errors.ticker}</p>
              )}
              <p className="text-muted text-sm mt-xs">
                1-5 uppercase letters only
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="mt-lg">
            <label className="block text-sm font-medium mb-sm">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Tell everyone what makes your token special..."
              className={`input ${errors.description ? 'border-red' : ''}`}
              rows={3}
              maxLength={200}
            />
            {errors.description && (
              <p className="text-red text-sm mt-xs">{errors.description}</p>
            )}
            <p className="text-muted text-sm mt-xs">
              {formData.description.length}/200 characters
            </p>
          </div>

          {/* Image Upload */}
          <div className="mt-lg">
            <label className="block text-sm font-medium mb-sm">
              Token Image (Optional)
            </label>
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-lg text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <Upload size={48} className="mx-auto mb-md text-muted" />
                <p className="text-muted">
                  {formData.image ? formData.image.name : 'Click to upload image'}
                </p>
                <p className="text-sm text-muted mt-xs">
                  PNG, JPG up to 2MB
                </p>
              </label>
            </div>
            {errors.image && (
              <p className="text-red text-sm mt-xs">{errors.image}</p>
            )}
          </div>
        </div>

        {/* Launch Summary */}
        <div className="card">
          <h3 className="mb-lg">Launch Summary</h3>
          <div className="space-y-md">
            <div className="flex justify-between">
              <span className="text-muted">Launch Fee:</span>
              <span className="font-medium">{LAUNCH_FEE} SOL</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Initial Supply:</span>
              <span className="font-medium">1,000,000,000 tokens</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Graduation Target:</span>
              <span className="font-medium">$69,000 Market Cap</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Trading Fee:</span>
              <span className="font-medium">1% (0.5% to LP, 0.5% to treasury)</span>
            </div>
          </div>
        </div>

        {/* Errors */}
        {(errors.wallet || errors.submit) && (
          <div className="card" style={{ borderColor: 'var(--red)' }}>
            <div className="flex items-center gap-md">
              <AlertCircle className="text-red" size={24} />
              <div>
                <p className="text-red">{errors.wallet || errors.submit}</p>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!connected || creating || balance < LAUNCH_FEE}
          className="btn btn-primary btn-lg w-full"
        >
          {creating ? (
            <>
              <div className="animate-spin">
                <Zap size={20} />
              </div>
              Creating Token...
            </>
          ) : (
            <>
              <Zap size={20} />
              Launch Coin ({LAUNCH_FEE} SOL)
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default CreateCoin;