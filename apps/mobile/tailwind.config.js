/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")], // <-- A magia da versão 4 está aqui!
  theme: {
    extend: {},
  },
  plugins: [],
}