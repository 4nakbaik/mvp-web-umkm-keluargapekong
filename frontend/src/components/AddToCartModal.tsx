import { useState, useEffect, useRef } from 'react';
import { getImageUrl } from '../utils/imageHelper';
import { useCartStore } from '../hooks/useCartStore';
import { useToastStore } from '../hooks/useToastStore';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  category: string;
  imageUrl: string | null;
}

interface AddToCartModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function AddToCartModal({ product, isOpen, onClose }: AddToCartModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [imgError, setImgError] = useState(false);
  const [closing, setClosing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { addItem, updateQuantity, items } = useCartStore();
  const { addToast } = useToastStore();

  // Reset state when product changes or modal opens
  useEffect(() => {
    if (isOpen && product) {
      setQuantity(1);
      setImgError(false);
      setClosing(false);
    }
  }, [isOpen, product]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.select(), 300);
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) handleClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen]);

  if (!isOpen || !product) return null;

  const maxQty = product.stock;

  // Check existing cart quantity for this product
  const existingCartItem = items.find((item) => item.productId === product.id);
  const existingQty = existingCartItem ? existingCartItem.quantity : 0;
  const remainingStock = maxQty - existingQty;

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      onClose();
    }, 200);
  };

  const handleQuantityChange = (value: string) => {
    const num = parseInt(value, 10);
    if (isNaN(num) || num < 1) {
      setQuantity(1);
    } else if (num > remainingStock) {
      setQuantity(Math.max(1, remainingStock));
    } else {
      setQuantity(num);
    }
  };

  const handleDecrement = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleIncrement = () => {
    setQuantity((prev) => Math.min(remainingStock, prev + 1));
  };

  const handleAddToCart = () => {
    if (!product || quantity < 1) return;

    if (remainingStock <= 0) {
      addToast('Stok sudah habis di keranjang', 'error');
      return;
    }

    if (quantity > remainingStock) {
      addToast(`Stok tersisa hanya ${remainingStock}`, 'error');
      return;
    }

    // If item already exists in cart, we just update the quantity
    if (existingCartItem) {
      const success = updateQuantity(product.id, existingQty + quantity);
      if (!success) {
        addToast('Stok tidak mencukupi', 'error');
        return;
      }
    } else {
      // Add first, then update to desired quantity
      const success = addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        stock: product.stock,
      });
      if (!success) {
        addToast('Stok tidak mencukupi', 'error');
        return;
      }
      if (quantity > 1) {
        updateQuantity(product.id, quantity);
      }
    }

    addToast(`${product.name} × ${quantity} ditambahkan ke keranjang`, 'success');
    handleClose();
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);

  const getCategoryLabel = (cat: string) => {
    const labels: Record<string, string> = {
      MAKANAN: 'Makanan',
      MINUMAN: 'Minuman',
      SNACK: 'Snack',
      JASA: 'Jasa',
      LAINNYA: 'Lainnya',
    };
    return labels[cat] || cat;
  };

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center px-4 ${closing ? 'modal-overlay-exit' : 'modal-overlay-enter'}`}
      onClick={handleClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Modal Content */}
      <div
        className={`relative bg-white rounded-2xl overflow-hidden shadow-2xl w-full max-w-[720px] flex flex-col md:flex-row ${closing ? 'modal-content-exit' : 'modal-content-enter'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-[#5d5f5d] hover:text-[#1c1b1b] transition-colors shadow-sm cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        {/* Left: Product Image */}
        <div className="relative w-full md:w-[280px] aspect-square md:aspect-auto bg-[#f0eded] shrink-0">
          {product.imageUrl && !imgError ? (
            <img
              src={getImageUrl(product.imageUrl)!}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#4a4a4a]/25 min-h-[200px]">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Right: Product Details & Quantity */}
        <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
          {/* Top: Info */}
          <div>
            {/* Category badge */}
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#f0eded] text-[#5d5f5d] font-['Inter'] text-xs font-medium tracking-wide mb-3">
              {getCategoryLabel(product.category)}
            </span>

            {/* Name */}
            <h2 className="font-['Epilogue'] text-2xl md:text-[28px] leading-[1.3] font-semibold text-[#1c1b1b] mb-2">
              {product.name}
            </h2>

            {/* Description */}
            <p className="font-['Inter'] text-sm leading-[1.6] text-[#5d5f5d] mb-4 line-clamp-3">
              {product.description || 'Tidak ada deskripsi'}
            </p>

            {/* Price */}
            <p className="font-['JetBrains_Mono'] text-2xl font-bold text-[#1c1b1b] tracking-tight mb-1">
              {formatPrice(product.price)}
            </p>

            {/* Stock info */}
            <p className="font-['Inter'] text-xs text-[#747878] mb-6">
              Stok tersedia: {remainingStock > 0 ? remainingStock : 0}
              {existingQty > 0 && (
                <span className="ml-1 text-[#4a4a4a]">
                  ({existingQty} sudah di keranjang)
                </span>
              )}
            </p>
          </div>

          {/* Bottom: Quantity + Add Button */}
          <div>
            {/* Quantity Control */}
            <div className="flex items-center gap-3 mb-5">
              <label className="font-['Inter'] text-sm font-medium text-[#5d5f5d] shrink-0">
                Jumlah
              </label>
              <div className="flex items-center border border-[#c4c7c7] rounded-lg overflow-hidden">
                <button
                  onClick={handleDecrement}
                  disabled={quantity <= 1}
                  className="w-10 h-10 flex items-center justify-center text-[#1c1b1b] hover:bg-[#f0eded] transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer text-lg font-medium"
                >
                  −
                </button>
                <input
                  ref={inputRef}
                  type="text"
                  inputMode="numeric"
                  value={quantity}
                  onChange={(e) => handleQuantityChange(e.target.value)}
                  className="w-14 h-10 text-center border-x border-[#c4c7c7] font-['JetBrains_Mono'] text-base text-[#1c1b1b] outline-none bg-transparent"
                />
                <button
                  onClick={handleIncrement}
                  disabled={quantity >= remainingStock}
                  className="w-10 h-10 flex items-center justify-center text-[#1c1b1b] hover:bg-[#f0eded] transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer text-lg font-medium"
                >
                  +
                </button>
              </div>
              {/* Quick total */}
              <span className="font-['JetBrains_Mono'] text-sm text-[#747878] ml-auto">
                = {formatPrice(product.price * quantity)}
              </span>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={remainingStock <= 0}
              className="w-full py-3.5 rounded-xl bg-[#1c1b1b] text-white font-['Inter'] text-base font-medium hover:bg-[#333] transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-[20px]">add_shopping_cart</span>
              {remainingStock <= 0 ? 'Stok Habis' : 'Tambah ke Keranjang'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
