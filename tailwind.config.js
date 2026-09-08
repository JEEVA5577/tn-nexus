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
        nexus: {
          950: '#040711',
          900: '#080d1a',
          850: '#0d1527',
          800: '#131e36',
          700: '#1d2c4d',
          600: '#2b3f6c',
          500: '#3e5894',
          accent: '#06b6d4',      // Cyan / Civic Blue
          accentGlow: '#22d3ee',
          success: '#10b981',     // Emerald
          warning: '#f59e0b',     // Amber
          danger: '#ef4444',      // Rose Red
          tnGold: '#eab308',      // Tamil Nadu civic gold
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'nexus-glow': '0 0 20px -3px rgba(6, 182, 212, 0.25)',
        'nexus-card': '0 8px 32px 0 rgba(0, 0, 0, 0.45)',
      }
    },
  },
  plugins: [],
}
