export default {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  setupFiles: ['<rootDir>/src/setupPolyfills.js'],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  extensionsToTreatAsEsm: ['.jsx'], // Remove '.js' as it's inferred from package.json
  moduleFileExtensions: ['js', 'jsx', 'json', 'node'],
};