/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{njk,md,html,js}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        display: ['"Bebas Neue"', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
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
      },
      gridTemplateColumns: {
        'mockup': 'var(--mockup-grid-cols)',
      },
      gridTemplateRows: {
        'mockup': 'var(--mockup-grid-rows)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
