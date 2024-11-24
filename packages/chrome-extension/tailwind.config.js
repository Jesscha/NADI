/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,tsx}", "./*.{html,js,tsx}"],
  theme: {
    extend: {
      animation: {
        bounce: "bounce 0.3s ease",
        blink: "blink 1.5s ease-in-out infinite",
        waterDrop: "waterDrop 0.5s ease-out",
        ripple: "ripple 1s ease-in-out",
        wave: "wave 5s infinite linear",
        twinkle: "twinkle 2s ease-in-out 1",
        fadeIn: "fadeIn 1s ease-in-out",
        fadeOut: "fadeOut 1s ease-in-out",
        shake: "shake 0.5s ease-in-out",
      },
      keyframes: {
        bounce: {
          "0%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(0.5px)" },
          "100%": { transform: "translateY(0)" },
        },
        blink: {
          "0%, 100%": { color: "black" },
          "50%": { color: "transparent" },
        },
        waterDrop: {
          "0%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.5)", opacity: "0.5" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        ripple: {
          "0%": { transform: "scale(0.9)", opacity: "0.7" },
          "50%": { transform: "scale(1.1)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "0.7" },
        },
        wave: {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "100% 50%" },
        },
        twinkle: {
          "0%": { opacity: "0.2" },
          "50%": { opacity: "1" },
          "100%": { opacity: "0.2" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeOut: {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        shake: {
          "0%": { transform: "translateY(0)" },
          "25%": { transform: "translateY(-5px)" },
          "50%": { transform: "translateY(5px)" },
          "75%": { transform: "translateY(-5px)" },
          "100%": { transform: "translateY(0)" },
        },
      },
    },
  },
};
