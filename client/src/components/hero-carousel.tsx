import { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n, usePropertyText } from "@/lib/i18n";
import type { Property } from "@shared/schema";

interface HeroCarouselProps {
  properties: Property[];
}

export function HeroCarousel({ properties }: HeroCarouselProps) {
  const { t } = useI18n();
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, duration: 30 },
    [Autoplay({ delay: 5000, stopOnInteraction: false })]
  );
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  const displayProperties = properties.slice(0, 5);

  if (displayProperties.length === 0) {
    return (
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
        <div className="text-center px-6">
          <h1 className="font-display font-bold text-5xl md:text-7xl mb-6">
            {t("hero.title")}
          </h1>
          <p className="text-lg md:text-xl mb-8 text-muted-foreground max-w-2xl mx-auto">
            {t("hero.subtitle")}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden">
      <div className="embla" ref={emblaRef}>
        <div className="embla__container flex">
          {displayProperties.map((property, index) => {
            const imageUrl = property.images?.[0] || "";
            return (
            <div key={property.id} className="embla__slide flex-[0_0_100%] min-w-0 relative">
              <div className="relative h-screen">
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: imageUrl ? `url(${imageUrl})` : "linear-gradient(135deg, hsl(173 80% 40%), hsl(24 95% 53%))",
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
                
                <div className="relative h-full flex items-center justify-center">
                  <div className="text-center text-white px-6 max-w-5xl mx-auto">
                    <AnimatePresence mode="wait">
                      {selectedIndex === index && (
                        <motion.div
                          key={property.id}
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -30 }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                        >
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="inline-block px-6 py-2 bg-primary/20 backdrop-blur-md rounded-full mb-6 border border-white/20"
                          >
                            <span className="text-sm font-medium tracking-wide uppercase">
                              {property.type} • {usePropertyText(property, 'location')}
                            </span>
                          </motion.div>

                          <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                            className="font-display font-bold text-4xl md:text-6xl lg:text-7xl mb-6 tracking-tight"
                          >
                            {usePropertyText(property, 'title')}
                          </motion.h1>

                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4, duration: 0.5 }}
                            className="text-lg md:text-xl mb-4 text-white/90 max-w-3xl mx-auto line-clamp-2"
                          >
                            {usePropertyText(property, 'description')}
                          </motion.p>

                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5, duration: 0.5 }}
                            className="flex items-center justify-center gap-6 mb-8 text-white/80"
                          >
                            {property.bedrooms > 0 && (
                              <span className="flex items-center gap-2">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM8 11H6V9h2v2zm4 0h-2V9h2v2z"/>
                                </svg>
                                {property.bedrooms} {t("hero.beds")}
                              </span>
                            )}
                            <span className="flex items-center gap-2">
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 2a8 8 0 100 16 8 8 0 000-16z"/>
                              </svg>
                              {property.bathrooms} {t("hero.baths")}
                            </span>
                            <span className="flex items-center gap-2">
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M3 3h14a1 1 0 011 1v12a1 1 0 01-1 1H3a1 1 0 01-1-1V4a1 1 0 011-1z"/>
                              </svg>
                              {property.area} {t("common.sqft")}
                            </span>
                          </motion.div>

                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6, duration: 0.5 }}
                            className="text-3xl md:text-4xl font-display font-bold mb-8 text-accent"
                          >
                            ৳{parseFloat(property.price).toLocaleString('en-BD')}
                          </motion.div>

                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7, duration: 0.5 }}
                            className="flex flex-wrap gap-4 justify-center"
                          >
                            <Link href={`/properties/${property.id}`}>
                              <Button
                                size="lg"
                                variant="default"
                                className="font-display text-base tracking-wide shadow-xl"
                              >
                                {t("hero.viewDetails")}
                              </Button>
                            </Link>
                            <Link href="/contact">
                              <Button
                                size="lg"
                                variant="secondary"
                                className="font-display text-base tracking-wide backdrop-blur-md shadow-xl"
                              >
                                {t("hero.contact")}
                              </Button>
                            </Link>
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>
          );
          })}
        </div>
      </div>

      <button
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300 hover:scale-110"
        onClick={scrollPrev}
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300 hover:scale-110"
        onClick={scrollNext}
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-3">
        {displayProperties.map((_, index) => (
          <button
            key={index}
            className={`transition-all duration-300 ${
              index === selectedIndex
                ? "w-12 h-3 bg-white rounded-full"
                : "w-3 h-3 bg-white/40 rounded-full hover:bg-white/60"
            }`}
            onClick={() => scrollTo(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
