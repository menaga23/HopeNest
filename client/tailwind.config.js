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
        hn: {
          primary: '#FF6B35',    // warm orange
          secondary: '#FFF3E0',  // soft cream
          accent: '#4CAF50',     // hope green
          dark: '#3E2723',       // warm brown
          white: '#FFFDE7',      // warm white
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['"Poppins"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

