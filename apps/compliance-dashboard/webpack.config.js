
const { createRemoteWebpackConfig } = require('../../tools/webpack/remoteConfig');
module.exports = createRemoteWebpackConfig({ name: 'complianceDashboard', port: 4202, appDir: __dirname });
