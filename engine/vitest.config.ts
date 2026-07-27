import { defineConfig } from "vitest/config";

// import { storybookTest } from '@storybook/experimental-addon-test/vitest-plugin'

export default defineConfig({
  root: ".",
  plugins: [],
  test: {
    globals: true,
    environment: "node",
    exclude: ["node_modules/**"],

    passWithNoTests: true,
  },
});
