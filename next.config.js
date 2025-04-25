// next.config.js (at the project root, next to package.json)
const path = require('path');

module.exports = {
  webpack: (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),

      // Remove aliases previously needed for pixi3d, as it's removed
      // '@pixi/loaders$': require.resolve('pixi.js'), 
      // '@pixi/sprite$': require.resolve('pixi.js'),

      // Add aliases to force resolution to React's JSX runtime
      '@pixi/react/jsx-runtime': require.resolve('react/jsx-runtime'),
      '@pixi/react/jsx-dev-runtime': require.resolve('react/jsx-dev-runtime'),
    };

    return config;
  },
  // Remove invalid onDemandEntries config key
  // onDemandEntries: {
  //   ignoreBuildErrors: true,
  // },
};
