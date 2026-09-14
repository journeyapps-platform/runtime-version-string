# Changesets

Run `pnpm changeset` when making a release-worthy change and commit the generated Markdown file with your PR. Select the appropriate patch, minor or major bump for `@ja-platform/runtime-version-string` and describe the change for consumers.

Merging into `master` opens or updates a version PR. Merging the version PR publishes to npm. Manually running the Release workflow publishes a snapshot under the `dev` tag; the selected branch must contain a changeset.

See the [publishing instructions](../README.md#publishing) for setup and the release process.
