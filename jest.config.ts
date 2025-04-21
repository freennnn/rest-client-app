import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  dir: './',
});




const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',

  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts', '<rootDir>/jest-dom-setup.ts'],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/', 
    '<rootDir>/.next/',
  ],

  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  moduleDirectories: ['node_modules', '<rootDir>'],

  transformIgnorePatterns: [
    '/node_modules/(?!(next-intl)/)',
  ],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
    '!src/@types/**',
    '!src/utils/supabase/**', // Supabase third party code
    '!src/i18n/**', // next-intl third party code
    '!src/utils/middleware/**', // middleware Next.js code
    '!src/middleware.ts', // middleware Next.js code
  ],
};

export default createJestConfig(config);
