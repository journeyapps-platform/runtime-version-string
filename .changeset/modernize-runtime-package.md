---
"@ja-platform/runtime-version-string": major
---

Move the package from `@journeyapps/runtime-version-string` to `@ja-platform/runtime-version-string` and require Node.js 22.13 or newer. Update consumer dependencies and imports to the new scope. Compiled JavaScript and declarations now live in `dist`; the package entry points and exported API remain available.

Upgrade development tooling to Node.js 24 LTS and pnpm 12, migrate tests to Vitest, and manage releases with Changesets.
