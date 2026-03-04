import { useState } from 'react';
import { getImageUrl } from '../utils/imageHelper';

interface CardProps {
  id?: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  category: string;
}

export function Card({ id, name, description, price, imageUrl, category }: CardProps) {
  const [imgError, setImgError] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
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

  // Pseudo-random rating from product name
  const charSum = name.split('').reduce((s, c) => s + c.charCodeAt(0), 0);
  const rating = (3.8 + (charSum % 14) / 10).toFixed(1);

  // Engineered fake "original" price (higher than real price)
  const discountPercent = 10 + (charSum % 4) * 10; // 10%, 20%, 30%, or 40%
  const fakeOriginalPrice = Math.ceil(price / (1 - discountPercent / 100) / 1000) * 1000;

  // Delivery time (varied)
  const deliveryMin = 15 + (charSum % 4) * 5; // 15, 20, 25, 30

  return (
    <div
      id={id ? `product-${id}` : undefined}
      className="interactive-card w-full bg-white rounded-2xl overflow-hidden border border-[#4B5945]/8 cursor-pointer transition-all duration-300"
    >
      {/* Image Section */}
      <div className="relative h-44 sm:h-48 overflow-hidden bg-[#f0f5ee]">
        {imageUrl && !imgError ? (
          <img
            src={getImageUrl(imageUrl)!}
            alt={name}
            className="card-img-zoom w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#4B5945]/25">
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

        {/* Rating badge */}
        <span className="absolute top-3 right-3 flex items-center gap-1 bg-[#5f755e] text-white text-[11px] font-bold px-2 py-0.5 rounded-md shrink-0">
          <svg className="w-3 h-3 text-[#f59e0b]" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          {rating}
        </span>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title row */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-[15px] font-bold text-[#4B5945] line-clamp-1 flex-1">{name}</h3>
        </div>

        {/* Description / Category */}
        <p className="text-xs text-[#66785F] line-clamp-1 mb-3">
          {description || getCategoryLabel(category)}
        </p>

        {/* Price row — fake original (strikethrough) + real price (highlighted) */}
        <div className="flex items-center gap-2 mb-2.5">
          <span className="text-[13px] text-[#66785F]/50 line-through">
            {formatPrice(fakeOriginalPrice)}
          </span>
          <span className="text-[15px] font-bold text-[#4B5945]">{formatPrice(price)}</span>
          <span className="text-[11px] font-semibold text-[#4B5945] bg-[#B2C9AD]/40 px-1.5 py-0.5 rounded">
            {discountPercent}% OFF
          </span>
        </div>

        {/* Delivery info */}
        <div className="flex items-center gap-1.5 text-[12px] text-[#66785F] mb-2.5">
          <svg
            className="w-3.5 h-3.5 text-[#91AC8F]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="font-medium">{deliveryMin} min</span>
        </div>

        {/* Discount badge line */}
        <div className="flex items-center gap-1.5 text-[12px]">
          <span className="w-4 h-4 flex items-center justify-center rounded-full bg-[#4B5945] text-white text-[8px] font-bold shrink-0">
            %
          </span>
          <span className="text-[#4B5945] font-semibold">
            Hemat {formatPrice(fakeOriginalPrice - price)}
          </span>
        </div>
      </div>
    </div>
  );
}
