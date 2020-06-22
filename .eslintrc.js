module.exports = {
  extends: ['airbnb-typescript'],
  parserOptions: {
    project: './tsconfig.json',
  },
  rules: {
    'react/prop-types': [
      2,
      {
        skipUndeclared: true,
      },
    ],
    'react/jsx-props-no-spreading': 0,
    'react/static-property-placement': 0,
    'import/no-extraneous-dependencies': 1,
    'newline-before-return': 2,
    'import/prefer-default-export': 0,
    'react/jsx-one-expression-per-line': 0,
    'no-bitwise': 0,
    'no-await-in-loop': 0,
    'no-use-before-define': 0,
  },
};
