/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // C-Team Global color palette
        primary: {
          50: '#e6f4fc',
          100: '#cce9f9',
          200: '#99d3f3',
          300: '#66bdec',
          400: '#33a7e6',
          500: '#0693e3',  // Main cyan blue from cteamglobal.com
          600: '#0580c9',
          700: '#046caf',
          800: '#035995',
          900: '#02467b',
          950: '#013352',
        },
        accent: {
          50: '#f5ebfc',
          100: '#ebd7f9',
          200: '#d7aff3',
          300: '#c387ed',
          400: '#af5fe7',
          500: '#9b51e0',  // Vivid purple from cteamglobal.com
          600: '#8644c4',
          700: '#7137a8',
          800: '#5c2a8c',
          900: '#471d70',
          950: '#321054',
        },
        cteam: {
          orange: '#ff6900',     // CTA orange
          dark: '#32373c',       // Dark gray for buttons
          gray: '#abb8c3',       // Cyan bluish gray
          black: '#1a1a1a',
          white: '#ffffff',
        }
      }
    },
  },
  plugins: [],
}
