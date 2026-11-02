import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      xs: "360px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
      "3xl": "1920px",
      "4xl": "2560px",
      short: { raw: "(max-height: 520px)" },
      landscape: { raw: "(orientation: landscape)" },
    },
    extend: {
      colors: {
        background: "#0A0A0D",
        card: {
          DEFAULT: "rgba(18, 18, 24, 0.75)",
          hover: "rgba(24, 24, 32, 0.85)",
          border: "rgba(255, 255, 255, 0.08)",
        },
        brand: {
          50: "#FFF7ED",
          100: "#FFEDD5",
          200: "#FED7AA",
          300: "#FDBA74",
          400: "#FB923C",
          500: "#FF7A1A",
          600: "#EA580C",
          700: "#C2410C",
          DEFAULT: "#FF7A1A",
          glow: "rgba(255, 122, 26, 0.25)",
        },
      },
      boxShadow: {
        "orange-glow": "0 0 25px -5px rgba(255, 122, 26, 0.35)",
        "orange-glow-lg": "0 0 50px -10px rgba(255, 122, 26, 0.45)",
        "glass": "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
      },
      animation: {
        "pulse-subtle": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "shimmer": "shimmer 2s infinite linear",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      minHeight: {
        "touch": "44px",
        "dvh": "100dvh",
      },
      minWidth: {
        "touch": "44px",
      },
    },
  },
  plugins: [],
};

export default config;
