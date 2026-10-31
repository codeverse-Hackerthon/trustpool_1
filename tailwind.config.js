/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        navy: {
          DEFAULT: '#14213D',
          light: '#1d2f56',
          dark: '#0c1527',
        },
        primaryBlue: {
          DEFAULT: '#2563EB',
          hover: '#1d4ed8',
          light: '#3B82F6',
          soft: '#EFF6FF',
        },
        secondaryBlue: '#3B82F6',
        softBlue: '#EFF6FF',
        mainBg: '#F8FAFC',
        cardBg: '#FFFFFF',
        status: {
          success: '#16A34A',
          warning: '#F59E0B',
          danger: '#DC2626',
          info: '#2563EB',
        },
        border: {
          DEFAULT: '#E2E8F0',
          subtle: '#F1F5F9',
        },
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
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        card: '0 2px 8px -2px rgba(15, 23, 42, 0.06), 0 1px 4px -1px rgba(15, 23, 42, 0.04)',
        cardHover: '0 8px 24px -4px rgba(15, 23, 42, 0.08), 0 2px 6px -2px rgba(15, 23, 42, 0.04)',
      },
      borderRadius: {
        xl: '12px',
        '2xl': '16px',
      },
    },
  },
  plugins: [],
}
