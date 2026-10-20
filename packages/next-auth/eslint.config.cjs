const js = require("@eslint/js")
const globals = require("globals")
const tseslint = require("typescript-eslint")

module.exports = tseslint.config(
  {
    files: ["src/**/*.ts", "tests/**/*.ts"],
    extends: [js.configs.recommended, tseslint.configs.recommended],
    linterOptions: { reportUnusedDisableDirectives: "off" },
    languageOptions: {
      globals: { ...globals.node, ...globals.browser, ...globals.jest },
      parserOptions: {
        project: "./tsconfig.eslint.json",
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      "no-empty": ["error", { allowEmptyCatch: true }],
      "prefer-const": "off",
      "@typescript-eslint/ban-ts-comment": [
        "error",
        { "ts-expect-error": false },
      ],
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-empty-object-type": [
        "error",
        { allowInterfaces: "with-single-extends", allowObjectTypes: "always" },
      ],
      "@typescript-eslint/no-unsafe-function-type": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", ignoreRestSiblings: true },
      ],
    },
  },
  {
    files: ["src/**/*.js", "config/**/*.js", "eslint.config.cjs"],
    ...js.configs.recommended,
    languageOptions: {
      globals: { ...globals.node, ...globals.browser, ...globals.jest },
    },
  }
)
