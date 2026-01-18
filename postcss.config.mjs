const config = {
  plugins: ["@tailwindcss/postcss"],
};

export default config;

module.exports = {
  plugins: {
    'postcss-color-functional-notation': {}, // Convierte lab() a rgb/hsl
    tailwindcss: {},
    autoprefixer: {},
  },
}
