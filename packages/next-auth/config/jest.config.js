const swcConfig = require("./swc.config")

/** @type {import('jest').Config} */
module.exports = {
  projects: [
    {
      displayName: "core",
      testMatch: ["<rootDir>/tests/**/*.test.ts"],
      rootDir: ".",
      transform: {
        "\\.(js|jsx|ts|tsx)$": ["@swc/jest", swcConfig],
      },
      coveragePathIgnorePatterns: ["tests"],
      testEnvironment: "@edge-runtime/jest-environment",
      transformIgnorePatterns: ["node_modules/(?!uuid)/"],
      /** @type {import("@edge-runtime/vm").EdgeVMOptions} */
      testEnvironmentOptions: {
        codeGeneration: {
          strings: true,
        },
      },
    },
  ],
  watchPlugins: [
    "jest-watch-typeahead/filename",
    "jest-watch-typeahead/testname",
  ],
  collectCoverage: true,
  coverageDirectory: "../coverage",
  coverageReporters: ["html", "text-summary"],
  collectCoverageFrom: ["src/**/*.(js|jsx|ts|tsx)"],
}
