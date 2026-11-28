import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Ultra-luxury palette
        alabaster: "#F8F5F0",
        silk:      "#F2EDE6",
        espresso:  "#231F1E",
        champagne: "#B08968",
        "warm-border": "#E6DFD5",
        "cream-card":  "#FFFFFF",
        // Bronze/Gold shades
        bronze: {
          50:  "#FAF6F1",
          100: "#F3EAE0",
          200: "#E5D0BB",
          300: "#D4B090",
          400: "#C29068",
          500: "#B08968",
          600: "#96714E",
          700: "#7A5A3A",
          800: "#5E4228",
          900: "#402B16",
        },
        // Keep gold for compatibility
        gold: {
          50:  "#FBF6EC",
          100: "#F5EAD0",
          200: "#E8CF9A",
          300: "#D9B060",
          400: "#C99A3E",
          500: "#B8862B",
          600: "#9A6E20",
          700: "#7A5518",
          800: "#5A3D10",
          900: "#3A2608",
        },
      },
      fontFamily: {
        display: ["var(--font-cormorant)", "var(--font-playfair)", "Georgia", "serif"],
        ui:      ["var(--font-jakarta)", "var(--font-inter)", "system-ui", "sans-serif"],
        sans:    ["var(--font-jakarta)", "var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        luxury:       "0 2px 24px -4px rgba(35,31,30,0.08), 0 1px 6px -2px rgba(35,31,30,0.04)",
        "luxury-hover": "0 12px 48px -8px rgba(35,31,30,0.18), 0 2px 12px -4px rgba(35,31,30,0.08)",
        card:         "0 2px 20px -4px rgba(0,0,0,0.08), 0 1px 4px -2px rgba(0,0,0,0.04)",
        "card-hover": "0 8px 40px -8px rgba(0,0,0,0.15), 0 2px 8px -4px rgba(0,0,0,0.06)",
      },
      keyframes: {
        "slide-in-left": {
          from: { transform: "translateX(-100%)" },
          to:   { transform: "translateX(0)" },
        },
        "fade-in":   { from: { opacity: "0" }, to: { opacity: "1" } },
        "slide-down": {
          from: { opacity: "0", transform: "translateY(-6px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "shimmer": {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "slide-in-left": "slide-in-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "fade-in":       "fade-in 0.25s ease-out",
        "slide-down":    "slide-down 0.22s ease-out",
        "shimmer":       "shimmer 2s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
