
const { createRemoteWebpackConfig } = require('../../tools/webpack/remoteConfig');
module.exports = createRemoteWebpackConfig({ name: 'vendorRisk', port: 4206, appDir: __dirname });
