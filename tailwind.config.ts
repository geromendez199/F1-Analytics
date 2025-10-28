import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";
import tailwindAnimate from "tailwindcss-animate";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["'InterVariable'", ...defaultTheme.fontFamily.sans]
      },
      colors: {
        ferrari: "#dc0000",
        mercedes: "#00d2be",
        mclaren: "#ff8700"
      }
    }
  },
  plugins: [tailwindAnimate, typography]
};

export default config;
