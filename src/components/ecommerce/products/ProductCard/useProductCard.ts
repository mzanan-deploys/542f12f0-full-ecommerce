'use client';

import { useState, useTransition, useEffect, useCallback, useContext, useRef, useMemo } from 'react';
import { type CarouselApi } from "@/components/ui/carousel";
import { formatPrice } from '@/lib/utils/formatting';
import type { ProductCardProps } from '@/types/product';
import { StoreContext } from '@/components/providers/StoreProvider';
import { useStore } from 'zustand';
import type { Store, CartItem } from '@/types/store';
import { addItemToCartAction } from '@/lib/actions/cartActions';
import { toast } from 'sonner';
import { 
    getAvailableSizesFromGuide, 
    sortVariantsBySize, 
    calculateTotalQuantityInCart, 
    calculateEffectiveStock,
    getDisplayImages,
    type AvailableVariant 
} from '@/lib/helpers/productCardHelpers';
import { useProductStock } from '@/hooks/useProductStock';

export function useProductCard(product: ProductCardProps['product'] & { stock_quantity?: number }) {
    
    const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [isPending, startTransition] = useTransition();
    const prevSelectedVariantIdRef = useRef<string | null>(null);

    const storeApi = useContext(StoreContext);
    if (!storeApi) {
        throw new Error('useProductCard must be used within a StoreProvider');
    }

    const cartItems = useStore(storeApi, (state: Store) => state.cartItems);
    const addToCartStore = useStore(storeApi, (state: Store) => state.addToCart);
    const storeIsHydrated = useStore(storeApi, (state: Store) => state._isHydrated);

    const [api, setApi] = useState<CarouselApi>();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [slideCount, setSlideCount] = useState(0);

    const hasVariants = Array.isArray(product.product_variants) && product.product_variants.length > 0;

    const { currentStock: realTimeStock, isLoading: stockLoading, refreshStock } = useProductStock({
        productId: product.id,
        initialStock: product.stock_quantity ?? 0
    });

    const totalQuantityOfThisProductInCart = useMemo(() => {
        return calculateTotalQuantityInCart(cartItems, product.id);
    }, [cartItems, product.id]);

    const globalEffectiveStockForProduct = calculateEffectiveStock(realTimeStock, totalQuantityOfThisProductInCart);

    const availableVariants = useMemo<AvailableVariant[]>(() => {
        
        if (!product.product_variants || product.product_variants.length === 0) {
            return [{
                id: product.id, 
                size: "Default", 
                product_id: product.id,
                dbStock: realTimeStock,
                effectiveStock: globalEffectiveStockForProduct,
                isAvailable: globalEffectiveStockForProduct > 0,
            }];
        }


        
        const allowedSizes = getAvailableSizesFromGuide(product.size_guide_data);
        
        const variants = product.product_variants.map(variant => {
            if (!variant || variant.size_name === null) return null; 
            
            if (allowedSizes && !allowedSizes.includes(variant.size_name)) return null;
            
            return {
                id: variant.id,
                size: variant.size_name, 
                product_id: product.id, 
                dbStock: realTimeStock, 
                effectiveStock: globalEffectiveStockForProduct, 
                isAvailable: globalEffectiveStockForProduct > 0,
            };
        }).filter(Boolean) as AvailableVariant[]; 

        return sortVariantsBySize(variants);
    }, [product.name, product.id, product.product_variants, product.size_guide_data, realTimeStock, globalEffectiveStockForProduct]); 

    const effectiveStockForSelected = globalEffectiveStockForProduct;

    const originalSelectedVariantDetails = product.product_variants?.find(v => v.id === selectedVariantId && v.size_name !== null && v.id !== null) as ({ id: string; size_name: string | null; } & { quantity?: number }) | undefined;

    useEffect(() => {
        if (selectedVariantId && selectedVariantId !== prevSelectedVariantIdRef.current) {
            let newQuantity = 1;
            if (newQuantity > effectiveStockForSelected) {
                newQuantity = Math.max(0, effectiveStockForSelected);
            }
            setQuantity(newQuantity);
        } else if (!selectedVariantId) {
            setQuantity(1);
        } else if (selectedVariantId) {
            if (quantity > effectiveStockForSelected) {
                setQuantity(Math.max(1, effectiveStockForSelected));
            }
            if (effectiveStockForSelected === 0 && quantity > 0) {
                 setQuantity(0);
            }
        }

        prevSelectedVariantIdRef.current = selectedVariantId;
    }, [selectedVariantId, effectiveStockForSelected, quantity, availableVariants, product.name]); 

    const displayImages = useMemo(() => getDisplayImages(product.product_images || []), [product.product_images]);

    const formattedPrice = useMemo(() => formatPrice(product.price), [product.price]);

    useEffect(() => {
        if (!api) {
            return;
        }
        setSlideCount(api.scrollSnapList().length);
        setCurrentSlide(api.selectedScrollSnap());

        const handleSelect = () => {
            setCurrentSlide(api.selectedScrollSnap());
        };

        api.on("select", handleSelect);
        api.on("reInit", handleSelect);

        return () => {
            api?.off("select", handleSelect);
            api?.off("reInit", handleSelect);
        };
    }, [api]);

    const scrollTo = useCallback((index: number) => {
        api?.scrollTo(index);
    }, [api]);

    const handleQuantityChange = (change: number) => {
        setQuantity(prev => {
            const newQuantity = prev + change;
            const maxQuantity = selectedVariantId ? effectiveStockForSelected : Infinity; 
            return Math.max(1, Math.min(newQuantity, maxQuantity));
        });
    };

    const productInfo = useMemo(() => ({
        id: product.id,
        name: product.name,
        price: Number(product.price),
        slug: product.slug,
        image_url: product.product_images?.[0]?.image_url || undefined,
    }), [product.id, product.name, product.price, product.slug, product.product_images]);

    const handleAddToCart = () => {
        if (!originalSelectedVariantDetails) {
            toast.error('Please select a size first.');
            return;
        }

        if (quantity <= 0) {
            toast.error('Quantity must be greater than zero.');
            return;
        }

        if (quantity > effectiveStockForSelected) {
            toast.error(`Only ${effectiveStockForSelected} total stock remaining for ${product.name}. You have ${totalQuantityOfThisProductInCart} of this product (all sizes) in your cart.`);
            setQuantity(Math.max(1, effectiveStockForSelected));
            return;
        }

        startTransition(async () => {
            try {
                const currentCartItems = cartItems.map(item => ({
                    variantId: item.variantId,
                    productId: item.productId,
                    quantity: item.quantity
                }));

                const validationResponse = await addItemToCartAction(originalSelectedVariantDetails.id, quantity, currentCartItems);

                if (!validationResponse.success || !validationResponse.data) {
                    toast.error(validationResponse.error || 'Failed to add item. Stock validation failed.');
                    return;
                }

                const cartItem: CartItem = {
                    variantId: originalSelectedVariantDetails.id,
                    productId: validationResponse.data.productId,
                    slug: validationResponse.data.slug,
                    size: originalSelectedVariantDetails.size_name,
                    quantity: quantity,
                    name: product.name,
                    price: Number(product.price),
                    imageUrl: product.product_images?.[0]?.image_url || undefined,
                };

                addToCartStore(cartItem);
                toast.success(`${quantity} x ${product.name} (${originalSelectedVariantDetails.size_name}) added to your cart!`);
                setQuantity(1);
                
                refreshStock();
            } catch (error) {
                console.error("Error adding item to cart:", error);
                toast.error('Failed to add item to cart due to validation or database error.');
            }
        });
    };

    const currentStockForSelectedVariant = useMemo(() => {
        const variantDetails = availableVariants.find(v => v.id === selectedVariantId);
        const stock = variantDetails ? variantDetails.effectiveStock : (hasVariants ? 0 : availableVariants[0]?.effectiveStock ?? 0);
        return stock;
    }, [selectedVariantId, availableVariants, hasVariants, product.name]);

    return {
        selectedVariantId,
        setSelectedVariantId,
        quantity,
        setQuantity,
        isPending,
        storeIsHydrated,
        api,
        setApi,
        currentSlide,
        slideCount,
        hasVariants,
        availableVariants,
        selectedVariant: originalSelectedVariantDetails 
            ? { 
                id: originalSelectedVariantDetails.id, 
                size_name: originalSelectedVariantDetails.size_name, 
              }
            : undefined,
        selectedVariantStock: effectiveStockForSelected,
        displayImages,
        formattedPrice,
        scrollTo,
        handleQuantityChange,
        productInfo,
        handleAddToCart,
        currentStock: currentStockForSelectedVariant,
        stockLoading,
        refreshStock,
    };
}
