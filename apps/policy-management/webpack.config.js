
const { createRemoteWebpackConfig } = require('../../tools/webpack/remoteConfig');
module.exports = createRemoteWebpackConfig({ name: 'policyManagement', port: 4204, appDir: __dirname });
