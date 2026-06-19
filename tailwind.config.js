/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1.5rem",
        lg: "2rem",
      },
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        heading: ["Outfit", "sans-serif"],
        sans: ["Inter", "sans-serif"],
      },
      fontSize: {
        xxs: ["0.75rem", { lineHeight: "1.125rem" }], // 12px — WCAG minimum for UI labels
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // PROFESSIONAL COLOR PALETTE
        navy: {
          DEFAULT: "hsl(var(--navy-dark))",
          dark: "hsl(var(--navy-dark))",
          light: "#1E293B",
        },
        teal: {
          DEFAULT: "hsl(var(--teal-primary))",
          light: "hsl(var(--teal-light))",
          dark: "#0F766E",
        },
        "teal-primary": "hsl(var(--teal-primary))",
        "teal-light": "hsl(var(--teal-light))",
        "royal-blue": {
          DEFAULT: "hsl(var(--primary))",
          light: "hsl(199, 89%, 48%)",
        },
        gold: {
          DEFAULT: "#F59E0B",
          light: "#FEF3C7",
        },
        "sky-blue": "#0EA5E9",
        "success-green": "#10B981",
        "page-bg": "hsl(var(--background))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "text-gradient": {
          "0%": { backgroundPosition: "0% center" },
          "100%": { backgroundPosition: "200% center" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "text-gradient": "text-gradient 3s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
