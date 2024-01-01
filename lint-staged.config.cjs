/** @type {import('@types/lint-staged').Config} */
const lintStagedConfig = {
  // Lint & prettify TS and JS files
  "**/*.(ts|tsx|js|cjs|css|md|json)": (filenames) => [
    `biome check ${filenames.join(" ")}`,
  ],
};
module.exports = lintStagedConfig;
