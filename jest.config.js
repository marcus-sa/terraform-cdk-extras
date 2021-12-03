const { getJestProjects } = require('@nrwl/jest');

module.exports = {
  projects: getJestProjects(),
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/jest-setup.ts'],
};
