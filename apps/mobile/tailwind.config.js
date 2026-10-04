/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#10b981", // Emerald 500
          dark: "#059669",
          light: "#34d399",
        },
        accent: {
          blue: "#2563eb", // Cobalt Blue
          teal: "#0d9488",
          amber: "#f59e0b",
          rose: "#f43f5e",
          purple: "#9333ea",
        },
        surface: {
          DEFAULT: "#ffffff",
          elevated: "#f8fafc",
          subtle: "#f1f5f9",
          dark: "#090d16",
          darkElevated: "#0f172a",
          darkSubtle: "#1e293b",
        },
      },
    },
  },
  plugins: [],
};
