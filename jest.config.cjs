module.exports = {
    // other configurations...
    moduleNameMapper: {
      '\\.(css|less)$': 'identity-obj-proxy',
    },
    // if you have a different setup, ensure you include the transformIgnorePatterns configuration as well:
    transformIgnorePatterns: [
      "/node_modules/(?!MODULE_NAME_HERE).+\\.(js|jsx|ts|tsx)$"
    ],
};
  