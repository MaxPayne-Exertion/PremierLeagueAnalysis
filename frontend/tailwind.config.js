/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#0B132B', // Deepest background
          800: '#1C2541', // Card background
          700: '#', // Lighter card/hover
          600: '#3A506B', // Borders / Secondary elements
        },
        gold: {
          600: '#9E8048', // Dark gold (text or borders)
          500: '#C5A065', // MAIN GOLD (Buttons, Highlights)
          400: '#D4AF37', // Brighter Metallic Gold
          300: '#E0C088', // Light Gold (Hover states)
          100: '#F3E5AB', // Very light gold (Background tints)
        },
        bronze: {
          600: '#CD7F32', // Main bronze color
          500: '#D2691E', // Lighter bronze (Buttons)
          400: '#E0A96D', // Light bronze (Hover states)
          300: '#F1CBAA', // Very light bronze (Background tints)
        },
      },
    },
  },
  plugins: [],
}
