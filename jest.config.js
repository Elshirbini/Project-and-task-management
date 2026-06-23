/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/*.test.ts"],
  clearMocks: true,
  moduleFileExtensions: ["js", "json", "ts"],
  rootDir: "src",
  coverageDirectory: "../coverage",
  transform: {
    "^.+\\.(t|j)s$": "ts-jest",
  },
};
