import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: "#08090C",
          900: "#0F1117",
          850: "#141721",
          800: "#1A1E2B",
          700: "#2A3042",
          600: "#3D465E",
        },
        brand: {
          cyan: "#00F0FF",
          pink: "#FF007A",
          violet: "#7928CA",
          amber: "#FFB800",
          emerald: "#10B981",
        },
      },
      fontFamily: {
        sans: ["var(--font-manrope)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;

