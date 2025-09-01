// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "index.{tsx,jsx,ts,js}",
    "app/**/*.{tsx,jsx,ts,js}",
    "components/**/*.{tsx,jsx,ts,js}"
  ],
    presets: [require('nativewind/preset')],
  theme: {
    extend: {
       fontFamily: {
        // Đặt 'sans' làm font mặc định của bạn
        // Tailwind sẽ tự động áp dụng font này cho các text không có class font-* cụ thể
        sans: ['Questrial'],
      },
    },
  },
  plugins: [],
}
