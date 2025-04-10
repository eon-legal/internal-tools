import type { Config } from 'jest';

const config: Config = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  moduleDirectories: ['node_modules', '<rootDir>'],
  /*moduleNameMapper: {
    '^jspdf$': '<rootDir>/__mocks__/jspdf.ts', // lo nuevo
  },*/
  //testEnvironment: 'jsdom',
  testMatch: ['**/+(*.)+(spec).+(ts)'],
  testEnvironment: 'jest-environment-jsdom',
};

export default config;

//import type { Config } from 'jest';

//const config: Config = {
//  preset: 'jest-preset-angular',
//  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
//  moduleDirectories: ['node_modules', '<rootDir>'],
//  testMatch: ['**/+(*.)+(spec).+(ts)'],
//  transform: {
  //  '^.+\\.(ts|tsx)$': 'ts-jest', // Usa ts-jest para transformar archivos TypeScript
  //},
  //transformIgnorePatterns: [
  //  '/node_modules/(?!(pdfmake-wrapper|@angular/core|@angular/compiler|@angular/common|@angular/platform-browser|@angular/platform-browser-dynamic|primeng)/)',
  //],
  //testEnvironment: 'jest-environment-jsdom',
//};

//export default config;