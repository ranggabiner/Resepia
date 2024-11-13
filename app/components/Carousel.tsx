'use client';

import React, { useState, useEffect, ReactNode } from 'react';

interface CarouselProps {
  children: ReactNode[]; // Carousel will receive multiple card components as children
  interval?: number;     // Optional interval for auto-scroll, in milliseconds
}

export default function Carousel({ children, interval = 3000 }: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const totalItems = children.length;

  // Move to the next slide
  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % totalItems);
  };

  // Move to the previous slide
  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + totalItems) % totalItems);
  };

  // Auto-slide with interval if desired
  useEffect(() => {
    const autoScroll = setInterval(nextSlide, interval);
    return () => clearInterval(autoScroll); // Clear interval on unmount
  }, [interval]);

  return (
    <div className="relative w-full overflow-hidden">
      {/* Carousel Wrapper */}
      <div
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {children.map((child, index) => (
          <div className="w-full flex-shrink-0" key={index}>
            {child}
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      <button
        className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-black text-white w-10 h-10 rounded-full flex items-center justify-center"
        onClick={prevSlide}
      >
        ❮
      </button>
      <button
        className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-black text-white w-10 h-10 rounded-full flex items-center justify-center"
        onClick={nextSlide}
      >
        ❯
      </button>

      {/* Dots Navigation */}
      <div className="absolute bottom-4 w-full flex justify-center space-x-2">
        {children.map((_, index) => (
          <div
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full cursor-pointer ${
              currentIndex === index ? 'bg-black' : 'bg-gray-400'
            }`}
          ></div>
        ))}
      </div>
    </div>
  );
}
