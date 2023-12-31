const eslintCommand = (filenames) =>
  `eslint --quiet --fix ${filenames.join(" ")}`;
const prettierCommand = (filenames) =>
  `prettier --ignore-unknown --write ${filenames.join(" ")}`;

/** @type {import('@types/lint-staged').Config} */
const lintStagedConfig = {
  // Lint & prettify TS and JS files
  "**/*.(ts|tsx|js|cjs)": (filenames) => [
    eslintCommand(filenames),
    prettierCommand(filenames),
  ],
  // Prettify CSS, Markdown, and JSON files
  "**/*.(css|md|json)": prettierCommand,
};
module.exports = lintStagedConfig;
