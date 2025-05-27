/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'midnight': ['Midnight Flame Gothic', 'cursive'],
      },
    },
  },
  plugins: [],
}