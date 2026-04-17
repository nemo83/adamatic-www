/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./design/**/*.{ts,tsx}",
    "./pages/design/**/*.{ts,tsx}",
  ],
  // Preflight disabled so Tailwind's global resets don't touch the live
  // Hosky + Mesh flow. We apply our own resets inside .ledger-root via globals.css.
  corePlugins: { preflight: false },
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: "#0F0E0B", soft: "#1F1D18" },
        paper: { DEFAULT: "#F4EEE4", raised: "#E8DFD1" },
        rule: "rgba(15, 14, 11, 0.22)",
        marginalia: "rgba(15, 14, 11, 0.65)",
        amber: { DEFAULT: "#C44A1A", ink: "#7A2A0F", soft: "#F0C9B4" },
        jade: { DEFAULT: "#2F6B4A", soft: "#CFE0D6" },
        rust: { DEFAULT: "#8B2C1C", soft: "#EFD0C9" },
      },
      fontFamily: {
        display: ['"Fraunces"', 'Georgia', 'serif'],
        body: ['"Mona Sans"', '"Söhne"', '"Helvetica Neue"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      fontSize: {
        mark: ["11px", { lineHeight: "1", letterSpacing: "0.14em" }],
      },
      borderRadius: {
        sharp: "2px",
        card: "8px",
      },
      boxShadow: {
        dialog:
          "0 40px 80px -20px rgba(15, 14, 11, 0.18), 0 8px 24px -8px rgba(15, 14, 11, 0.10)",
        pressed: "inset 0 -2px 0 rgba(0,0,0,0.25)",
      },
      transitionTimingFunction: {
        quill: "cubic-bezier(0.2, 0.65, 0.2, 1)",
      },
      keyframes: {
        "rule-in": {
          from: { transform: "scaleX(0)" },
          to: { transform: "scaleX(1)" },
        },
        "stagger-in": {
          from: { opacity: 0, transform: "translateY(6px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        "slide-right": {
          from: { opacity: 0, transform: "translateX(12px)" },
          to: { opacity: 1, transform: "translateX(0)" },
        },
        "fade-up": {
          from: { opacity: 0, transform: "translateY(4px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
      },
      animation: {
        "rule-in": "rule-in 360ms cubic-bezier(0.2, 0.65, 0.2, 1) both",
        "stagger-in": "stagger-in 240ms cubic-bezier(0.2, 0.65, 0.2, 1) both",
        "slide-right": "slide-right 200ms cubic-bezier(0.2, 0.65, 0.2, 1) both",
        "fade-up": "fade-up 200ms cubic-bezier(0.2, 0.65, 0.2, 1) both",
      },
    },
  },
  plugins: [],
};
