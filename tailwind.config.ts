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
    screens: {
      'xs': '480px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1E88E5',
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        navy: {
          DEFAULT: '#212C38',
          800: '#1C252F',
        },
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
          '"TASA Orbiter"', "system-ui", "sans-serif"
        ],
        brand: [
          '"TASA Orbiter"', '"Montserrat"', "system-ui", "sans-serif"
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