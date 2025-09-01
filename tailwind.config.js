// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "index.{tsx,jsx,ts,js}",
    "app/**/*.{tsx,jsx,ts,js}",
    "components/**/*.{tsx,jsx,ts,js}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        questrial: ["Questrial"], // tên phải trùng với key trong useFonts
        calsans: ["CalSans"],
      },
    },
  },
  plugins: [],
};
