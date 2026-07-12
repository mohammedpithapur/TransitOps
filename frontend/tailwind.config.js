/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: 'var(--color-primary)', hover: 'var(--color-primary-hover)' },
        accent:  { DEFAULT: 'var(--color-accent)' },
        danger:  'var(--color-danger)',
        warn:    'var(--color-warn)',
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'sans-serif'],
        mono:    ['Fira Code', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
}
