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
        darkGradientEnd: "#060d23",
        lightGradientStart: "#22d3ee1a",
        "brand-gold": "oklch(0.85 0.16 86.49)",
        "brand-fuchsia": "oklch(0.58 0.27 338.56)",
        "brand-burnt-orange": "#F87313",
        "brand-gradient-midpoint": "#e69d40",
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
