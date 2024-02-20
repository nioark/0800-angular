/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{html,ts}",
    "./node_modules/flowbite/**/*.js" // add this line
  ],
  theme: {
    extend: {
      fontFamily : {
        'sans': ['"Poppins"', ...defaultTheme.fontFamily.sans],
      }
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require('flowbite/plugin'),
    require('@tailwindcss/typography')
  ],
}

