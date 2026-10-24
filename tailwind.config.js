/** @type {import('tailwindcss').Config} */
module.exports = {
  // Brand tokens (colors, type, spacing, radii) come from the Sebiche Celeste kit.
  presets: [require('./brand/tokens/tailwind.preset.cjs')],
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};
