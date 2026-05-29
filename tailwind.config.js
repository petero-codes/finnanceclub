/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // or 'media' if relying on system preference, but we'll manually toggle class 'dark' on html
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: '#185FA5',
        income: '#1D9E75',
        expense: '#D85A30',
        page: {
          light: '#F4F6F9',
          dark: '#0F1117',
        },
        card: {
          light: '#FFFFFF',
          dark: '#1A1D27',
        },
        text: {
          primary: '#111827',
          secondary: '#6B7280',
          tertiary: '#9CA3AF',
        },
        border: {
          light: 'rgba(0,0,0,0.08)',
          dark: 'rgba(255,255,255,0.08)',
        }
      },
    },
  },
  plugins: [],
}
