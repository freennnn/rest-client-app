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
    '<rootDir>/__tests__/app/\\[locale\\]/not-found.test.tsx',
    '<rootDir>/__tests__/app/\\[locale\\]/404/page.test.tsx',
    '<rootDir>/__tests__/components/HistoryViewer.test.tsx'
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
    '!src/utils/supabase/**',
    '!src/i18n/**',
    '!src/utils/middleware/**', 
    '!src/middleware.ts',
    // Exclude HistoryViewer from coverage reporting
    '!src/components/HistoryViewer.tsx',
  ],
};

export default createJestConfig(config);
