// @ts-check

/** @type {import("@ianvs/prettier-plugin-sort-imports").PrettierConfig} */
module.exports = {
  // Standard prettier options
  // printWidth: 100,
  // semi: false,
  // singleQuote: false,
  // trailingComma: "all",
  // Since prettier 3.0, manually specifying plugins is required
  plugins: ["@ianvs/prettier-plugin-sort-imports"],
  // This plugin's options
  importOrder: [
    "^react(-native)?$",
    "",
    "<THIRD_PARTY_MODULES>",
    "",
    "^(@)(/.*)$",
    "",
    "^[.]",
  ],
  importOrderParserPlugins: ["typescript", "jsx", "decorators-legacy"],
  importOrderTypeScriptVersion: "5.0.0",
};
