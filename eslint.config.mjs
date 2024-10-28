import { dirname } from "path"
import { fileURLToPath } from "url"
import js from "@eslint/js"
import { FlatCompat } from "@eslint/eslintrc"
import nextOnPages from "eslint-plugin-next-on-pages"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
})

/** @type {import('eslint').Linter.Config[]} */
const eslintConfig = [
  ...compat.extends(
    "next/core-web-vitals",
    "next/typescript",
    "plugin:eslint-plugin-next-on-pages/recommended",
    "prettier",
  ),
  {
    plugins: {
      "next-on-pages": nextOnPages,
    },
  },
]
export default eslintConfig
