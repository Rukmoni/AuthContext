/** @type {import('jest').Config} */
module.exports = {
    preset: 'jest-expo',
    transform: {
      '^.+\\.[jt]sx?$': 'babel-jest', // let babel-jest handle JSX/TSX
    },
    setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
    testPathIgnorePatterns: ['/node_modules/', '/.expo/', '/dist/'],
  };
  