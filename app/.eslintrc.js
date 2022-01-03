module.exports = {
  root: true,
  env: {
    node: true,
    browser: true
  },
  parser: 'vue-eslint-parser',
  plugins: [
    // '@typescript-eslint',
    'html',
    'vue'
  ],
  extends: [
    'standard-with-typescript'
  ],
  rules: {
    'no-irregular-whitespace': 'off',
    '@typescript-eslint/method-signature-style': 'off',
    '@typescript-eslint/restrict-template-expressions': 'off',
    '@typescript-eslint/prefer-optional-chain': 'off',
    '@typescript-eslint/no-base-to-string': 'off',
    '@typescript-eslint/return-await': 'off',
    '@typescript-eslint/no-dynamic-delete': 'off',
    '@typescript-eslint/prefer-nullish-coalescing': 'off',
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/strict-boolean-expressions': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/promise-function-async': 'off',
    '@typescript-eslint/no-misused-promises': 'off',
    '@typescript-eslint/no-this-alias': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-namespace': 'off',
    'standard/no-callback-literal': 'off'
  },
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 2019,
    sourceType: 'module',
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
    extraFileExtensions: ['.vue'],
    createDefaultProgram: true
  },
  globals: {
    __non_webpack_require__: false,
    MISHIRO_DEV_SERVER_PORT: false
  }
}
