/** @type {import('jest').Config} */
// Tests are disabled. Run test:jest scripts to re-enable.
module.exports = {
  testEnvironment: "node",
  testMatch: ["**/**/*.test.ts"],
  testPathIgnorePatterns: ["<rootDir>"],
  verbose: true,
  forceExit: true,
  clearMocks: true,
  moduleFileExtensions: ["js", "ts"],
  transform: {
    "^.+\\.ts$": "@swc/jest",
  },
  moduleNameMapper: {
    "^@utsukushii/shared/(.*)$": "<rootDir>/../../packages/shared/src/$1",
    "^@utsukushii/shared$": "<rootDir>/../../packages/shared/src",
    "^@utsukushii/database/(.*)$": "<rootDir>/../../packages/database/src/$1",
    "^@utsukushii/database$": "<rootDir>/../../packages/database/src",
    "^@mongodb-js/saslprep$": "<rootDir>/tests/mocks/saslprep.ts",
  },
};
