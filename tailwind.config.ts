import type { Config } from "tailwindcss";

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "sans-serif"],
        serif: ["var(--font-serif)", "serif"],
      },
      colors: {
        navy: "var(--navy-hex)",
        accent: {
          DEFAULT: "var(--accent-hex)",
          s: "var(--accent-s-hex)",
        },
        gd: "var(--gd-hex)",
        grey: {
          mid: "var(--grey-mid-hex)",
          DEFAULT: "var(--grey-hex)",
        },
        gl: "var(--gl-hex)",
        border: "var(--border-hex)",
        bg: "var(--bg-hex)",
        "body-bg": "var(--body-bg-hex)",
        green: {
          DEFAULT: "var(--green-hex)",
          s: "var(--green-s-hex)",
        },
        amber: {
          DEFAULT: "var(--amber-hex)",
          s: "var(--amber-s-hex)",
        },
        red: {
          DEFAULT: "var(--red-hex)",
          s: "var(--red-s-hex)",
        },
        
        // Shadcn mappings
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--bg-hex)",
        foreground: "var(--gd-hex)",
        primary: {
          DEFAULT: "var(--navy-hex)",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "var(--gl-hex)",
          foreground: "var(--gd-hex)",
        },
        destructive: {
          DEFAULT: "var(--red-hex)",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "var(--gl-hex)",
          foreground: "var(--grey-hex)",
        },
        popover: {
          DEFAULT: "var(--bg-hex)",
          foreground: "var(--gd-hex)",
        },
        card: {
          DEFAULT: "var(--bg-hex)",
          foreground: "var(--gd-hex)",
        },
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
