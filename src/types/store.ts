export type SetType = 'DAY' | 'NIGHT';
export type HomeType = SetType;

export interface CartItem {
  variantId: string;
  productId: string;
  slug: string;
  size: string | null;
  quantity: number;
  name?: string; 
  price?: number; 
  imageUrl?: string | null;
  availableStock?: number;
}

export interface CartSlice {
  cartItems: CartItem[];
  isCartSidebarOpen: boolean;
  addToCart: (item: CartItem) => void;
  removeFromCart: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => Promise<void>;
  clearCart: () => void;
  toggleCartSidebar: () => void;
  getCartTotalItems: () => number;
  getCartTotalPrice: () => number;
}

export interface HomeTypeSlice {
  selectedHomeType: SetType;
  setSelectedHomeType: (type: SetType) => void;
  initializeHomeType: () => void;
}

export type State = {
  count: number;
};

export type Actions = {
  increment: (qty: number) => void;
  decrement: (qty: number) => void;
};

export type Store = State & Actions & CartSlice & HomeTypeSlice & {
  _isHydrated: boolean;
}; 