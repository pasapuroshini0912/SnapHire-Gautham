/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: "16px",
        md: "14px",
        sm: "12px",
      },
      colors: {
        background: "#ffffff",
        foreground: "#18181b", // zinc-900
        card: {
          DEFAULT: "#18181b", // zinc-900
          foreground: "#fafafa", // zinc-50
        },
        popover: {
          DEFAULT: "#18181b", // zinc-900
          foreground: "#e4e4e7", // zinc-200
        },
        primary: {
          DEFAULT: "#18181b", // zinc-900
          foreground: "#fafafa", // zinc-50
        },
        secondary: {
          DEFAULT: "#27272a", // zinc-800
          foreground: "#e4e4e7", // zinc-200
        },
        muted: {
          DEFAULT: "hsl(0, 0%, 25%)", // Dark gray
          foreground: "hsl(0, 0%, 75%)", // Light gray
        },
        accent: {
          DEFAULT: "hsl(0, 0%, 30%)", // Dark gray
          foreground: "hsl(0, 0%, 90%)", // Light gray
        },
        destructive: {
          DEFAULT: "hsl(0, 84%, 60%)", // Red
          foreground: "#ffffff",
        },
        border: "hsl(0, 0%, 20%)", // Dark gray
        input: "hsl(0, 0%, 15%)", // Dark gray
        ring: "hsl(0, 0%, 30%)", // Gray
        chart: {
          1: "hsl(210, 100%, 50%)", // Blue
          2: "hsl(210, 90%, 60%)", // Lighter blue
          3: "hsl(210, 80%, 70%)", // Even lighter blue
          4: "hsl(210, 70%, 80%)", // Very light blue
          5: "hsl(210, 60%, 90%)", // Extremely light blue
        },
      },
      container: {
        padding: "10px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
