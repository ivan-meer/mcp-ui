module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'], // Should point to the src directory of @auto-ui/analyzer
  testMatch: ['**/__tests__/**/*.+(ts|tsx|js)', '**/?(*.)+(spec|test).+(ts|tsx|js)'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
        tsconfig: 'tsconfig.json',
        // isolatedModules: true, // Can sometimes help with TS/Jest issues but might hide type errors
    }],
  },
  moduleNameMapper: {
    // Map to the 'src' directory of the respective packages.
    // Jest should then resolve the 'index.ts' or specific files from there.
    '^@auto-ui/core$': '<rootDir>/../core/src',
    '^@auto-ui/server$': '<rootDir>/../server/src',
    '^@auto-ui/analyzer$': '<rootDir>/src', // Self-reference to its own src directory
  },
  clearMocks: true,
};
