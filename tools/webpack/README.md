# Webpack Config Factory

> Shared Webpack configuration factory for all remote micro-apps.
> Ensures consistent Module Federation setup across all 7 remotes.

---

## `createRemoteWebpackConfig(config)`

Factory function that generates a complete Webpack 5 configuration for a Module Federation remote.

### Parameters

| Property | Type | Description |
|----------|------|-------------|
| `name` | `string` | Module Federation name (camelCase, e.g., `riskAssessment`) |
| `port` | `number` | Dev server port (4201–4207) |
| `appDir` | `string` | Absolute path to the app directory (`__dirname`) |

### Usage

```javascript
// apps/risk-assessment/webpack.config.js
const { createRemoteWebpackConfig } = require('../../tools/webpack/remoteConfig');

module.exports = createRemoteWebpackConfig({
  name: 'riskAssessment',
  port: 4201,
  appDir: __dirname,
});
```

### What It Configures

| Feature | Setting |
|---------|---------|
| Entry | `./src/index.ts` |
| Dev server | `port`, `historyApiFallback: true`, `CORS: *` |
| Output | `dist/apps/{name}/`, `publicPath: auto`, `clean: true` |
| Resolve extensions | `.ts`, `.tsx`, `.js`, `.jsx` |
| `@shared/*` aliases | All 5 shared library paths resolved |
| TypeScript | `ts-loader` with `tsconfig.app.json` |
| CSS | `style-loader` + `css-loader` |
| Module Federation | `name`, `filename: remoteEntry.js`, `exposes: { './Module': './src/remote-entry.tsx' }` |
| Shared deps | `react`, `react-dom`, `react-router-dom` (singleton, not eager) |
| HTML | `html-webpack-plugin` with `./src/index.html` |

---

## Adding a New Remote

1. Create app directory: `apps/new-app/src/`.
2. Create `webpack.config.js`:
   ```javascript
   const { createRemoteWebpackConfig } = require('../../tools/webpack/remoteConfig');
   module.exports = createRemoteWebpackConfig({
     name: 'newApp',         // camelCase
     port: 4208,             // next available port
     appDir: __dirname,
   });
   ```
3. Create `src/remote-entry.tsx` with default export React component.
4. Register remote in `apps/shell/webpack.config.js`:
   ```javascript
   remotes: {
     // ... existing remotes
     newApp: 'newApp@http://localhost:4208/remoteEntry.js',
   }
   ```
5. Add type declaration in `apps/shell/src/remotes.d.ts`:
   ```typescript
   declare module 'newApp/Module' { const Module: React.ComponentType; export default Module; }
   ```

---

## Architecture Rules

1. **One factory for all remotes**. Never create custom webpack configs per-app.
2. **Shared deps are singletons**. React/ReactDOM/Router loaded once by shell.
3. **`publicPath: auto`** allows runtime resolution of asset URLs.
4. **All aliases must match** `tsconfig.base.json` paths and shell webpack aliases.

---

## Key Files

| File | Purpose |
|------|---------|
| `remoteConfig.js` | `createRemoteWebpackConfig()` factory function |
