import { useState } from 'react';
import { useAppStore } from '@/components/providers/StoreProvider';
import type { CartItem } from '@/types/store';

export function useCart() {
    const cartItems = useAppStore((state: any) => state.cartItems);
    const updateQuantity = useAppStore((state: any) => state.updateQuantity);
    const getCartTotalPrice = useAppStore((state: any) => state.getCartTotalPrice);

    const [loadingItems, setLoadingItems] = useState<Record<string, boolean>>({});

    const getMaxQuantityForItem = (currentItem: CartItem) => {
        const otherVariantsOfSameProduct = cartItems.filter(
            (item: CartItem) => item.productId === currentItem.productId && item.variantId !== currentItem.variantId
        );
        const usedByOtherVariants = otherVariantsOfSameProduct.reduce((sum: number, item: CartItem) => sum + item.quantity, 0);
        const totalAvailable = currentItem.availableStock ?? 0;
        return Math.max(0, totalAvailable - usedByOtherVariants);
    };

    const handleQuantityChange = async (variantId: string, newQuantity: number) => {
        setLoadingItems(prev => ({ ...prev, [variantId]: true }));
        await updateQuantity(variantId, newQuantity);
        setLoadingItems(prev => ({ ...prev, [variantId]: false }));
    };

    const handleRemoveItem = (variantId: string) => {
        handleQuantityChange(variantId, 0);
    };

    return {
        cartItems,
        loadingItems,
        getCartTotalPrice,
        getMaxQuantityForItem,
        handleQuantityChange,
        handleRemoveItem
    };
} 