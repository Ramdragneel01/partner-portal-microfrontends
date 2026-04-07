# Tools

> Build tools and configuration factories shared across the monorepo.

---

## Contents

| Directory | Purpose |
|-----------|---------|
| `webpack/` | Webpack configuration factory for Module Federation remotes |

---

## Architecture Rules

1. **Tools are build-time only**. Nothing in `tools/` is shipped to production.
2. **Config factories over duplication**. Use `createRemoteWebpackConfig()` instead of copying webpack configs.
3. **All 7 remotes use the same factory**. Changes here affect all micro-apps.
