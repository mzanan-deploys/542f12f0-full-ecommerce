import { useState } from 'react';
import { useShippingPrice } from '@/hooks/shipping/useShippingPrice';
import { useAppStore } from '@/components/providers/StoreProvider';

export function useCheckout() {
    const [selectedCountry, setSelectedCountry] = useState<string>('');
    const { shippingPrice } = useShippingPrice(selectedCountry);
    const isHydrated = useAppStore((state) => state._isHydrated);
    const getCartTotalItems = useAppStore((state) => state.getCartTotalItems);
    
    const totalItems = getCartTotalItems();

    return {
        selectedCountry,
        setSelectedCountry,
        shippingPrice,
        isHydrated,
        totalItems
    };
} 