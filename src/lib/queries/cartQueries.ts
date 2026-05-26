import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addItemToCartAction } from '@/lib/actions/cartActions';
import { useAppStore } from '@/components/providers/StoreProvider';
import type { CartItem } from '@/types/store';
import { toast } from 'sonner';

interface AddToCartParams {
  variantId: string;
  quantity: number;
  productName?: string;
  productPrice?: number;
  productImageUrl?: string | null;
}

export function useAddToCart() {
  const addToCartInternal = useAppStore((state: any) => state.addToCart);
  const cartItems = useAppStore((state: any) => state.cartItems);
  const queryClient = useQueryClient(); 

  return useMutation<
    Awaited<ReturnType<typeof addItemToCartAction>>,
    Error,
    AddToCartParams
  >({
    mutationFn: async ({ variantId, quantity }) => {
      const currentCartItems = cartItems.map((item: CartItem) => ({
        variantId: item.variantId,
        productId: item.productId,
        quantity: item.quantity
      }));
      
      return addItemToCartAction(variantId, quantity, currentCartItems);
    },
    onSuccess: (result, variables) => {
      if (result.success && result.data) {
        const newItem: CartItem = {
          variantId: variables.variantId,
          productId: result.data.productId,
          slug: result.data.slug,
          size: result.data.size,
          quantity: variables.quantity,
          name: variables.productName,
          price: variables.productPrice,
          imageUrl: variables.productImageUrl,
          availableStock: result.data.availableStock
        };
        addToCartInternal(newItem);
        toast.success(result.message || 'Item added to cart!');
        
        queryClient.invalidateQueries({ queryKey: ['cart'] });
      } else {
        toast.error(result.error || 'Failed to add item to cart.');
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to add item to cart due to database error.');
    },
  });
} 