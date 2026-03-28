/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        border: "rgba(0,139,139,0.10)",
        input: "rgba(0,139,139,0.20)",
        ring: "#0a9b8c",
        background: "#f0f4f8",
        foreground: "#0d2333",
        primary: {
          DEFAULT: "#0a9b8c",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#f5f8fb",
          foreground: "#0d2333",
        },
        accent: {
          DEFAULT: "#07b5a2",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "#f5f8fb",
          foreground: "#8fa8c0",
        },
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#ffffff",
        },
        card: {
          DEFAULT: "#ffffff",
          foreground: "#0d2333",
        },
      },
      borderRadius: {
        lg: "0.875rem",
        md: "0.5rem",
        sm: "0.375rem",
      },
      boxShadow: {
        warm: "0 4px 24px rgba(10,155,140,0.10)",
      },
    },
  },
  plugins: [],
};
