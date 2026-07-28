/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    // isolatedModules must stay off: ts-jest needs full transform to emit the
    // decorator metadata Nest's DI relies on (@Inject tokens, param types).
    '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    // sanitize-html pulls in an ESM-only parser chain that Jest can't transform;
    // a passthrough mock keeps unit tests fast (no test exercises sanitisation).
    '^sanitize-html$': '<rootDir>/test/mocks/sanitize-html.ts',
  },
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.module.ts', '!src/main.ts'],
  coverageDirectory: './coverage',
  testEnvironment: 'node',
  // The shared package ships compiled JS from the monorepo root.
  modulePaths: ['<rootDir>/../../node_modules'],
};
