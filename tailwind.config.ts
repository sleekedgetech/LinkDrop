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
          950: "#05070B",
          900: "#0B0F17",
          850: "#111622",
          800: "#182030",
          700: "#243048",
          600: "#384768",
        },
        brand: {
          cyan: "#00E5FF",
          electric: "#2979FF",
          blue: "#1E6FFF",
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

