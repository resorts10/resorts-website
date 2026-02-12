"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface ImageLightboxProps {
  images: string[];
  initialIndex: number;
  onClose: () => void;
}

export function ImageLightbox({ images, initialIndex, onClose }: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goToPrevious();
      if (e.key === "ArrowRight") goToNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const touchStartX = e.touches[0].clientX;
    const handleTouchEnd = (endEvent: TouchEvent) => {
      const touchEndX = endEvent.changedTouches[0].clientX;
      const diff = touchStartX - touchEndX;
      
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          goToNext();
        } else {
          goToPrevious();
        }
      }
      
      window.removeEventListener("touchend", handleTouchEnd);
    };
    
    window.addEventListener("touchend", handleTouchEnd);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
        onClick={onClose}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 text-white hover:text-gray-300 text-3xl"
        >
          ✕
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            goToPrevious();
          }}
          className="absolute left-4 z-50 text-white hover:text-gray-300 text-4xl"
        >
          ‹
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            goToNext();
          }}
          className="absolute right-4 z-50 text-white hover:text-gray-300 text-4xl"
        >
          ›
        </button>

        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className="relative w-full h-full max-w-6xl max-h-[90vh] flex items-center justify-center"
          onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
          onTouchStart={handleTouchStart}
        >
          <Image
            src={images[currentIndex]}
            alt={`صورة ${currentIndex + 1}`}
            fill
            className="object-contain"
            priority
          />
        </motion.div>

        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm">
          {currentIndex + 1} / {images.length}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
