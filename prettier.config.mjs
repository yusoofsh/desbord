/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').PluginOptions} */
const prettierConfig = {
  semi: false,
  singleQuote: false,
  quoteProps: "preserve",
  plugins: ["prettier-plugin-tailwindcss"],
}
export default prettierConfig
