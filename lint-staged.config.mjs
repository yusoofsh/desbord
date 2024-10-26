import { relative } from "path"

const buildEslintCommand = (filenames) =>
  `next lint --fix --file ${filenames
    .map((f) => relative(process.cwd(), f))
    .join(" --file ")}`

const buildPrettierCommand = (filenames) =>
  `prettier --ignore-unknown --write ${filenames.join(" ")}`

const lintStagedConfig = {
  // Lint & prettify TS and JS files
  "**/*.(js|jsx|cjs|mjs|ts|tsx)": (filenames) => [
    buildEslintCommand(filenames),
    buildPrettierCommand(filenames),
  ],
  // Prettify CSS, Markdown, and JSON files
  "**/*.(css|md|mdx|json)": buildPrettierCommand,
}
export default lintStagedConfig
