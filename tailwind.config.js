/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#050505', // Deep Black
        surface: '#121212',    // Dark Surface
        'card-light': '#E3E5E0', // Pale Sage/Cream Accent
        primary: '#6EE7B7',    // Soft Mint Green
        secondary: '#10B981',  // Deeper Green
        border: '#27272a',     // Zinc-800
        muted: '#71717a',      // Zinc-500
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
