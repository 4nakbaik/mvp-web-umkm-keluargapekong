import { create } from 'zustand';

interface CartItem {
  productId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    imageUrl: string | null;
  };
}

interface CartState {
  items: CartItem[];
  addItem: (product: CartItem['product']) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  addItem: (product) => {
    const { items } = get();
    const existingItem = items.find((item) => item.productId === product.id);

    if (existingItem) {
      set({
        items: items.map((item) =>
          item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item
        ),
      });
    } else {
      set({
        items: [...items, { productId: product.id, quantity: 1, product }],
      });
    }
  },

  removeItem: (productId) => {
    set({ items: get().items.filter((item) => item.productId !== productId) });
  },

  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }
    set({
      items: get().items.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      ),
    });
  },

  clearCart: () => set({ items: [] }),

  getTotal: () => {
    return get().items.reduce((total, item) => total + item.product.price * item.quantity, 0);
  },

  getItemCount: () => {
    return get().items.reduce((count, item) => count + item.quantity, 0);
  },
}));
