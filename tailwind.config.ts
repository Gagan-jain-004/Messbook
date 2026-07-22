import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#131313",
        foreground: "#e5e2e1",
        primary: {
          DEFAULT: "#ffffff",
          foreground: "#1a1c1c",
        },
        secondary: {
          DEFAULT: "#10b981",
          foreground: "#002113",
        },
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "#64748b",
          foreground: "#c4c7c8",
        },
        card: {
          DEFAULT: "#0a0a0a",
          foreground: "#e5e2e1",
        },
        border: "#262626",
        surface: {
          container: "#201f1f",
          low: "#1c1b1b",
          high: "#2a2a2a",
        }
      },
      borderRadius: {
        lg: "0.5rem",
        xl: "1rem", // 16px cards
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
    },
  },
  plugins: [],
} satisfies Config;
