
/**
 * Shared webpack config factory for remote micro-apps.
 * Each remote exposes ./Module and shares React as singleton.
 * Reads .env files for environment-specific configuration.
 */
const path = require('path');
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { container, DefinePlugin } = require('webpack');
const { ModuleFederationPlugin } = container;

/**
 * Load .env file for the active configuration.
 * @param {string} rootDir
 * @param {string} mode - 'development' | 'production'
 */
function loadEnv(rootDir, mode) {
  const envFile = path.resolve(rootDir, `.env.${mode}`);
  const baseFile = path.resolve(rootDir, '.env.development');
  const target = fs.existsSync(envFile) ? envFile : baseFile;
  if (!fs.existsSync(target)) return {};
  return Object.fromEntries(
    fs.readFileSync(target, 'utf-8')
      .split('\n')
      .filter(l => l.trim() && !l.startsWith('#') && l.includes('='))
      .map(l => { const [k, ...v] = l.split('='); return [k.trim(), v.join('=').trim()]; })
  );
}

/**
 * Resolve an env var from multiple compatible keys.
 * Supports transition from legacy USE_* keys to VITE_* aliases.
 */
function readEnvValue(env, keys, fallback = '') {
  for (const key of keys) {
    const value = env[key];
    if (typeof value === 'string' && value.trim() !== '') {
      return value.trim();
    }
  }
  return fallback;
}

/**
 * @param {{ name: string, port: number, appDir: string }} config
 * @returns {import('webpack').Configuration}
 */
function createRemoteWebpackConfig(config) {
  const rootDir = path.resolve(config.appDir, '../..');
  const isProduction = process.env.NODE_ENV === 'production';
  const env = { ...loadEnv(rootDir, isProduction ? 'production' : 'development'), ...process.env };
  return {
    context: config.appDir,
    entry: './src/index.ts',
    mode: isProduction ? 'production' : 'development',
    devServer: {
      port: config.port,
      historyApiFallback: true,
      hot: true,
      liveReload: true,
      headers: { 'Access-Control-Allow-Origin': '*' },
    },
    output: {
      publicPath: 'auto',
      uniqueName: config.name,
      chunkLoadingGlobal: `webpackChunk_${config.name}`,
      hotUpdateGlobal: `webpackHotUpdate_${config.name}`,
      devtoolNamespace: config.name,
      path: path.resolve(rootDir, 'dist/apps/' + config.name),
      clean: true,
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
      alias: {
        '@shared/types': path.resolve(rootDir, 'libs/shared/types/src/index.ts'),
        '@shared/auth': path.resolve(rootDir, 'libs/shared/auth/src/index.ts'),
        '@shared/ui-components': path.resolve(rootDir, 'libs/shared/ui-components/src/index.ts'),
        '@shared/api-client': path.resolve(rootDir, 'libs/shared/api-client/src/index.ts'),
        '@shared/event-bus': path.resolve(rootDir, 'libs/shared/event-bus/src/index.ts'),
      },
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
              compilerOptions: {
                jsx: 'react-jsx',
                module: 'esnext',
                moduleResolution: 'node',
                target: 'es2015',
                esModuleInterop: true,
                allowSyntheticDefaultImports: true,
                strict: true,
              },
            },
          },
          exclude: /node_modules/,
        },
        { test: /\.css$/, use: ['style-loader', 'css-loader'] },
      ],
    },
    plugins: [
      new ModuleFederationPlugin({
        name: config.name,
        filename: 'remoteEntry.js',
        exposes: { './Module': './src/remote-entry.tsx' },
        shared: {
          react:                 { singleton: true, requiredVersion: false, eager: false },
          'react-dom':           { singleton: true, requiredVersion: false, eager: false },
          'react-router-dom':    { singleton: true, requiredVersion: false, eager: false },
          '@mui/material':       { singleton: true, requiredVersion: false, eager: false },
          '@mui/icons-material': { singleton: true, requiredVersion: false, eager: false },
          '@emotion/react':      { singleton: true, requiredVersion: false, eager: false },
          '@emotion/styled':     { singleton: true, requiredVersion: false, eager: false },
          '@azure/msal-browser': { singleton: true, requiredVersion: false, eager: false },
          '@azure/msal-react':   { singleton: true, requiredVersion: false, eager: false },
        },
      }),
      new DefinePlugin({
        'process.env.USE_MOCK_AUTH':     JSON.stringify(readEnvValue(env, ['USE_MOCK_AUTH', 'VITE_USE_MOCKED_AUTH'], 'true')),
        'process.env.USE_MOCK_DATA':     JSON.stringify(readEnvValue(env, ['USE_MOCK_DATA', 'VITE_USE_MOCKED_DATA'], 'true')),
        'process.env.MOCK_DATA_SCALE':   JSON.stringify(readEnvValue(env, ['MOCK_DATA_SCALE', 'VITE_MOCK_DATA_SCALE'], 'small')),
        'process.env.MOCK_DATA_SEED':    JSON.stringify(readEnvValue(env, ['MOCK_DATA_SEED', 'VITE_MOCK_DATA_SEED'], '42')),
        'process.env.MOCK_AUTH_USERS': JSON.stringify(env.MOCK_AUTH_USERS ?? ''),
        'process.env.MOCK_AUTH_AUTO_LOGIN': JSON.stringify(readEnvValue(env, ['MOCK_AUTH_AUTO_LOGIN', 'VITE_MOCK_AUTH_AUTO_LOGIN'], 'false')),
        'process.env.MOCK_AUTH_AUTO_LOGIN_EMAIL': JSON.stringify(env.MOCK_AUTH_AUTO_LOGIN_EMAIL ?? ''),
        'process.env.MOCK_AUTH_PERSIST_BY_DEFAULT': JSON.stringify(readEnvValue(env, ['MOCK_AUTH_PERSIST_BY_DEFAULT', 'VITE_MOCK_AUTH_PERSIST_BY_DEFAULT'], 'true')),
        'process.env.TENANT_ID':         JSON.stringify(readEnvValue(env, ['TENANT_ID', 'VITE_TENANT_ID'], 'tenant-accenture-demo')),
        'process.env.FEATURE_FLAGS':     JSON.stringify(readEnvValue(env, ['FEATURE_FLAGS', 'VITE_FEATURE_FLAGS'], '')),
        'process.env.MSAL_CLIENT_ID':    JSON.stringify(env.MSAL_CLIENT_ID ?? ''),
        'process.env.MSAL_TENANT_ID':    JSON.stringify(env.MSAL_TENANT_ID ?? 'common'),
        'process.env.MSAL_REDIRECT_URI': JSON.stringify(env.MSAL_REDIRECT_URI ?? ''),
        'process.env.API_SCOPE':         JSON.stringify(env.API_SCOPE ?? ''),
        'process.env.API_BASE_URL':      JSON.stringify(readEnvValue(env, ['API_BASE_URL', 'VITE_API_BASE_URL'], '/api')),
        'process.env.NODE_ENV':          JSON.stringify(isProduction ? 'production' : 'development'),
      }),
      new HtmlWebpackPlugin({ template: './src/index.html', inject: 'body' }),
    ],
  };
}

module.exports = { createRemoteWebpackConfig };
