import { create } from 'zustand';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  category: string;
  imageUrl: string | null;
  createdAt: string;
}

interface SearchState {
  query: string;
  products: Product[];
  setQuery: (q: string) => void;
  setProducts: (p: Product[]) => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  query: '',
  products: [],
  setQuery: (query) => set({ query }),
  setProducts: (products) => set({ products }),
}));
