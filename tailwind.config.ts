/** @type {import('tailwindcss').Config} */
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        "brand-primary": "#0D47A1",
        "brand-secondary": "#1976D2",
        "brand-accent": "#FFC107",
        "brand-light": "#E3F2FD",
        "brand-dark": "#002171",
        "text-primary": "#212121",
        "text-secondary": "#757575",
        "bg-main": "#F7F9FC",
        "bg-card": "#FFFFFF",
        success: "#2E7D32",
        warning: "#ED6C02",
        error: "#D32F2F"
      },
      fontFamily: {
        sans: [
          "Inter", "system-ui", "-apple-system", "BlinkMacSystemFont",
          '"Segoe UI"', "Roboto", '"Helvetica Neue"', "Arial",
          '"Noto Sans"', "sans-serif"
        ]
      },
      transitionDuration: {
        '600': '600ms'
      }
    }
  },
  plugins: [],
};

export default config; 