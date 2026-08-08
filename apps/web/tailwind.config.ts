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
        display: ["var(--font-playfair)", "Georgia", "serif"],
        sans:    ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card:       "0 2px 20px -4px rgba(0,0,0,0.08), 0 1px 4px -2px rgba(0,0,0,0.04)",
        "card-hover": "0 8px 40px -8px rgba(0,0,0,0.15), 0 2px 8px -4px rgba(0,0,0,0.06)",
      },
      keyframes: {
        "slide-in-left": {
          from: { transform: "translateX(-100%)" },
          to:   { transform: "translateX(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        "slide-down": {
          from: { opacity: "0", transform: "translateY(-4px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "slide-in-left": "slide-in-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "fade-in":        "fade-in 0.2s ease-out",
        "slide-down":     "slide-down 0.2s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
