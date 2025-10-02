/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{njk,md,html,js}"],
  darkMode: "class",
  theme: {
    extend: {
      typography: {
        DEFAULT: { 
          css: { 
            maxWidth: "100%",
          }
        }
      },
      colors: {
        "dark-gradient-end": "#060d23",
        "light-gradient-start": "#DEF8FC",
        "brand-gold": "oklch(0.85 0.16 86.49)",
        "brand-fuchsia": "oklch(0.58 0.27 338.56)",
        "brand-burnt-orange": "#F87313",
        "brand-gradient-midpoint": "#e69d40",
        "brand-dark-shadow-lch": "0.51 0.25 263.16",
        "brand-dark-shadow": "oklch(var(--brand-dark-shadow-lch) / <alpha-value>)",
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
