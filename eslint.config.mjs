import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      "no-restricted-syntax": [
        "warn",
        {
          "selector": "JSXAttribute[name.name='className'] Literal[value=/bg-\\[#.*\\]/]",
          "message": "Do not use hardcoded hex colors in backgrounds. Use theme tokens."
        },
        {
          "selector": "JSXAttribute[name.name='className'] Literal[value=/text-\\[#.*\\]/]",
          "message": "Do not use hardcoded hex colors in text. Use theme tokens."
        }
      ]
    }
  }
]);

export default eslintConfig;
