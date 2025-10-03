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
      keyframes: {
        'neon-flicker': {
          '0%':   { boxShadow: '0 0 0 #0000' },

          // early chaotic white flickers
          '1%':   { boxShadow: '0 0 4px #fff' },
          '3%':   { boxShadow: '0 0 0 #0000' },
          '4%':   { boxShadow: '0 0 7px #fff' },
          '6%':   { boxShadow: '0 0 0 #0000' },

          '10%':  { boxShadow: '0 0 5px #fff' },
          '12%':  { boxShadow: '0 0 0 #0000' },
          '15%':  { boxShadow: '0 0 7px #fff, 0 0 10px #fff' },
          '20%':  { boxShadow: '0 0 0 #0000' },

          // steady white glow mid-way
          '40%':  { boxShadow: '0 0 7px #fff, 0 0 10px #fff' },
          '45%':  { boxShadow: '0 0 0 #0000' },

          // introduce faint blue around 60%
          '60%': {
            boxShadow: '0 0 7px #fff, 0 0 10px #fff, 0 0 21px #5271ff55',
          },
          '65%': {
            boxShadow: '0 0 7px #fff, 0 0 10px #fff, 0 0 21px #5271ff55',
          },

    

          // final stable neon glow
          '100%': {
            boxShadow: [
              '0 0 7px #fff, 0 0 10px #fff, 0 0 21px #fff, 0 0 42px rgba(82,113,255,0.35)',
              '-1px -1px 7px #fff',
              '1px 1px 10px #fff',
              '0 0 21px #fff',
              '0 0 42px var(--brand-dark-shadow-color)',
              '0 0 82px #5271ff',
              '0 0 92px #5271ff',
            ].join(', '),
          },
        },
      },
      animation: {
        'neon-flicker': 'neon-flicker 2.4s ease-in forwards',
        'neon-flicker-infinite': 'neon-flicker 2.4s ease-in-out infinite',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
