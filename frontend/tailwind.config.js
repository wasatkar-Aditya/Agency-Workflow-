/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        border: "var(--border, #30353D)",
        input: "var(--surface, #1A1D21)",
        ring: "#FF7A00",
        background: "var(--background, #101214)",
        foreground: "var(--text-primary, #F5F7FA)",
        primary: {
          DEFAULT: "#FF7A00",
          hover: "#FF8F2B",
          soft: "rgba(255, 122, 0, 0.14)",
          foreground: "#FFFFFF",
        },
        surface: {
          DEFAULT: "#1A1D21",
          elevated: "#20242A",
          hover: "#282D34",
          sidebar: "#151719",
        },
        secondary: {
          DEFAULT: "#20242A",
          foreground: "#F5F7FA",
        },
        destructive: {
          DEFAULT: "#FF5C5C",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#20242A",
          foreground: "#707985",
        },
        accent: {
          DEFAULT: "#FF7A00",
          foreground: "#FFFFFF",
        },
        popover: {
          DEFAULT: "#1A1D21",
          foreground: "#F5F7FA",
        },
        card: {
          DEFAULT: "#1A1D21",
          foreground: "#F5F7FA",
        },
        success: {
          DEFAULT: "#35D07F",
          foreground: "#FFFFFF",
        },
        warning: {
          DEFAULT: "#F5B942",
          foreground: "#101214",
        },
        // Agency Graphite + Orange palette
        agency: {
          orange: "#FF7A00",
          orangeHover: "#FF8F2B",
          dark: "#101214",
          sidebar: "#151719",
          surface: "#1A1D21",
          elevated: "#20242A",
          border: "#30353D",
          textPrimary: "#F5F7FA",
          textSecondary: "#A6ADB8",
          textMuted: "#707985",
        },
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.375rem",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        "pulse-dot": {
          "0%, 100%": { opacity: 1, transform: "scale(1)" },
          "50%": { opacity: 0.6, transform: "scale(0.85)" },
        },
        "slide-up": {
          from: { opacity: 0, transform: "translateY(8px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 8px rgba(6, 182, 212, 0.3)" },
          "50%": { boxShadow: "0 0 20px rgba(6, 182, 212, 0.5)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-dot": "pulse-dot 2s ease infinite",
        "slide-up": "slide-up 0.3s ease forwards",
        "fade-in": "fade-in 0.2s ease forwards",
        shimmer: "shimmer 2s linear infinite",
        "glow-pulse": "glow-pulse 2s ease infinite",
      },
      boxShadow: {
        glass: "0 4px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.04)",
        card: "0 2px 16px rgba(0, 0, 0, 0.3)",
        glow: "0 0 20px rgba(6, 182, 212, 0.3)",
        "glow-sm": "0 0 8px rgba(6, 182, 212, 0.2)",
      },
    },
  },
  plugins: [],
}
