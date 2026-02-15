import { create } from 'zustand';

interface CartItem {
  productId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    imageUrl: string | null;
    stock: number;
  };
}

interface CartState {
  items: CartItem[];
  addItem: (product: CartItem['product']) => boolean;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => boolean;
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
      if (existingItem.quantity + 1 > product.stock) {
        return false;
      }
      set({
        items: items.map((item) =>
          item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item
        ),
      });
    } else {
      if (product.stock < 1) {
        return false;
      }
      set({
        items: [...items, { productId: product.id, quantity: 1, product }],
      });
    }
    return true;
  },

  removeItem: (productId) => {
    set({ items: get().items.filter((item) => item.productId !== productId) });
  },

  updateQuantity: (productId, quantity) => {
    const { items, removeItem } = get();
    const item = items.find((i) => i.productId === productId);

    if (!item) return false;

    if (quantity <= 0) {
      removeItem(productId);
      return true;
    }

    if (quantity > item.product.stock) {
      return false;
    }

    set({
      items: items.map((item) => (item.productId === productId ? { ...item, quantity } : item)),
    });
    return true;
  },

  clearCart: () => set({ items: [] }),

  getTotal: () => {
    return get().items.reduce((total, item) => total + item.product.price * item.quantity, 0);
  },

  getItemCount: () => {
    return get().items.reduce((count, item) => count + item.quantity, 0);
  },
}));
