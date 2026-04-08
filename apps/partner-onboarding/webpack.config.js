
const { createRemoteWebpackConfig } = require('../../tools/webpack/remoteConfig');
module.exports = createRemoteWebpackConfig({ name: 'partnerOnboarding', port: 4207, appDir: __dirname });
