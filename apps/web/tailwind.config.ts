import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./features/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        surface: {
          DEFAULT: "#0f0f0f",
          subtle: "#1a1a1a",
          muted: "#242424",
        },
        border: {
          DEFAULT: "#2e2e2e",
        },
        accent: {
          DEFAULT: "#7c6af7",
          hover: "#6b59e8",
        },
      },
    },
  },
  plugins: [],
}

export default config
