---
"@ja-platform/runtime-version-string": major
---

Move the package from `@journeyapps/runtime-version-string` to `@ja-platform/runtime-version-string` and require Node.js 22.13 or newer. Update consumer dependencies and imports to the new scope. Compiled JavaScript and declarations now live in `dist`. The package entry points now reference that directory.

Upgrade development tooling to Node.js 24 LTS and pnpm 12, migrate tests to Vitest, and manage releases with Changesets.

Change `major`, `minor`, `patch`, and `buildNr` from strings to numbers in parsed versions, constructor input, and `modify()` input. `toJSON().buildNr` is numeric too, while `buildString` remains text. Build numbers must be non-negative safe integers; oversized values are rejected and leading zeroes are normalized.

Represent absent versions as `null`: `RuntimeVersionString.empty()` now returns `null` instead of an incomplete instance. `isEmpty()` is a type guard for `null` and `undefined`, which no longer throw. Replace clearing individual components with an optional version value, and guard it before calling instance methods.

Throw the exported `RuntimeVersionStringException` for parsing and validation failures. Use `instanceof RuntimeVersionStringException` and its typed `code` property (`ErrorCodes`) to handle failures without inspecting message text.
