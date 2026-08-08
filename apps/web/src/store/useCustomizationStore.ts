"use client";

import { create } from "zustand";

interface SizeDimensions {
  length: string;
  width: string;
  height: string;
}

interface CustomizationState {
  productId: string | null;
  productName: string | null;
  selectedWoodTypeId: string | null;
  selectedWoodTypeName: string | null;
  customizations: Record<string, string>;
  size: SizeDimensions;
  additionalNotes: string;
  calculatedPrice: number | null;
  isCalculating: boolean;
}

interface CustomizationStore extends CustomizationState {
  initForProduct: (productId: string, productName: string, basePrice: number) => void;
  setWoodType: (id: string, name: string) => void;
  setCustomization: (optionName: string, value: string) => void;
  setSize: (dimension: keyof SizeDimensions, value: string) => void;
  setNotes: (notes: string) => void;
  setCalculatedPrice: (price: number) => void;
  setCalculating: (isCalculating: boolean) => void;
  reset: () => void;
  buildWhatsAppUrl: (whatsappNumber: string) => string;
}

const INITIAL_STATE: CustomizationState = {
  productId: null,
  productName: null,
  selectedWoodTypeId: null,
  selectedWoodTypeName: null,
  customizations: {},
  size: { length: "", width: "", height: "" },
  additionalNotes: "",
  calculatedPrice: null,
  isCalculating: false,
};

export const useCustomizationStore = create<CustomizationStore>()((set, get) => ({
  ...INITIAL_STATE,

  initForProduct: (productId, productName, basePrice) =>
    set({ ...INITIAL_STATE, productId, productName, calculatedPrice: basePrice }),

  setWoodType: (id, name) =>
    set({ selectedWoodTypeId: id, selectedWoodTypeName: name }),

  setCustomization: (optionName, value) =>
    set((state) => ({
      customizations: { ...state.customizations, [optionName]: value },
    })),

  setSize: (dimension, value) =>
    set((state) => ({
      size: { ...state.size, [dimension]: value },
    })),

  setNotes: (additionalNotes) => set({ additionalNotes }),

  setCalculatedPrice: (price) =>
    set({ calculatedPrice: price, isCalculating: false }),

  setCalculating: (isCalculating) => set({ isCalculating }),

  reset: () => set(INITIAL_STATE),

  buildWhatsAppUrl: (whatsappNumber) => {
    const state = get();
    const lines: string[] = [
      `Hello Square Cube! 👋`,
      ``,
      `I am interested in: *${state.productName || "a product"}*`,
    ];

    if (state.selectedWoodTypeName) {
      lines.push(`Wood Type: ${state.selectedWoodTypeName}`);
    }

    const { length, width, height } = state.size;
    const sizeParts = [
      length && `L: ${length}cm`,
      width  && `W: ${width}cm`,
      height && `H: ${height}cm`,
    ].filter(Boolean);
    if (sizeParts.length) lines.push(`Size: ${sizeParts.join(", ")}`);

    Object.entries(state.customizations).forEach(([key, value]) => {
      lines.push(`${key}: ${value}`);
    });

    if (state.additionalNotes) {
      lines.push(``, `Notes: ${state.additionalNotes}`);
    }

    lines.push(``, `Please provide more details and a price quote.`);

    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(lines.join("\n"))}`;
  },
}));
