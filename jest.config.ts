import type { Config } from 'jest';
import nextJest from 'next/jest';

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
});

// Add any custom config to be passed to Jest
const customJestConfig: Config = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts', '<rootDir>/jest-dom-setup.ts'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/'],
  // Transform next-intl and other ESM modules
  transformIgnorePatterns: [
    'node_modules/(?!(next|next-intl|@swc|react-dnd|dnd-core|@react-dnd|react-textarea-autosize)/)'
  ],
  moduleDirectories: ['node_modules', '<rootDir>'],
  // Configure coverage collection
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/middleware.ts',
    '!src/app/api/**',
    '!**/node_modules/**',
  ],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(customJestConfig);