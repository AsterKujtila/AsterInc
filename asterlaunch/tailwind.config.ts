import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#121212",
        "background-secondary": "#1a1a1a",
        "background-tertiary": "#252525",
        "aster-primary": "#6E56F8",
        "aster-secondary": "#8b75ff",
        "pump-green": "#00ff88",
        "dump-red": "#ff4444",
        "text-primary": "#ffffff",
        "text-secondary": "#a0a0a0",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;