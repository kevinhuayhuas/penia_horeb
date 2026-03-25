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
        primary: {
          50:  "#f0f4ff",
          100: "#dce6ff",
          200: "#b9ceff",
          300: "#84a8ff",
          400: "#4d7aff",
          500: "#2150f5",
          600: "#0f33e1",
          700: "#0d27b6",
          800: "#112293",
          900: "#132076",
          950: "#0c1247",
        },
        accent: {
          50:  "#fff8ed",
          100: "#ffefd4",
          200: "#ffdba8",
          300: "#ffc171",
          400: "#fe9b38",
          500: "#fc7d10",
          600: "#ed6206",
          700: "#c44a07",
          800: "#9c3a0e",
          900: "#7d320f",
          950: "#441705",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
