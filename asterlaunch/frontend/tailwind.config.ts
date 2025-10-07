import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        bg: '#121212',
        'bg-elev': '#18181B',
        text: '#EDEDED',
        muted: '#A1A1AA',
        aster: '#6E56F8',
        up: '#22C55E',
        down: '#EF4444'
      },
      boxShadow: {
        glow: '0 0 0 3px rgba(110, 86, 248, 0.35)'
      }
    },
  },
  plugins: [],
} satisfies Config
