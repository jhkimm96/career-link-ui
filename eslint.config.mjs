import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const eslintPluginTs = await import("@typescript-eslint/eslint-plugin");
const tsParser = await import("@typescript-eslint/parser");

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
});

export default [
    ...compat.extends(
        "next/core-web-vitals",
        "plugin:@typescript-eslint/recommended",
        "prettier"
    ),
    {
        files: ["**/*.{ts,tsx}"],
        languageOptions: {
            parser: tsParser.default,
            parserOptions: {
                ecmaVersion: "latest",
                sourceType: "module",
            },
        },
        plugins: {
            "@typescript-eslint": eslintPluginTs.default, // ✅ 여기서 default 꼭 써야 함
        },
        rules: {
            "@typescript-eslint/no-unsafe-assignment": "off",
            "@typescript-eslint/no-unsafe-member-access": "off",
            "@typescript-eslint/no-unsafe-call": "off",
            "no-console": "warn",
            "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
            "react/react-in-jsx-scope": "off",
            "@typescript-eslint/explicit-function-return-type": "off",
            "@typescript-eslint/explicit-module-boundary-types": "off",
            "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-non-null-assertion": "off",
        },
    },
];
