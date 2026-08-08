import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SiteSettings {
  whatsappNumber:      string; // digits with country code, e.g. "919876543210"
  whatsappDisplay:     string; // human-readable, e.g. "+91 98765 43210"
  businessName:        string;
  businessTagline:     string;
  businessEmail:       string;
  businessCity:        string;
  announcementText:    string;
  announcementEnabled: boolean;
}

interface SettingsStore extends SiteSettings {
  updateSettings: (patch: Partial<SiteSettings>) => void;
  resetSettings:  () => void;
}

export const SETTINGS_DEFAULTS: SiteSettings = {
  whatsappNumber:      "919876543210",
  whatsappDisplay:     "+91 98765 43210",
  businessName:        "Square Cube",
  businessTagline:     "Bespoke Furniture",
  businessEmail:       "hello@squarecube.in",
  businessCity:        "Pune, India",
  announcementText:    "✦ Handcrafted with Premium Indian Wood  ·  Free Delivery on Orders Above ₹50,000  ·  Request Custom Furniture",
  announcementEnabled: true,
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...SETTINGS_DEFAULTS,
      updateSettings: (patch) => set((s) => ({ ...s, ...patch })),
      resetSettings:  () => set({ ...SETTINGS_DEFAULTS }),
    }),
    {
      name:    "sc-settings",
      version: 1,
    }
  )
);
