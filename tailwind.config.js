/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-blue': '#3b82f6',
        'primary-green': '#16a34a',
        'primary-red': '#dc2626'
      },
      container: {
        center: true,
        padding: '1rem',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}