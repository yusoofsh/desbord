const vercelPrettierOptions = require("@vercel/style-guide/prettier");

/** @type {import('prettier').Options} */
const prettierConfig = {
  ...vercelPrettierOptions,
  // your options to override Vercel's options
  "plugins": [...vercelPrettierOptions.plugins.map(require.resolve)],
  "singleQuote": false,
  "quoteProps": "preserve",
};
module.exports = prettierConfig;
