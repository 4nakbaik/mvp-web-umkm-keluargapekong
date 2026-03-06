import { useState, useEffect, useRef, useCallback } from 'react';

// Static imports for all 7 hero images
import Hero1 from '../assets/Hero/Hero_1.png';
import Hero2 from '../assets/Hero/Hero_2.png';
import Hero3 from '../assets/Hero/Hero_3.png';
import Hero4 from '../assets/Hero/Hero_4.png';
import Hero5 from '../assets/Hero/Hero_5.png';
import Hero6 from '../assets/Hero/Hero_6.png';
import Hero7 from '../assets/Hero/Hero_7.png';

const HERO_IMAGES = [Hero1, Hero2, Hero3, Hero4, Hero5, Hero6, Hero7];
const SLIDE_INTERVAL = 7000; // 7 seconds
const TRANSITION_DURATION = 700; // ms, must match CSS transition

export default function HeroSlideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [noTransition, setNoTransition] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const nextIndex = (currentIndex + 1) % HERO_IMAGES.length;

  // Preload the next image in the background
  const preloadImage = useCallback((index: number) => {
    const img = new Image();
    img.src = HERO_IMAGES[index];
  }, []);

  // Advance to the next slide
  const goToNext = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);

    // After slide-left animation completes, snap back instantly
    setTimeout(() => {
      // Disable transition so the snap-back is instant (no slide-right)
      setNoTransition(true);
      setCurrentIndex((prev) => {
        const next = (prev + 1) % HERO_IMAGES.length;
        preloadImage((next + 1) % HERO_IMAGES.length);
        return next;
      });
      setIsTransitioning(false);

      // Re-enable transition on next frame
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setNoTransition(false);
        });
      });
    }, TRANSITION_DURATION);
  }, [isTransitioning, preloadImage]);

  // Start/stop auto-advance interval
  const startInterval = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(goToNext, SLIDE_INTERVAL);
  }, [goToNext]);

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
    preloadImage(0);
    preloadImage(1);
  }, [preloadImage]);

  // Go to a specific slide via dot indicator
  const goToSlide = useCallback(
    (index: number) => {
      if (isTransitioning || index === currentIndex) return;
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
    [isTransitioning, currentIndex, stopInterval, startInterval, preloadImage]
  );

  return (
    <section className="w-full px-4 sm:px-6 lg:px-8 pt-6 pb-2">
      <div className="hero-slideshow-container relative w-full h-56 sm:h-72 lg:h-100 rounded-2xl overflow-hidden shadow-md">
        {/* Track: holds current + next side by side, slides left together */}
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
          {/* Next image — placed to the right of current */}
          <img
            src={HERO_IMAGES[nextIndex]}
            alt={`Hero ${nextIndex + 1}`}
            className="hero-slide-img"
            loading="eager"
            decoding="async"
          />
        </div>

        {/* Dot indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
          {HERO_IMAGES.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`hero-dot ${
                index === currentIndex ? 'w-8 bg-white' : 'w-2.5 bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
