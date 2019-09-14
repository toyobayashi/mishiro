module.exports = {
  root: true,
  env: {
    node: true
  },
  parser: 'vue-eslint-parser',
  plugins: [
    '@typescript-eslint',
    'html',
    'vue',
  ],
  extends: [
    'standard'
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': 'error'
  },
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 2018,
    sourceType: 'module',
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
    extraFileExtensions: ['.vue']
  }
}
