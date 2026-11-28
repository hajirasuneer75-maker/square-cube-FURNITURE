import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SiteSettings {
  whatsappNumber:      string;
  whatsappDisplay:     string;
  businessName:        string;
  businessTagline:     string;
  businessEmail:       string;
  businessCity:        string;
  announcementText:    string;
  announcementEnabled: boolean;
  heroHeadline:        string;
  heroSubheadline:     string;
  heroBannerUrl:       string;
}

interface SettingsStore extends SiteSettings {
  updateSettings: (patch: Partial<SiteSettings>) => void;
  resetSettings:  () => void;
  syncFromServer: () => Promise<void>;
}

const ENV_WA = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "918547097173";

export const SETTINGS_DEFAULTS: SiteSettings = {
  whatsappNumber:      ENV_WA,
  whatsappDisplay:     "+91 85470 97173",
  businessName:        "Square Cube Furniture",
  businessTagline:     "Architectural Woodcraft & Custom Studio",
  businessEmail:       "hello@squarecubefurniture.in",
  businessCity:        "Kerala, India",
  announcementText:    "✦ Ultra-Luxury Handcrafted Furniture  ·  Nilambur Teak & Heritage Hardwoods  ·  Concierge: +91 85470 97173",
  announcementEnabled: true,
  heroHeadline:        "Architectural Furniture Crafted for Living",
  heroSubheadline:     "Square Cube Furniture sculpts heirloom pieces from Kerala's finest Nilambur Teak, Mahogany, and Rosewood — built to your home's exact proportions.",
  heroBannerUrl:       "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1600&q=80",
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...SETTINGS_DEFAULTS,
      updateSettings: (patch) => set((s) => ({ ...s, ...patch })),
      resetSettings:  () => set({ ...SETTINGS_DEFAULTS }),
      syncFromServer: async () => {
        try {
          const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
          const res = await fetch(`${API}/api/site-settings`, { cache: "no-store" });
          if (!res.ok) return;
          const json = await res.json();
          if (json?.success && json.data) {
            const d = json.data as Record<string, string>;
            set((s) => ({
              ...s,
              ...(d.whatsappNumber ? { whatsappNumber: d.whatsappNumber } : {}),
              ...(d.whatsappDisplay ? { whatsappDisplay: d.whatsappDisplay } : {}),
              ...(d.businessName ? { businessName: d.businessName } : {}),
              ...(d.businessTagline ? { businessTagline: d.businessTagline } : {}),
              ...(d.businessEmail ? { businessEmail: d.businessEmail } : {}),
              ...(d.businessCity ? { businessCity: d.businessCity } : {}),
              ...(d.announcementText ? { announcementText: d.announcementText } : {}),
              ...(d.announcementEnabled !== undefined
                ? { announcementEnabled: d.announcementEnabled !== "false" }
                : {}),
              ...(d.heroHeadline ? { heroHeadline: d.heroHeadline } : {}),
              ...(d.heroSubheadline ? { heroSubheadline: d.heroSubheadline } : {}),
              ...(d.heroBannerUrl ? { heroBannerUrl: d.heroBannerUrl } : {}),
            }));
          }
        } catch {
          // API unreachable — keep persisted/default settings
        }
      },
    }),
    {
      name:    "sc-settings",
      version: 2,
      migrate: () => ({ ...SETTINGS_DEFAULTS }),
    }
  )
);
