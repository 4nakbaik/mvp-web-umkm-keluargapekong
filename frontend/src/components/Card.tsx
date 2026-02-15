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
    <div className="w-full bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border border-[#F4C480]/20">
      {/* Image Section */}
      <div className="relative h-40 sm:h-48 md:h-52 lg:h-56 bg-[#FFF8E7]">
        {/* Heart Icon */}
        <button className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-[#F4C480] hover:text-white transition-colors shadow-sm text-[#4A3728]">
          <span className="text-sm">♥</span>
        </button>

        {/* Product Image */}
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#4A3728]/40 text-sm">
            No Image
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4 space-y-3">
        {/* Tags */}
        <div className="flex">
          <span className="px-2 py-1 text-[10px] sm:text-xs font-semibold text-[#4A3728] bg-[#F4C480]/30 rounded-md border border-[#F4C480]/30">
            {category.toUpperCase()}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-base sm:text-lg font-bold text-[#4A3728] line-clamp-1">{name}</h3>

        {/* Description */}
        <p className="text-xs sm:text-sm text-[#4A3728]/70 leading-relaxed line-clamp-2 h-10">
          {description || 'No description available'}
        </p>

        {/* Price */}
        <div className="pt-2 border-t border-[#F4C480]/20">
          <div className="text-xs text-[#4A3728]/60 uppercase tracking-wide mb-1">Harga</div>
          <div className="text-lg sm:text-xl font-bold text-[#4A3728]">{formatPrice(price)}</div>
        </div>
      </div>
    </div>
  );
}
