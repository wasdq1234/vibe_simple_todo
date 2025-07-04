import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          green: "#4CAF50",
          DEFAULT: "#4CAF50",
        },
        action: {
          blue: "#2196F3",
          DEFAULT: "#2196F3",
        },
        warning: {
          orange: "#FF9800",
          DEFAULT: "#FF9800",
        },
        custom: {
          background: "#F5F5F5",
          text: "#333333",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;