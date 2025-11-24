module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.jest.json',
    }],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    '\\.svg$': '<rootDir>/src/tests/basic_mocks/svgMock.ts',
  },
  setupFilesAfterEnv: ['<rootDir>/setupTests.ts'], 
};