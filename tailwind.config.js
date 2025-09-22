/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Instrument Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#faf8f5',
          100: '#f5f1eb',
          200: '#e8ddd0',
          300: '#d4c4b0',
          400: '#b8a088',
          500: '#9c7c60',
          600: '#70645e',
          700: '#5a4f4a',
          800: '#4a403c',
          900: '#3d3430',
        },
        warm: {
          50: '#faf8f5',
          100: '#f5f1eb',
          200: '#e8ddd0',
          300: '#d4c4b0',
          400: '#b8a088',
        }
      }
    },
  },
  plugins: [],
}
