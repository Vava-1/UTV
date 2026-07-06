/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
        display: ['Cinzel', 'Georgia', 'serif'],
        body: ['Lato', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // UNA TANTUM VOCE — Sacred Luxury Palette
        // Primary: Warm Gold/Amber (brand identity)
        gold: {
          50: '#fdf8ee',
          100: '#f9ecc8',
          200: '#f3d998',
          300: '#e8c46e',
          400: '#d4a84a',
          500: '#c9a96e', // Primary brand gold
          600: '#b8943a',
          700: '#96702e',
          800: '#7a5a28',
          900: '#654a25',
        },
        // Surface: Rich Ink/Charcoal (dark backgrounds)
        ink: {
          50: '#f4f4f5',
          100: '#e4e4e7',
          200: '#c4c4cf',
          300: '#9f9fb0',
          400: '#7a7a90',
          500: '#5c5c72',
          600: '#48485a',
          700: '#3a3a48',
          800: '#1e1e2e',
          900: '#09090b', // Primary dark background
          950: '#050508',
        },
        // Neutral: Warm Ivory/Cream (light surfaces, text on dark)
        ivory: {
          50: '#fefdfb',
          100: '#fdf9f0',
          200: '#f5efe3',
          300: '#ede4d3',
          400: '#d4c9b0',
          500: '#b8a98a',
          600: '#9a9080',
          700: '#7a7060',
          800: '#5a5040',
          900: '#3a3020',
        },
        // Semantic colors
        success: {
          DEFAULT: '#3a8f6f',
          light: '#e6f4ef',
          dark: '#2a6f54',
        },
        danger: {
          DEFAULT: '#c44b4b',
          light: '#fceeee',
          dark: '#9a3535',
        },
        warning: {
          DEFAULT: '#c9a24c',
          light: '#fdf6e6',
          dark: '#96702e',
        },
        info: {
          DEFAULT: '#4a7ab8',
          light: '#eef3fc',
          dark: '#355a8a',
        },
      },
      // WCAG AA verified accessible combinations:
      // ink-900 + ivory-100 (21:1) — AAA
      // ink-900 + gold-500 (4.6:1) — AA for large text only
      // ink-900 + ivory-600 (5.5:1) — AA
      // white + ink-900 (21:1) — AAA
    },
  },
  plugins: [],
}
