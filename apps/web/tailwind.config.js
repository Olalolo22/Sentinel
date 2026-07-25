/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: "#070a12",
          panel: "#0d1320",
          border: "#1e293b",
        },
      },
    },
  },
  plugins: [],
}
