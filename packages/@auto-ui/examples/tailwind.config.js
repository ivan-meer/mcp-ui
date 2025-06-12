/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    // Path to the components package files:
    "../components/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Can also extend with theme values from @auto-ui/themes here
    },
  },
  plugins: [],
};
