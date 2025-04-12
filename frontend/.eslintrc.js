module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module', // This fixes the 'import' keyword issue
  },
  plugins: ['react'],
  rules: {
    // Add custom rules here
    'react/react-in-jsx-scope': 'off', // Optional: not needed in React 17+
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
