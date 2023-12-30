const project = "tsconfig.json";

/** @type {import('@types/eslint').Linter.Config} */
const eslintConfig = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: { project },
  extends: [
    ...[
      "@vercel/style-guide/eslint/browser",
      "@vercel/style-guide/eslint/node",
      "@vercel/style-guide/eslint/react",
      "@vercel/style-guide/eslint/next",
      "@vercel/style-guide/eslint/typescript",
    ].map(require.resolve),
  ],
  rules: {
    "@typescript-eslint/no-shadow": "off",
    "@typescript-eslint/consistent-type-imports": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-confusing-void-expression": [
      "error",
      { ignoreArrowShorthand: true },
    ],
    // such that @/* imports will not be considered as external dependencies
    "react/function-component-definition": [
      "warn",
      {
        namedComponents: "arrow-function",
        unnamedComponents: "arrow-function",
      },
    ],
    // sort import statements
    "import/order": [
      "warn",
      {
        groups: [
          "builtin",
          "external",
          "internal",
          "parent",
          "sibling",
          "index",
        ],
        "newlines-between": "always",
        alphabetize: { order: "asc" },
      },
    ],
    // sort named imports within an import statement
    "sort-imports": ["warn", { ignoreDeclarationSort: true }],
  },
  overrides: [
    // Next.js App Router file convention
    // Must use default export
    {
      files: [
        "app/**/page.tsx",
        "app/**/loading.tsx",
        "app/**/layout.tsx",
        "app/**/not-found.tsx",
        "app/**/*error.tsx",
        "app/sitemap.ts",
        "app/robots.ts",
      ],
      rules: {
        "import/no-default-export": "off",
        "import/prefer-default-export": ["error", { target: "any" }],
      },
    },
    // module declarations
    {
      files: ["**/*.d.ts"],
      rules: { "import/no-default-export": "off" },
    },
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
        Button: "button",
        Icon: "svg",
        Image: "img",
        Input: "input",
        Link: "a",
        List: "ul",
        ListItem: "li",
        ListDivider: "li",
        NextImage: "img",
        NextLink: "a",
        SvgIcon: "svg",
        Textarea: "textarea",
      },
    },
  },
};
module.exports = eslintConfig;
