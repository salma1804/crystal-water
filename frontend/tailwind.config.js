/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        mineral: "#F4F9FC",
        mineral2: "#E6F3FA",
        ink: "#0F2B3D",
        teal: "#2E93C4",
        tealDeep: "#123047",
        tealLight: "#6EC8E6",
        aqua: "#DCF0FA",
        gold: "#E8A23C",
        goldLight: "#F5D9A8"
      },
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        sans: ["IBM Plex Sans", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"]
      }
    },
  },
  plugins: [],
};
