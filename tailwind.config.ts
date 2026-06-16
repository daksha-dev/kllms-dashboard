import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        beige: {
          50: "#FBF6EE",
          100: "#F4ECDD",
          200: "#EADFC6",
          300: "#DCC9A4",
        },
        ink: {
          900: "#0E0E0E",
          800: "#1A1A1A",
          700: "#2A2A2A",
        },
        pink: {
          50: "#FFF1F4",
          100: "#FFD8E0",
          200: "#FFB1C2",
          300: "#FF8AA1",
          400: "#F8617D",
          500: "#E63E63",
        },
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "Inter", "sans-serif"],
        display: ["ui-serif", "Georgia", "serif"],
      },
      boxShadow: {
        soft: "0 6px 24px -8px rgba(0,0,0,0.15)",
        glow: "0 0 0 4px rgba(248,97,125,0.18)",
      },
    },
  },
  plugins: [],
};
export default config;
