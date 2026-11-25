import { defineConfig } from "vite-plus";

// Rendered decks and test output are never formatted or linted.
const GENERATED = [
  ".quarto/**",
  "example.html",
  "example_files/**",
  "test-results/**",
  "playwright-report/**",
];

export default defineConfig({
  fmt: {
    printWidth: 80,
    // One entry per line with a trailing comma, so additions and removals
    // touch a single line.
    trailingComma: "all",
    objectWrap: "preserve",
    singleAttributePerLine: true,
    sortImports: {},
    // rumdl owns Markdown.
    ignorePatterns: [...GENERATED, "**/*.md", "pnpm-lock.yaml"],
  },
  lint: {
    plugins: [
      "eslint",
      "typescript",
      "unicorn",
      "oxc",
      "import",
      "jsdoc",
      "promise",
    ],
    categories: {
      correctness: "error",
      suspicious: "error",
      perf: "error",
    },
    env: {
      browser: true,
      builtin: true,
    },
    ignorePatterns: GENERATED,
    options: {
      typeAware: true,
      typeCheck: true,
      reportUnusedDisableDirectives: "error",
    },
    overrides: [
      {
        // Playwright tests and tool configs run in Node.
        files: ["tests/**", "*.config.{js,ts}"],
        env: {
          node: true,
        },
      },
    ],
  },
});
