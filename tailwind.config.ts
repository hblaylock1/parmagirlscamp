import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f7ff",
          100: "#e0efff",
          500: "#1e6ee8",
          600: "#1855c4",
          700: "#14449c",
        },
        gold: {
          50: "#fdf8e9",
          100: "#faeec3",
          300: "#e9cd6e",
          400: "#dab838",
          500: "#c6a323",
          600: "#a3841a",
          700: "#7d6414",
        },
      },
      fontFamily: {
        display: ["var(--font-display)"],
        script: ["var(--font-script)"],
      },
    },
  },
  plugins: [],
};
export default config;
