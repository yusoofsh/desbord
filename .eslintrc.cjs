const { resolve } = require("node:path");

const project = resolve(__dirname, "tsconfig.json");

/** @type {import('@types/eslint').Linter.Config} */
const eslintConfig = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: { project },
  extends: [
    ...[
      "@vercel/style-guide/eslint/browser",
      "@vercel/style-guide/eslint/node",
      "@vercel/style-guide/eslint/typescript",
      "@vercel/style-guide/eslint/react",
      "@vercel/style-guide/eslint/next",
    ].map(require.resolve),
  ],
  settings: {
    "import/resolver": { typescript: { project } },
    /**
     * enable components to be checked
     * @see {@link https://github.com/jsx-eslint/eslint-plugin-jsx-a11y?tab=readme-ov-file#configurations}
     */
    "jsx-a11y": {
      polymorphicPropName: "component",
      components: {
        Article: "article",
        Button: "button",
        Icon: "svg",
        Image: "img",
        Input: "input",
        Link: "a",
        List: "ul",
        ListDivider: "li",
        ListItem: "li",
        SvgIcon: "svg",
        Textarea: "textarea",
        Video: "video",
      },
    },
  },
  rules: {
    "@typescript-eslint/no-shadow": "off",
    "@typescript-eslint/no-unused-vars": "warn",
    "@typescript-eslint/consistent-type-imports": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-confusing-void-expression": [
      "error",
      { ignoreArrowShorthand: true },
    ],
    "@typescript-eslint/no-restricted-imports": [
      "error",
      {
        "patterns": [".", "!./*", "!../*"],
      },
    ],
    // such that @/* imports will not be considered as external dependencies
    "react/function-component-definition": [
      "warn",
      {
        namedComponents: "arrow-function",
        unnamedComponents: "arrow-function",
      },
    ],
    "import/no-default-export": "off",
    // sort import statements
    "import/order": [
      "warn",
      {
        "newlines-between": "always",
        "pathGroups": [
          {
            pattern: "@/**",
            group: "internal",
            position: "after",
          },
        ],
      },
    ],
    // sort named imports within an import statement
    "sort-imports": ["warn", { ignoreDeclarationSort: true }],
    "quote-props": ["warn", "consistent"],
  },
};
module.exports = eslintConfig;
