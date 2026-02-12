interface CardProps {
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  category: string;
}

export function Card({ name, description, price, imageUrl, category }: CardProps) {
  // Format price to IDR
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="w-full bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
      {/* Image Section - responsive height */}
      <div className="relative h-40 sm:h-48 md:h-52 lg:h-56 bg-gray-100">
        {/* Heart Icon - smaller on mobile */}
        <button className="absolute top-2 right-2 sm:top-3 sm:right-3 md:top-4 md:right-4 z-10 w-7 h-7 sm:w-8 sm:h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-sm">
          <span className="text-red-500 text-sm sm:text-base">♥</span>
        </button>

        {/* Product Image */}
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs sm:text-sm">
            No Image
          </div>
        )}
      </div>

      {/* Content Section - responsive padding and spacing */}
      <div className="p-3 sm:p-4 md:p-5 lg:p-6 space-y-2 sm:space-y-3">
        {/* Title - responsive font size */}
        <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 line-clamp-1">
          {name}
        </h3>

        {/* Tags */}
        <div className="flex gap-1 sm:gap-2 flex-wrap">
          <span className="px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs font-medium text-gray-700 bg-gray-100 rounded border border-gray-300">
            {category.toUpperCase()}
          </span>
        </div>

        {/* Description - hidden on very small screens */}
        <p className="hidden sm:block text-xs sm:text-sm text-gray-600 leading-relaxed line-clamp-2">
          {description || 'No description available'}
        </p>

        {/* Price and Button - stack on mobile */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 pt-1 sm:pt-2">
          <div>
            <div className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide">
              Price
            </div>
            <div className="text-base sm:text-lg md:text-xl font-bold text-gray-900">
              {formatPrice(price)}
            </div>
          </div>

          <button className="w-full sm:w-auto px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 bg-[#6B68A8] hover:bg-[#5B5898] text-white text-xs sm:text-sm font-medium rounded-lg transition-colors">
            Add to cart
          </button>
        </div>
      </div>
    </div>
  );
}
