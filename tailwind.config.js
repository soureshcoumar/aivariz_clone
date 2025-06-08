// tailwind.config.js
const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: [
    // Ensure all your HTML and JS files where Tailwind classes are used are listed here
    "./*.html",
    "./js/*.js",
    "./header.html",
    "./index.html",
    // Add any other specific HTML or JS files where you use Tailwind classes
  ],
  theme: {
    extend: {
      fontFamily: {
        // Define 'canno' as a custom font family that you can explicitly use
        canno: ['canno', ...defaultTheme.fontFamily.sans],
        // IMPORTANT: The 'sans' key should NOT be overridden here.
        // By leaving 'sans' out, Tailwind will use its default sans-serif stack
        // for any elements that don't have a specific font class applied.
      }
    },
  },
  plugins: [],
}