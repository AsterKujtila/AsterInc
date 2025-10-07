/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'aster': '#6E56F8',
        'dark-bg': '#121212',
        'dark-surface': '#1E1E1E',
        'dark-border': '#333333',
        'success': '#00D4AA',
        'danger': '#FF3B30',
      },
      fontFamily: {
        'mono': ['JetBrains Mono', 'Monaco', 'Cascadia Code', 'Segoe UI Mono', 'Roboto Mono', 'Oxygen Mono', 'Ubuntu Monospace', 'Source Code Pro', 'Fira Mono', 'Droid Sans Mono', 'Courier New', 'monospace'],
      },
    },
  },
  plugins: [],
}