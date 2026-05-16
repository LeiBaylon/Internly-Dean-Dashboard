import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#f7f7f8",
        "ink-soft": "#d7d8df",
        "surface": "#141519",
        "surface-strong": "#1a1b20",
        "stroke": "#2b2d34",
        "primary": "#12c993",
        "primary-soft": "#15392f",
        "accent": "#36e0ad",
        "accent-2": "#38bdf8",
        "accent-3": "#f6b91a",
        "success": "#34d399",
        "warning": "#f6b91a",
        "info": "#60a5fa",
        "neutral": "#8b8d98",
      },
      boxShadow: {
        soft: "0 18px 40px rgba(3, 197, 142, 0.18)",
      },
      borderRadius: {
        xl: "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
