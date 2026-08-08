"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProductImage } from "@/types";

interface Props {
  images: ProductImage[];
  productName: string;
}

const ANGLE_LABELS: Record<ProductImage["angle"], string> = {
  FRONT:     "Front",
  BACK:      "Back",
  LEFT:      "Left",
  RIGHT:     "Right",
  TOP:       "Top",
  DETAIL:    "Detail",
  LIFESTYLE: "Lifestyle",
};

export default function ImageGallery({ images, productName }: Props) {
  const [activeIdx, setActiveIdx] = useState(0);
  const active = images[activeIdx] ?? images[0];
  const hasMany = images.length > 1;

  function prev() {
    setActiveIdx((i) => (i - 1 + images.length) % images.length);
  }
  function next() {
    setActiveIdx((i) => (i + 1) % images.length);
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden group">
        <Image
          src={active.url}
          alt={active.altText ?? `${productName} – ${ANGLE_LABELS[active.angle]}`}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 55vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />

        {/* Angle badge */}
        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 text-[10px] font-semibold text-stone-600 tracking-widest uppercase">
          {ANGLE_LABELS[active.angle]}
        </span>

        {/* Arrow navigation */}
        {hasMany && (
          <>
            <button
              onClick={prev}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow-sm"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={next}
              aria-label="Next image"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow-sm"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}

        {/* Dot indicators */}
        {hasMany && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIdx(idx)}
                aria-label={`View image ${idx + 1}`}
                className={cn(
                  "rounded-full transition-all",
                  idx === activeIdx
                    ? "w-5 h-1.5 bg-white"
                    : "w-1.5 h-1.5 bg-white/50 hover:bg-white/80"
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {hasMany && (
        <div className="flex gap-2 overflow-x-auto pb-0.5">
          {images.map((img, idx) => (
            <button
              key={img.id}
              onClick={() => setActiveIdx(idx)}
              className={cn(
                "relative flex-shrink-0 w-[72px] h-[54px] border-2 overflow-hidden transition-all",
                idx === activeIdx
                  ? "border-stone-900"
                  : "border-transparent opacity-60 hover:opacity-100 hover:border-stone-300"
              )}
            >
              <Image
                src={img.url}
                alt={img.altText ?? `${productName} view ${idx + 1}`}
                fill
                sizes="72px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
