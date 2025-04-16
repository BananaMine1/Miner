/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./pages/**/*.{js,ts,jsx,tsx}",
      "./components/**/*.{js,ts,jsx,tsx}"
    ],
    theme: {
      extend: {
        colors: {
          jungleGreen: "#1B5E20", // deep jungle green
          bananaYellow: "#FFD600",
          offWhite: "#F1F1F1"
        }
      },
    },
    plugins: [],
  }
  