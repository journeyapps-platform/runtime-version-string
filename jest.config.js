module.exports = {
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  moduleDirectories: ['node_modules'],
  verbose: true,
  testMatch: ['**/tests/*.test.ts']
};
