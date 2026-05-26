export type ProductCartInfo = {
    id: string;
    name: string | null;
    price: number | null;
    image_url: string | undefined; 
    slug?: string | null; 
};

export interface AddToCartButtonProps {
    productInfo: ProductCartInfo | null; 
    selectedVariantId: string | null; 
    className?: string;
    disabled?: boolean;
}

export interface CartItem extends ProductCartInfo { 
  variantId: string;
  quantity: number;
  size: string;
} 

export interface CartState {
    items: CartItem[];
    addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
    removeItem: (itemId: string, variantId: string) => void; 
    updateQuantity: (itemId: string, variantId: string, newQuantity: number) => void; 
    clearCart: () => void;
    getTotalItems: () => number;
    getTotalPrice: () => number;
}

export interface CartSummaryProps {
  isCheckout?: boolean;
  onProceedToPayment?: () => void;
  showProceedButton?: boolean;
  paymentLoading?: boolean;
  shippingPrice?: number;
}

export interface CartActionResult {
  productId: string;
  size: string | null;
  slug: string;
  productName: string;
  validatedQuantity: number;
  availableStock: number;
}

export interface CartUpdateResult {
  validatedQuantity: number;
  availableStock: number;
  productName: string;
  size: string | null;
}

export interface CurrentCartItem {
  variantId: string;
  productId: string;
  quantity: number;
}
