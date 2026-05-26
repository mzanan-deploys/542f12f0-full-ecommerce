import { useState, useCallback } from 'react';
import { deleteProduct } from '@/lib/actions/productActions';
import { toast } from 'sonner';
import type { UseProductListClientReturn } from '@/types/admin';

export function useProductListClient(): UseProductListClientReturn {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = useCallback(async (productId: string) => {
    setIsDeleting(productId);
    setError(null);

    try {
      const result = await deleteProduct(productId);
      if (!result.success) {
        console.error("Delete failed:", result.error);
        const errorMessage = result.error || 'Failed to delete product. Please try again.';
        setError(errorMessage);
        toast.error('Delete Failed', { description: errorMessage }); 
      }
    } catch (err) {
      console.error("Error calling deleteProduct:", err);
      const errorMessage = 'Failed to delete product due to database or permission error.';
      setError(errorMessage);
      toast.error('Delete Error', { description: errorMessage });
    } finally {
      setIsDeleting(null);
    }
  }, []); 

  return { isDeleting, error, handleDelete };
} 