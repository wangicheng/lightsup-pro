/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // 你可以在這裡擴充自定義顏色或動畫
      boxShadow: {
        'glow': '0 0 15px #ffd700', // 自定義光暈效果
        'inner-dark': 'inset 0 0 5px #000',
      }
    },
  },
  plugins: [],
}