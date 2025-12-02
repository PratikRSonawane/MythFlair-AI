/** @type {import('postcss-load-config').Config} */
export default {
  plugins: {
    "@tailwindcss/postcss": {}, // 👈 this is the new Tailwind PostCSS plugin
    autoprefixer: {},
  },
};
