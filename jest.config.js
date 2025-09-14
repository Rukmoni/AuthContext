/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testPathIgnorePatterns: ['/node_modules/', '/.expo/', '/dist/'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  clearMocks: true,
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}', // adjust if your source code is in `src/`
    '!src/**/__tests__/**', // ignore test files
    '!src/**/types.ts',     // ignore type-only files
    '!**/node_modules/**',
  ],
  coverageReporters: ['text', 'lcov', 'html'], // text for CLI, html for browser view
  coverageDirectory: 'dist/coverage',
};