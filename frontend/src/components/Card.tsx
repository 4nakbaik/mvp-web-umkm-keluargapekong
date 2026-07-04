import { useState } from 'react';
import { getImageUrl } from '../utils/imageHelper';
import { useAuthStore } from '../hooks/useAuthStore';

interface CardProps {
  id?: string;
  name: string;
  description: string | null;
  price: number;
  stock?: number;
  imageUrl: string | null;
  category: string;
  featured?: boolean;
  onAddToCart?: () => void;
}

export function Card({ id, name, description, price, imageUrl, category, featured = false, onAddToCart }: CardProps) {
  const [imgError, setImgError] = useState(false);
  const { isAuthenticated, user } = useAuthStore();
  const isStaff = isAuthenticated && (user?.role === 'STAFF' || user?.role === 'ADMIN');

  const formatPrice = (price: number) => {
    const inK = Math.round(price / 1000);
    return `RP ${inK}K`;
  };

  // Category badge label
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
    <article
      id={id ? `product-${id}` : undefined}
      className={`bg-white rounded-xl overflow-hidden smooth-shadow hover-lift group flex flex-col ${
        featured ? 'md:flex-row md:col-span-2 md:min-h-[280px]' : ''
      } h-full border border-[#c4c7c7]/10 transition-all duration-300`}
    >
      {/* Image */}
      <div className={`relative ${featured ? 'w-full md:w-[45%] h-[200px] md:h-full shrink-0' : 'aspect-[4/3]'} overflow-hidden bg-[#f0eded]`}>
        {imageUrl && !imgError ? (
          <img
            src={getImageUrl(imageUrl)!}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#4a4a4a]/25">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      {/* Content */}
      <div className={`p-6 flex flex-col flex-grow ${featured ? 'md:p-8 justify-between' : 'justify-between'}`}>
        <div>
          {/* Featured Badge */}
          {featured && (
            <span className="font-['JetBrains_Mono'] text-[10px] tracking-[0.15em] font-semibold text-[#8b7355] bg-[#8b7355]/10 px-2 py-0.5 rounded-sm uppercase mb-2.5 inline-block">
              Local Favorite
            </span>
          )}

          {/* Title + Price row */}
          <div className={`flex ${featured ? 'flex-col md:flex-row md:items-start md:justify-between' : 'justify-between items-start'} mb-2`}>
            <h3 className={`font-['Epilogue'] ${featured ? 'text-2xl md:text-3xl' : 'text-2xl'} leading-[1.3] font-semibold text-[#1c1b1b] line-clamp-2 flex-1 mr-2`}>
              {name}
            </h3>
            {!featured && (
              <span className="font-['JetBrains_Mono'] text-xs tracking-[0.1em] font-medium text-[#4a4a4a] bg-[#f0eded] px-2 py-1 rounded-sm shrink-0">
                {formatPrice(price)}
              </span>
            )}
          </div>

          {/* Standalone Price for Featured */}
          {featured && (
            <p className="font-['JetBrains_Mono'] text-lg font-semibold text-[#1c1b1b] mt-1 mb-3">
              {formatPrice(price)}
            </p>
          )}

          {/* Description */}
          <p className={`font-['Inter'] text-base leading-[1.6] text-[#5d5f5d] ${featured ? 'mb-6 line-clamp-3 md:line-clamp-4' : 'mb-6 line-clamp-2'} flex-grow`}>
            {description || getCategoryLabel(category)}
          </p>
        </div>

        {/* Add to Cart button */}
        {isStaff && (
          <button
            onClick={onAddToCart}
            className={`py-3 rounded-lg border border-[#c4c7c7] text-[#1c1b1b] font-['Inter'] text-base hover:bg-[#f0eded] transition-colors flex items-center justify-center gap-2 cursor-pointer ${
              featured ? 'w-full md:w-auto md:px-8' : 'w-full'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
            Add to Cart
          </button>
        )}
      </div>
    </article>
  );
}

