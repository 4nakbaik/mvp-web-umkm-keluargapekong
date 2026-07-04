import { useState, useEffect, useRef, useCallback } from 'react';

const SLIDE_INTERVAL = 7000; // 7 seconds
const TRANSITION_DURATION = 700; // ms, must match CSS transition

// Try to dynamically import hero images — gracefully returns empty if none exist
function loadHeroImages(): string[] {
  const images: string[] = [];
  const modules = import.meta.glob('../assets/Hero/*.{png,jpg,jpeg,webp,PNG,JPG,JPEG,WEBP}', { eager: true }) as Record<
    string,
    { default: string }
  >;
  // Sort by filename to maintain order
  const sortedKeys = Object.keys(modules).sort();
  for (const key of sortedKeys) {
    images.push(modules[key].default);
  }
  return images;
}

const HERO_IMAGES = loadHeroImages();

interface HeroSlideshowProps {
  onExploreClick?: () => void;
}

export default function HeroSlideshow({ onExploreClick }: HeroSlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [noTransition, setNoTransition] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const hasImages = HERO_IMAGES.length > 0;
  const nextIndex = hasImages ? (currentIndex + 1) % HERO_IMAGES.length : 0;

  // Preload the next image in the background
  const preloadImage = useCallback(
    (index: number) => {
      if (!hasImages || HERO_IMAGES.length <= 1) return;
      const img = new Image();
      img.src = HERO_IMAGES[index];
    },
    [hasImages]
  );

  // Advance to the next slide
  const goToNext = useCallback(() => {
    if (!hasImages || HERO_IMAGES.length <= 1 || isTransitioning) return;
    setIsTransitioning(true);

    setTimeout(() => {
      setNoTransition(true);
      setCurrentIndex((prev) => {
        const next = (prev + 1) % HERO_IMAGES.length;
        preloadImage((next + 1) % HERO_IMAGES.length);
        return next;
      });
      setIsTransitioning(false);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setNoTransition(false);
        });
      });
    }, TRANSITION_DURATION);
  }, [hasImages, isTransitioning, preloadImage]);

  // Start/stop auto-advance interval
  const startInterval = useCallback(() => {
    if (!hasImages || HERO_IMAGES.length <= 1) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(goToNext, SLIDE_INTERVAL);
  }, [hasImages, goToNext]);

  const stopInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    startInterval();
    return stopInterval;
  }, [startInterval, stopInterval]);

  // Pause when tab is hidden
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        stopInterval();
      } else {
        startInterval();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [startInterval, stopInterval]);

  // Preload first two images on mount
  useEffect(() => {
    if (hasImages) {
      preloadImage(0);
      if (HERO_IMAGES.length > 1) preloadImage(1);
    }
  }, [hasImages, preloadImage]);

  // Go to a specific slide via dot indicator
  const goToSlide = useCallback(
    (index: number) => {
      if (!hasImages || isTransitioning || index === currentIndex) return;
      stopInterval();
      setIsTransitioning(true);

      setTimeout(() => {
        setNoTransition(true);
        setCurrentIndex(index);
        setIsTransitioning(false);
        preloadImage((index + 1) % HERO_IMAGES.length);

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setNoTransition(false);
            startInterval();
          });
        });
      }, TRANSITION_DURATION);
    },
    [hasImages, isTransitioning, currentIndex, stopInterval, startInterval, preloadImage]
  );

  return (
    <section className="relative w-full h-[400px] md:h-[600px] rounded-xl overflow-hidden shadow-sm group">
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-black/10 z-10 transition-opacity group-hover:bg-black/5 pointer-events-none" />

      {/* Gradient overlay for left side text */}
      <div className="hero-gradient-overlay absolute inset-0 z-10 pointer-events-none" />

      {hasImages ? (
        /* Slideshow track */
        <div className="absolute inset-0 w-full h-full">
          <div
            className={`hero-track${noTransition ? ' no-transition' : ''}`}
            style={{
              transform: isTransitioning ? 'translateX(-50%)' : 'translateX(0%)',
            }}
          >
            {/* Current image */}
            <img
              src={HERO_IMAGES[currentIndex]}
              alt={`Hero ${currentIndex + 1}`}
              className="hero-slide-img"
              loading="eager"
              decoding="async"
            />
            {/* Next image — placed to the right of current (only if multiple images exist) */}
            {HERO_IMAGES.length > 1 && (
              <img
                src={HERO_IMAGES[nextIndex]}
                alt={`Hero ${nextIndex + 1}`}
                className="hero-slide-img"
                loading="eager"
                decoding="async"
              />
            )}
          </div>
        </div>
      ) : (
        /* Empty placeholder background */
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-[#4a4a4a] to-[#747878]" />
      )}

      {/* Overlay content */}
      <div className="absolute inset-0 z-20 flex flex-col justify-center items-start p-8 md:p-16 w-full md:w-[55%]">
        <span className="inline-block px-3 py-1 bg-white/95 text-[#4a4a4a] rounded-sm font-['JetBrains_Mono'] text-xs tracking-[0.1em] font-medium uppercase mb-4 backdrop-blur-sm shadow-sm">
          Pekong Fam
        </span>
        <h1 className="font-['Epilogue'] text-[36px] md:text-[56px] leading-[1.15] md:leading-[1.1] tracking-[-0.02em] font-bold text-white mb-4 drop-shadow-lg">
          Cita Rasa Istimewa & Kebersamaan
        </h1>
        <p className="font-['Inter'] text-sm md:text-base leading-[1.6] text-white/95 mb-8 max-w-md drop-shadow">
          Menyajikan pilihan racikan kopi barista premium, makanan lezat kaya rempah, dan aneka kudapan istimewa yang dibuat segar setiap hari untuk menyambut Anda.
        </p>
        <div className="flex items-center gap-4">
          <button
            onClick={onExploreClick}
            className="bg-white text-[#4a4a4a] px-6 md:px-8 py-3 md:py-4 rounded-lg font-['Inter'] text-sm md:text-base font-semibold hover:bg-[#f6f3f2] transition-colors flex items-center gap-2 shadow-lg hover:shadow-xl cursor-pointer"
          >
            Eksplor Menu
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* Dot indicators — only show when there are multiple images */}
      {HERO_IMAGES.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-30">
          {HERO_IMAGES.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`hero-dot ${index === currentIndex ? 'w-8 bg-white' : 'w-2.5 bg-white/50 hover:bg-white/80'
                }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
