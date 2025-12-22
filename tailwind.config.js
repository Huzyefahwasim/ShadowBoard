/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0A0A0C', // Deepest Charcoal
        surface: '#16161A',    // Application Surface
        border: '#2D2D35',     // Thin Borders
        cfo: '#FFB800',     // Cyber Amber
        cmo: '#FF007A',     // Electric Rose
        policy: '#00F0FF',  // Neon Cyan
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
