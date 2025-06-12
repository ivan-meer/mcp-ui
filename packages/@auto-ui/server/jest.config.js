module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.+(ts|tsx|js)', '**/?(*.)+(spec|test).+(ts|tsx|js)'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.json' // Path to package-specific tsconfig
    }]
  },
  moduleNameMapper: {
    '^@auto-ui/core$': '<rootDir>/../core/src/index',
    '^@auto-ui/analyzer$': '<rootDir>/../analyzer/src/index'
  }
};
