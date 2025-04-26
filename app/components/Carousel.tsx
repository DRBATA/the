"use client";
import Image from "next/image";
import { useState } from "react";

import { slideIcons } from "../slideIcons";
import { IconType } from "react-icons";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const slides = [
  {
    src: "/soberchic.jpg",
    alt: "Sober Chic Event Photo",
    headline: "PERRIER PARTY",
    subheadline: "Socialize & Celebrate",
    tagline: "Connection Without Compromise",
    button: {
      text: "Book Your Session",
      link: "#book"
    }
  },
  {
    src: "/Yala.jpg",
    alt: "Chill + Restore Event Photo",
    headline: "YOUR HOME, YOUR OASIS",
    subheadline: "Book & Relax",
    tagline: "Luxury. Convenience. Confidence.",
    button: null
  },
  {
    src: "/majlismoment.jpg",
    alt: "Majlis Moment Event Photo",
    headline: "CHILL + RESTORE",
    subheadline: "The Ultimate Being Experience",
    tagline: "Return to Yourself",
    button: {
      text: "Book Your Session",
      link: "#book"
    }
  }
];

export default function Carousel() {
  const [current, setCurrent] = useState(0);
  // sheet: { key, icon, label, content, footer } | null
  type SheetType = {
  key: string;
  icon: IconType;
  label: string;
  content?: string;
  footer?: string;
} | null;
const [sheet, setSheet] = useState<SheetType>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Map slide index to slideIcons key
  const slideKey = ["perrier", "majlis", "chill"] as const;
  const currentIcons = slideIcons[slideKey[current] as keyof typeof slideIcons] || [];

  const nextSlide = () => setCurrent((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

  // Swipe logic
  const handleSwipe = () => {
    if (touchStart === null || touchEnd === null) return;
    const distance = touchStart - touchEnd;
    if (Math.abs(distance) > 50) {
      if (distance > 0) {
        nextSlide(); // swipe left
      } else {
        prevSlide(); // swipe right
      }
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  return (
    <div
      className="relative w-full h-screen min-h-[400px] overflow-hidden"
      onTouchStart={(e: React.TouchEvent<HTMLDivElement>) => setTouchStart(e.touches[0].clientX)}
      onTouchMove={(e: React.TouchEvent<HTMLDivElement>) => setTouchEnd(e.touches[0].clientX)}
      onTouchEnd={handleSwipe}
      onMouseDown={(e: React.MouseEvent<HTMLDivElement>) => setTouchStart(e.clientX)}
      onMouseMove={(e: React.MouseEvent<HTMLDivElement>) => touchStart !== null && setTouchEnd(e.clientX)}
      onMouseUp={handleSwipe}
      onMouseLeave={handleSwipe}
      style={{ WebkitUserSelect: "none", userSelect: "none" }}
    >
      {/* Logo overlay */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 flex items-center justify-center">
        <Image src="/logo.png" alt="Logo" width={240} height={120} className="overlay" priority />
      </div>
      <Image
        src={slides[current].src}
        alt={slides[current].alt}
        fill
        style={{ objectFit: "cover" }}
        priority
      />
      {/* Centered text overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-20 px-4">
        <div className="mt-8" />
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold font-playfair italic text-white drop-shadow-lg mb-3 animate-fadein">
  {slides[current].headline === "PERRIER PARTY" ? (
    <>
      PERRIER <span className="font-playfair italic">&</span> PARTY
    </>
  ) : (
    slides[current].headline
  )}
</h1>
        <h2 className="text-lg sm:text-2xl md:text-3xl font-playfair italic text-[color:var(--primary-blue)] mb-2 animate-fadein">
  {slides[current].subheadline}
</h2>
        {slides[current].tagline && (
          <div className="text-base sm:text-xl font-playfair italic text-white/80 mb-6 animate-fadein">
  {slides[current].tagline}
</div>
        )}
        {slides[current].button && (
          <a
            href={slides[current].button.link}
            className="btn"
          >
            {slides[current].button.text}
          </a>
        )}
      </div>
      {/* Carousel controls - chevrons, center vertically */}
      <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4 pointer-events-none z-30">
        <button
          className="btn"
          onClick={prevSlide}
          aria-label="Previous slide"
          style={{ minWidth: 56, minHeight: 56 }}
        >
          <FiChevronLeft />
        </button>
        <button
          className="btn"
          onClick={nextSlide}
          aria-label="Next slide"
          style={{ minWidth: 56, minHeight: 56 }}
        >
          <FiChevronRight />
        </button>
      </div>
      {/* Floating elegant action icons */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 z-30">
        {currentIcons.map((iconObj: { key: string; icon: IconType; label: string }) => {
          const Icon: IconType = iconObj.icon;
          return (
            <button
              key={iconObj.key}
              className="btn"
              onClick={() => setSheet(iconObj)}
              aria-label={iconObj.label}
              style={{ color: 'white', fontSize: 28 }}
            >
              <Icon />
            </button>
          );
        })}
      </div>
      {/* Carousel dots */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {slides.map((_, idx) => (
          <span
            key={idx}
            className={`block w-2 h-2 rounded-full ${idx === current ? "bg-[color:var(--primary-blue)]" : "bg-white/50"}`}
          />
        ))}
      </div>
      {/* Emerald glassmorphism info BottomSheet */}
      {/* BottomSheet removed for new UI. Previously: <BottomSheet open={!!sheet} onClose={() => setSheet(null)}> */}
        {sheet ? (
          <div className="px-6 py-6 flex flex-col items-center text-center rounded-2xl shadow-2xl"
            style={{
              background: "rgba(16, 185, 129, 0.25)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: "1.5px solid rgba(52, 211, 153, 0.25)",
              boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
            }}
          >
            <div className="mb-3 flex items-center justify-center w-14 h-14 rounded-full bg-[color:var(--primary-blue)] text-white text-3xl shadow-lg">
              {sheet.icon ? <sheet.icon /> : <span>?</span>}
            </div>
            <h3 className="text-xl font-bold mb-2 text-white drop-shadow">{sheet.label || 'No title'}</h3>
            <div className="text-base text-white/90 mb-4 min-h-[40px] drop-shadow">
              {sheet.content || <span className="italic text-[color:var(--primary-blue)]">No info available.</span>}
            </div>
            <hr className="w-10 border-[color:var(--primary-blue)] my-2 opacity-60" />
            <div className="text-[color:var(--primary-blue)] text-sm font-semibold mt-2 min-h-[20px]">
              {sheet.footer || <span className="italic text-[color:var(--primary-blue)]">No footer.</span>}
            </div>
          </div>
        ) : (
          <div className="p-6 text-center text-gray-400">No info to display.</div>
        )}
      {/* End BottomSheet removed */}

    </div>
  );
}
