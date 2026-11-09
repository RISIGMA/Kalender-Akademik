/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        campus: {
          navy: '#1E3A8A',
          blue: '#2563EB',
          dark: '#0F172A',
          surface: '#F8FAFC',
          card: '#FFFFFF',
          green: '#15803D',
          amber: '#B45309',
          crimson: '#B91C1C'
        }
      }
    },
  },
  plugins: [],
}
