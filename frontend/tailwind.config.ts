import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#07111F",
        accent: "#5EEAD4",
        textMain: "#F8FAFC",
        textMuted: "#94A3B8",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(94, 234, 212, 0.25), 0 24px 60px rgba(94, 234, 212, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
