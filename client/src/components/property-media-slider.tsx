import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageViewer } from "@/components/image-viewer";

interface PropertyMediaSliderProps {
  videos?: string[];
  images: string[];
  title: string;
}

export function PropertyMediaSlider({ videos = [], images, title }: PropertyMediaSliderProps) {
  const allMedia = [...videos, ...images];
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, skipSnaps: false },
    [Autoplay({ delay: 5000, stopOnInteraction: true })]
  );
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

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

  if (allMedia.length === 0) {
    return null;
  }

  const isVideo = (url: string) => {
    return url.match(/\.(mp4|webm|ogg|mov)$/i) || videos.includes(url);
  };

  const handleImageClick = (index: number) => {
    if (!isVideo(allMedia[index])) {
      const imageOnlyIndex = images.indexOf(allMedia[index]);
      if (imageOnlyIndex !== -1) {
        setViewerIndex(imageOnlyIndex);
        setViewerOpen(true);
      }
    }
  };

  return (
    <div className="mb-12">
      <div className="relative rounded-lg overflow-hidden bg-black" data-testid="property-media-slider">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {allMedia.map((media, index) => (
              <div key={index} className="flex-[0_0_100%] min-w-0" data-testid={`slide-${index}`}>
                {isVideo(media) ? (
                  <div className="relative">
                    <video
                      src={media}
                      className="w-full h-[500px] object-cover"
                      controls
                      playsInline
                      data-testid={`video-${index}`}
                    >
                      Your browser does not support the video tag.
                    </video>
                    <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-md text-sm flex items-center gap-1">
                      <Play className="w-3 h-3" />
                      Video
                    </div>
                  </div>
                ) : (
                  <img
                    src={media}
                    alt={`${title} - ${index + 1}`}
                    className="w-full h-[500px] object-cover cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => handleImageClick(index)}
                    data-testid={`img-slide-${index}`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {allMedia.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm"
              onClick={scrollPrev}
              data-testid="button-slider-prev"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm"
              onClick={scrollNext}
              data-testid="button-slider-next"
            >
              <ChevronRight className="w-6 h-6" />
            </Button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {allMedia.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === selectedIndex
                      ? "bg-white w-8"
                      : "bg-white/50 hover:bg-white/75"
                  }`}
                  onClick={() => scrollTo(index)}
                  data-testid={`dot-indicator-${index}`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {allMedia.length > 1 && (
        <div className="mt-4 grid grid-cols-4 md:grid-cols-6 gap-3">
          {allMedia.map((media, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={`rounded-md overflow-hidden hover-elevate transition-all relative ${
                selectedIndex === index ? "ring-2 ring-primary" : ""
              }`}
              data-testid={`thumbnail-${index}`}
            >
              {isVideo(media) ? (
                <div className="relative">
                  <video
                    src={media}
                    className="w-full h-20 object-cover"
                    muted
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Play className="w-5 h-5 text-white" />
                  </div>
                </div>
              ) : (
                <img
                  src={media}
                  alt={`${title} thumbnail ${index + 1}`}
                  className="w-full h-20 object-cover cursor-pointer"
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    handleImageClick(index); 
                  }}
                />
              )}
            </button>
          ))}
        </div>
      )}

      <ImageViewer
        images={images}
        initialIndex={viewerIndex}
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
      />
    </div>
  );
}
