'use client';

import { useState, useEffect, useCallback } from 'react';
import { getCurrentStockAction } from '@/lib/actions/stockActions';

interface UseProductStockProps {
  productId: string;
  initialStock?: number;
}

export function useProductStock({ productId, initialStock = 0 }: UseProductStockProps) {
  const [currentStock, setCurrentStock] = useState(initialStock);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshStock = useCallback(async () => {
    if (!productId) return;

    setIsLoading(true);
    setError(null);
    
    try {
      const result = await getCurrentStockAction(productId);
      
      if (result.success && result.data) {
        setCurrentStock(result.data.availableStock);
      } else {
        setError(result.error || 'Failed to get stock');
      }
    } catch (err) {
      setError('Unexpected error while fetching stock');
      console.error('Stock fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    refreshStock();
  }, [refreshStock]);

  return {
    currentStock,
    isLoading,
    error,
    refreshStock
  };
} 