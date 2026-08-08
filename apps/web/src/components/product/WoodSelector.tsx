"use client";

import { Check } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import type { WoodType } from "@/types";

interface Props {
  woods: WoodType[];
  selectedId: string | null;
  onChange: (wood: WoodType) => void;
}

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
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {woods.map((wood) => {
        const isSelected = selectedId === wood.id;
        const label = priceDiffLabel(wood.priceModifier, wood.priceModifierType);
        const isSaving = wood.priceModifier < 0 && wood.priceModifierType === "FIXED_ADD";
        const isIncluded = label === "Included";

        return (
          <button
            key={wood.id}
            onClick={() => onChange(wood)}
            className={cn(
              "relative text-left p-3.5 border-2 transition-all duration-200",
              isSelected
                ? "border-stone-900 bg-stone-900"
                : "border-stone-200 bg-white hover:border-stone-400"
            )}
          >
            {isSelected && (
              <Check
                size={12}
                strokeWidth={3}
                className="absolute top-3 right-3 text-white"
              />
            )}

            <p className={cn(
              "text-sm font-semibold mb-1",
              isSelected ? "text-white" : "text-stone-900"
            )}>
              {wood.name}
            </p>

            <p className={cn(
              "text-xs font-medium",
              isSelected
                ? isIncluded ? "text-stone-400" : isSaving ? "text-green-300" : "text-stone-400"
                : isIncluded ? "text-green-600" : isSaving ? "text-green-600" : "text-stone-500"
            )}>
              {label}
            </p>
          </button>
        );
      })}
    </div>
  );
}
