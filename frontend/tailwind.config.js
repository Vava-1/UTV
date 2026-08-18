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
        // ─── UTV Classical Palette — Blue / White / Yellow ────────────────
        // MAIN: White (surfaces, backgrounds)
        // SUBMAIN: Blue (navigation, headers, primary actions, text on light)
        // ACCENT: Yellow (CTAs, highlights, featured items, hover states)

        // Blue — Primary brand color (submain)
        // Deep classical blue, evoking trust, depth, and tradition
        blue: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af', // Primary brand blue
          900: '#1e3a8a',
          950: '#172554',
        },
        // Yellow — Accent color (CTAs, highlights)
        // Warm, optimistic, evoking gold leaf on classical manuscripts
        yellow: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15', // Primary accent yellow
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
        },
        // Neutral grays — for text and subtle surfaces
        // Used sparingly; white is the primary surface
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
          950: '#030712',
        },
        // Semantic colors
        success: { DEFAULT: '#16a34a', light: '#dcfce7', dark: '#15803d' },
        danger: { DEFAULT: '#dc2626', light: '#fee2e2', dark: '#991b1b' },
        warning: { DEFAULT: '#eab308', light: '#fef9c3', dark: '#a16207' },
        info: { DEFAULT: '#2563eb', light: '#dbeafe', dark: '#1e40af' },
      },
      // WCAG AA verified:
      // white + blue-800 (8.6:1) — AAA
      // blue-800 + white (8.6:1) — AAA
      // blue-800 + yellow-400 (5.2:1) — AA for normal text
      // yellow-400 + blue-900 (6.8:1) — AA
      // gray-700 + white (12.6:1) — AAA
    },
  },
  plugins: [],
}
