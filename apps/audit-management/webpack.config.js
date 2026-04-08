
const { createRemoteWebpackConfig } = require('../../tools/webpack/remoteConfig');
module.exports = createRemoteWebpackConfig({ name: 'auditManagement', port: 4203, appDir: __dirname });
