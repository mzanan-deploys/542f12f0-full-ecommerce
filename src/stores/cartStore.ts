import { type StateCreator } from 'zustand';
import type { Store, CartSlice } from '@/types/store'; 
import { updateCartItemQuantityAction } from '@/lib/actions/cartActions';
import { toast } from 'sonner';

export const createCartSlice: StateCreator<
  Store, 
  [], 
  [],
  CartSlice
> = (set, get) => ({
  cartItems: [],
  isCartSidebarOpen: false,
  addToCart: (newItem) => {
    set((state) => {
      const { productId: newProductId, availableStock: newTotalStockForProduct } = newItem;
      let itemExists = false;

      let cartAfterQuantityUpdate = state.cartItems.map(ci => {
        if (ci.variantId === newItem.variantId) {
          itemExists = true;
          return {
            ...ci,
            quantity: ci.quantity + newItem.quantity,
          };
        }
        return ci;
      });

      let cartAfterItemAddOrQuantityUpdate;
      if (itemExists) {
        cartAfterItemAddOrQuantityUpdate = cartAfterQuantityUpdate;
      } else {
        cartAfterItemAddOrQuantityUpdate = [...state.cartItems, newItem];
      }

        return {
        cartItems: cartAfterItemAddOrQuantityUpdate.map(ci =>
          ci.productId === newProductId && newTotalStockForProduct !== undefined
            ? { ...ci, availableStock: newTotalStockForProduct }
              : ci
          ),
        };
    });
  },
  removeFromCart: (variantId) => {
    set((state) => ({ cartItems: state.cartItems.filter(item => item.variantId !== variantId) }));
  },
  updateQuantity: async (variantId, quantity) => {
    const originalItem = get().cartItems.find(item => item.variantId === variantId);
    if (!originalItem) return;

    set((state) => ({
      cartItems: state.cartItems.map(item =>
        item.variantId === variantId ? { ...item, quantity: Math.max(0, quantity) } : item
      ),
    }));

    const currentCartItemsForAction = get().cartItems.map(item => ({
      variantId: item.variantId,
      productId: item.productId,
      quantity: item.quantity
    }));

    const result = await updateCartItemQuantityAction(variantId, Math.max(0, quantity), currentCartItemsForAction);

    if (result.success && result.data) {
      const productIdOfUpdatedItem = originalItem.productId;
      const totalStockFromResult = result.data.availableStock;
      const validatedQuantityFromResult = result.data.validatedQuantity;

      set((state) => ({
        cartItems: state.cartItems.map(ci => {
          let updatedCi = { ...ci };
          if (ci.productId === productIdOfUpdatedItem && totalStockFromResult !== undefined) {
            updatedCi.availableStock = totalStockFromResult;
          }
          if (ci.variantId === variantId) {
            updatedCi.quantity = validatedQuantityFromResult;
          }
          return updatedCi;
        }).filter(item => item.quantity > 0),
      }));
      
      if (result.message && validatedQuantityFromResult === 0) {
        toast.success(result.message);
      } else if (result.message && validatedQuantityFromResult !== originalItem.quantity && validatedQuantityFromResult !== quantity) {
        toast.info(result.message);
      }
    } else {
      set((state) => ({
        cartItems: state.cartItems.map(item =>
          item.variantId === variantId ? { ...item, quantity: originalItem.quantity, availableStock: originalItem.availableStock } : item
        ),
      }));
      toast.error(result.error || 'Failed to update quantity.');
    }
  },
  clearCart: () => {
    set({ cartItems: [] });
  },
  toggleCartSidebar: () => {
    set(state => ({ isCartSidebarOpen: !state.isCartSidebarOpen }));
  },
  getCartTotalItems: () => {
    return get().cartItems.reduce((total, item) => total + item.quantity, 0);
  },
  getCartTotalPrice: () => {
    return get().cartItems.reduce((total, item) => total + (item.price || 0) * item.quantity, 0);
  },
}); 