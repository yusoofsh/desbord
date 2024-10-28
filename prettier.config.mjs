import vercelPrettierConfig from "@vercel/style-guide/prettier"

/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').PluginOptions} */
const prettierConfig = {
  ...vercelPrettierConfig,
  semi: false,
  singleQuote: false,
  quoteProps: "preserve",
  plugins: ["prettier-plugin-tailwindcss"],
}
export default prettierConfig
