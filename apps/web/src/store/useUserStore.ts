"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types";

interface UserPreferences {
  preferredWoodType: string | null;
  preferredPriceRange: [number, number] | null;
  recentlyViewed: string[];
}

interface UserStore {
  user: User | null;
  isAuthenticated: boolean;
  preferences: UserPreferences;
  setUser: (user: User) => void;
  clearUser: () => void;
  setPreferredWood: (woodTypeId: string) => void;
  addRecentlyViewed: (productId: string) => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      preferences: {
        preferredWoodType: null,
        preferredPriceRange: null,
        recentlyViewed: [],
      },

      setUser: (user) => set({ user, isAuthenticated: true }),

      clearUser: () => set({ user: null, isAuthenticated: false }),

      setPreferredWood: (woodTypeId) =>
        set((state) => ({
          preferences: { ...state.preferences, preferredWoodType: woodTypeId },
        })),

      addRecentlyViewed: (productId) =>
        set((state) => {
          const filtered = state.preferences.recentlyViewed.filter(
            (id) => id !== productId
          );
          return {
            preferences: {
              ...state.preferences,
              recentlyViewed: [productId, ...filtered].slice(0, 10),
            },
          };
        }),
    }),
    {
      name: "sc-user",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        preferences: state.preferences,
      }),
    }
  )
);
