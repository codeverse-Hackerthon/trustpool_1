/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef6ff',
          100: '#d9ebff',
          200: '#bcddfe',
          300: '#8ec8fc',
          400: '#58aafa',
          500: '#328cf5',
          600: '#1d6fe9',
          700: '#1658d5',
          800: '#1747ad',
          900: '#193e88',
          950: '#142754',
        },
      },
    },
  },
  plugins: [],
}
