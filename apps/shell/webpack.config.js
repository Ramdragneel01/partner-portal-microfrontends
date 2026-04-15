
const path = require('path');
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { container, DefinePlugin } = require('webpack');
const { ModuleFederationPlugin } = container;
const rootDir = path.resolve(__dirname, '../..');

/**
 * Load .env file for the active configuration.
 * CI/CD pipelines inject real env vars; .env files are for local dev only.
 */
function loadEnv(mode) {
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
function readEnvValue(keys, fallback = '') {
  for (const key of keys) {
    const value = env[key];
    if (typeof value === 'string' && value.trim() !== '') {
      return value.trim();
    }
  }
  return fallback;
}

const isProduction = process.env.NODE_ENV === 'production';
const env = { ...loadEnv(isProduction ? 'production' : 'development'), ...process.env };

/** Resolve a remote URL with fallback to localhost default */
function remote(envKey, localDefault) {
  return env[envKey] || localDefault;
}

/** @type {import('webpack').Configuration} */
module.exports = {
  context: __dirname,
  entry: './src/index.ts',
  mode: isProduction ? 'production' : 'development',
  devServer: {
    port: 4200,
    historyApiFallback: true,
    hot: true,
    liveReload: true,
    headers: { 'Access-Control-Allow-Origin': '*' },
  },
  output: {
    publicPath: 'auto',
    uniqueName: 'shell',
    chunkLoadingGlobal: 'webpackChunk_shell',
    hotUpdateGlobal: 'webpackHotUpdate_shell',
    devtoolNamespace: 'shell',
    path: path.resolve(rootDir, 'dist/apps/shell'),
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
      { test: /\.svg$/, type: 'asset/resource' },
    ],
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'shell',
      remotes: {
        riskAssessment:      `riskAssessment@${remote('REMOTE_RISK_URL', 'http://localhost:4201/remoteEntry.js')}`,
        complianceDashboard: `complianceDashboard@${remote('REMOTE_COMPLIANCE_URL', 'http://localhost:4202/remoteEntry.js')}`,
        auditManagement:     `auditManagement@${remote('REMOTE_AUDIT_URL', 'http://localhost:4203/remoteEntry.js')}`,
        policyManagement:    `policyManagement@${remote('REMOTE_POLICY_URL', 'http://localhost:4204/remoteEntry.js')}`,
        incidentReporting:   `incidentReporting@${remote('REMOTE_INCIDENTS_URL', 'http://localhost:4205/remoteEntry.js')}`,
        vendorRisk:          `vendorRisk@${remote('REMOTE_VENDOR_URL', 'http://localhost:4206/remoteEntry.js')}`,
        partnerOnboarding:   `partnerOnboarding@${remote('REMOTE_ONBOARDING_URL', 'http://localhost:4207/remoteEntry.js')}`,
      },
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
      'process.env.USE_MOCK_AUTH':  JSON.stringify(readEnvValue(['USE_MOCK_AUTH', 'VITE_USE_MOCKED_AUTH'], 'true')),
      'process.env.USE_MOCK_DATA':  JSON.stringify(readEnvValue(['USE_MOCK_DATA', 'VITE_USE_MOCKED_DATA'], 'true')),
      'process.env.MOCK_DATA_SCALE': JSON.stringify(readEnvValue(['MOCK_DATA_SCALE', 'VITE_MOCK_DATA_SCALE'], 'small')),
      'process.env.MOCK_DATA_SEED': JSON.stringify(readEnvValue(['MOCK_DATA_SEED', 'VITE_MOCK_DATA_SEED'], '42')),
      'process.env.MOCK_AUTH_USERS': JSON.stringify(env.MOCK_AUTH_USERS ?? ''),
      'process.env.MOCK_AUTH_AUTO_LOGIN': JSON.stringify(readEnvValue(['MOCK_AUTH_AUTO_LOGIN', 'VITE_MOCK_AUTH_AUTO_LOGIN'], 'false')),
      'process.env.MOCK_AUTH_AUTO_LOGIN_EMAIL': JSON.stringify(env.MOCK_AUTH_AUTO_LOGIN_EMAIL ?? ''),
      'process.env.MOCK_AUTH_PERSIST_BY_DEFAULT': JSON.stringify(readEnvValue(['MOCK_AUTH_PERSIST_BY_DEFAULT', 'VITE_MOCK_AUTH_PERSIST_BY_DEFAULT'], 'true')),
      'process.env.TENANT_ID': JSON.stringify(readEnvValue(['TENANT_ID', 'VITE_TENANT_ID'], 'tenant-accenture-demo')),
      'process.env.FEATURE_FLAGS': JSON.stringify(readEnvValue(['FEATURE_FLAGS', 'VITE_FEATURE_FLAGS'], '')),
      'process.env.MSAL_CLIENT_ID': JSON.stringify(env.MSAL_CLIENT_ID ?? ''),
      'process.env.MSAL_TENANT_ID': JSON.stringify(env.MSAL_TENANT_ID ?? 'common'),
      'process.env.MSAL_REDIRECT_URI': JSON.stringify(env.MSAL_REDIRECT_URI ?? ''),
      'process.env.API_SCOPE':      JSON.stringify(env.API_SCOPE ?? ''),
      'process.env.API_BASE_URL':   JSON.stringify(readEnvValue(['API_BASE_URL', 'VITE_API_BASE_URL'], '/api')),
      'process.env.NODE_ENV':       JSON.stringify(isProduction ? 'production' : 'development'),
    }),
    new HtmlWebpackPlugin({ template: './src/index.html', title: 'Partner Portal', inject: 'body' }),
  ],
};
