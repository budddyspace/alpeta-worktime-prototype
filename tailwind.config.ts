import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-nanum)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        alpeta: {
          blue: "#0B5BD3",
          blue2: "#0A4EC0",
        },
      },
      boxShadow: {
        card: "0 1px 2px rgba(16,24,40,0.06), 0 1px 3px rgba(16,24,40,0.10)",
      },
    },
  },
  plugins: [],
};
export default config;
