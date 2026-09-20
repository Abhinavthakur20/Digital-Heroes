import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
      },
      colors: {
        // Deep executive Obsidian tones
        obsidian: {
          950: "#080B0E",
          900: "#0F141A",
          850: "#141A22",
          800: "#1C242F",
          700: "#2A3645",
          600: "#3F4E62"
        },
        // Prestige Augusta / British Racing Forest Green
        forest: {
          900: "#063B23",
          800: "#0A4D2E",
          DEFAULT: "#0D5C3A",
          700: "#116C45",
          600: "#188656",
          100: "#E2F4EB",
          50: "#F0F9F4"
        },
        // Championship Trophy Gold / Bronze (Subtle luxury highlights)
        gold: {
          DEFAULT: "#B88E44",
          light: "#FBF7EF",
          border: "#E9DAC0",
          hover: "#A37A33",
          dark: "#7D591B"
        },
        // Core ink & surfaces
        ink: {
          DEFAULT: "#0F172A",
          muted: "#475569",
          subtle: "#94A3B8"
        },
        moss: "#0D5C3A",
        fairway: "#107C41",
        // Swapped out generic vibrant AI orange/coral for Prestige Championship Green
        flag: "#0D5C3A",
        skyglass: "#F4F7F5",
        paper: "#FFFFFF",
        canvas: "#FAFBFC"
      },
      boxShadow: {
        soft: "0 1px 3px rgba(0, 0, 0, 0.04), 0 6px 20px -4px rgba(0, 0, 0, 0.05)",
        card: "0 1px 3px rgba(0, 0, 0, 0.03), 0 12px 32px -4px rgba(15, 23, 42, 0.06)",
        glow: "0 0 24px -4px rgba(13, 92, 58, 0.18)",
        goldGlow: "0 0 24px -4px rgba(184, 142, 68, 0.22)"
      }
    }
  },
  plugins: []
};

export default config;
