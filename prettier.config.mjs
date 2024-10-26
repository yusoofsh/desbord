import vercelPrettierConfig from "@vercel/style-guide/prettier"

/** @type {import('prettier').Options} */
const prettierConfig = {
  ...vercelPrettierConfig,
  semi: false,
  singleQuote: false,
  quoteProps: "preserve",
}
export default prettierConfig
