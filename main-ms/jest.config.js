/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: 'node',
  transform: {
      '^.+\\.tsx?$': ['ts-jest', { isolatedModules: true }]
  },
  moduleNameMapper: {
      '^types/(.*)$': '<rootDir>/src/types/$1.d.ts'
  }
};
