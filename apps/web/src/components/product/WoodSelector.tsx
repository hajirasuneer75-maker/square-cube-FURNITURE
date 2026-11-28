"use client";

import { Check } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import type { WoodType } from "@/types";

interface Props {
  woods: WoodType[];
  selectedId: string | null;
  onChange: (wood: WoodType) => void;
}

const WOOD_SWATCH_HEX: Record<string, string> = {
  "nilambur-teak": "#9A6B2F",
  teak:            "#9A6B2F",
  mahogany:        "#6E2B16",
  rosewood:        "#4B2329",
  sheesham:        "#7B4D2C",
  oak:             "#C8A97E",
  "marine-ply":    "#C5A880",
  plywood:         "#C5A880",
  mdf:             "#D8CEBE",
  "engineered-wood": "#B59C7A",
};

function priceDiffLabel(modifier: number, type: WoodType["priceModifierType"]): string {
  if (type === "FIXED_ADD") {
    if (modifier === 0) return "Included";
    return modifier > 0
      ? `+${formatPrice(modifier)}`
      : `−${formatPrice(Math.abs(modifier))}`;
  }
  if (type === "MULTIPLIER") {
    if (modifier === 1) return "Included";
    const pct = Math.round(Math.abs(modifier - 1) * 100);
    return modifier > 1 ? `+${pct}%` : `−${pct}%`;
  }
  return formatPrice(modifier);
}

export default function WoodSelector({ woods, selectedId, onChange }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
      {woods.map((wood) => {
        const isSelected = selectedId === wood.id;
        const label = priceDiffLabel(wood.priceModifier, wood.priceModifierType);
        const isSaving = wood.priceModifier < 0 && wood.priceModifierType === "FIXED_ADD";
        const isIncluded = label === "Included";
        const swatchHex = WOOD_SWATCH_HEX[wood.slug] ?? "#9A6B2F";

        return (
          <button
            key={wood.id}
            type="button"
            onClick={() => onChange(wood)}
            className={cn(
              "relative text-left p-3.5 border transition-all duration-200",
              isSelected
                ? "border-espresso bg-espresso"
                : "border-warm-border bg-white hover:border-champagne"
            )}
          >
            {isSelected && (
              <Check
                size={12}
                strokeWidth={3}
                className="absolute top-3 right-3 text-champagne"
              />
            )}

            <div className="flex items-center gap-2 mb-1.5">
              <span
                className="w-4 h-4 rounded-full border border-black/15 flex-shrink-0"
                style={{ backgroundColor: swatchHex }}
              />
              <p
                className={cn(
                  "text-xs font-ui font-semibold leading-tight",
                  isSelected ? "text-white" : "text-espresso"
                )}
              >
                {wood.name}
              </p>
            </div>

            <p
              className={cn(
                "text-[11px] font-ui font-medium",
                isSelected
                  ? isSaving
                    ? "text-emerald-300"
                    : "text-champagne"
                  : isIncluded || isSaving
                  ? "text-emerald-700"
                  : "text-espresso/55"
              )}
            >
              {label}
            </p>
          </button>
        );
      })}
    </div>
  );
}
