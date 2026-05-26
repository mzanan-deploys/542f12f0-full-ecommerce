import { useState, useEffect } from 'react';

export function useShippingPrice(countryCode: string | undefined) {
  const [shippingPrice, setShippingPrice] = useState<number | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!countryCode) {
      setShippingPrice(undefined);
      return;
    }

    const fetchShippingPrice = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/shipping-price?country=${encodeURIComponent(countryCode)}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch shipping price');
        }
        
        const data = await response.json();
        setShippingPrice(data.price);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setShippingPrice(undefined);
      } finally {
        setIsLoading(false);
      }
    };

    fetchShippingPrice();
  }, [countryCode]);

  return { shippingPrice, isLoading, error };
} 