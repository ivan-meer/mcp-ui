module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom', // Important for React components
  roots: ['<rootDir>/src'],
  setupFilesAfterEnv: ['@testing-library/jest-dom'], // for DOM matchers
  testMatch: ['**/__tests__/**/*.+(ts|tsx|js)', '**/?(*.)+(spec|test).+(ts|tsx|js)'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
  },
  moduleNameMapper: {
    // If components import from @auto-ui/themes, map it if Jest struggles
     '^@auto-ui/themes$': '<rootDir>/../themes/src/index',
  }
};
