const eslintCommand = (filenames) =>
  `eslint --quiet --fix ${filenames.join(" ")}`;
const prettierCommand = (filenames) =>
  `prettier --ignore-unknown --write ${filenames.join(" ")}`;

/** @type {import('@types/lint-staged').Config} */
const lintStagedConfig = {
  // Sort package.json keys
  "package.json": "sort-package-json",
  // Lint & prettify TS and JS files
  "**/*.(ts|tsx|js)": (filenames) => [
    eslintCommand(filenames),
    prettierCommand(filenames),
  ],
  // Prettify CSS, Markdown, and JSON files
  "**/*.(css|md|json)": prettierCommand,
};
module.exports = lintStagedConfig;
