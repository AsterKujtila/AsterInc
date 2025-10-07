'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CREATION_FEE } from '@/types';

export default function CreateToken() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    ticker: '',
    description: '',
    image: null as File | null,
  });
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate transaction
    await new Promise(resolve => setTimeout(resolve, 2000));

    // In production, this would interact with the Solana program
    console.log('Creating token:', formData);
    
    setIsSubmitting(false);
    router.push('/');
  };

  const isFormValid = formData.name && formData.ticker && formData.description && formData.image;

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-3">
            <span className="gradient-text">Create Your Meme Coin</span>
          </h1>
          <p className="text-text-secondary">
            Launch your token in seconds. No coding required.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-background-secondary border border-background-tertiary rounded-xl p-8">
          {/* Token Name */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-text-primary mb-2">
              Token Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Pepe Aster"
              maxLength={32}
              className="w-full px-4 py-3 bg-background-tertiary border border-background-tertiary rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:border-aster-primary transition-colors"
              required
            />
          </div>

          {/* Ticker */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-text-primary mb-2">
              Ticker Symbol
            </label>
            <input
              type="text"
              value={formData.ticker}
              onChange={(e) => setFormData({ ...formData, ticker: e.target.value.toUpperCase() })}
              placeholder="e.g., PEPA"
              maxLength={5}
              className="w-full px-4 py-3 bg-background-tertiary border border-background-tertiary rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:border-aster-primary transition-colors uppercase"
              required
            />
            <p className="text-xs text-text-secondary mt-1">Maximum 5 characters</p>
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-text-primary mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Tell the world about your token..."
              maxLength={200}
              rows={4}
              className="w-full px-4 py-3 bg-background-tertiary border border-background-tertiary rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:border-aster-primary transition-colors resize-none"
              required
            />
            <p className="text-xs text-text-secondary mt-1">
              {formData.description.length}/200 characters
            </p>
          </div>

          {/* Image Upload */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-text-primary mb-2">
              Token Image
            </label>
            <div className="flex items-center gap-4">
              {imagePreview ? (
                <div className="w-24 h-24 rounded-lg overflow-hidden border-2 border-aster-primary">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-lg bg-background-tertiary border-2 border-dashed border-background-tertiary flex items-center justify-center">
                  <span className="text-3xl">📸</span>
                </div>
              )}
              <label className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  required
                />
                <div className="px-6 py-3 bg-background-tertiary hover:bg-background-tertiary/80 rounded-lg text-center cursor-pointer transition-colors">
                  <span className="text-sm font-medium text-text-primary">
                    {formData.image ? 'Change Image' : 'Upload Image'}
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Fee Display */}
          <div className="bg-background-tertiary rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-secondary">Creation Fee</span>
              <span className="text-lg font-bold text-aster-primary">{CREATION_FEE} SOL</span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className={`w-full py-4 rounded-lg font-bold text-lg transition-all ${
              isFormValid && !isSubmitting
                ? 'bg-aster-primary hover:bg-aster-secondary text-white pulse-glow cursor-pointer'
                : 'bg-background-tertiary text-text-secondary cursor-not-allowed'
            }`}
          >
            {isSubmitting ? '🚀 Launching...' : '🚀 Launch Coin'}
          </button>

          <p className="text-xs text-text-secondary text-center mt-4">
            By creating a token, you agree to our terms of service
          </p>
        </form>
      </div>
    </div>
  );
}