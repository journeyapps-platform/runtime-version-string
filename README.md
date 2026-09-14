# @ja-platform/runtime-version-string

Parse, validate and serialize version strings used by the [Journey Runtime](https://github.com/journeyapps-platform/journey-runtime). The package exports a parser, a `RuntimeVersionString` class, release tracks, error codes and TypeScript definitions.

## Installation

```sh
pnpm add @ja-platform/runtime-version-string
```

## Usage

```ts
import { parse, Track } from '@ja-platform/runtime-version-string';

const version = parse('1.2.3-dev.feature-name+12.abcdef1');

version.base;        // '1.2.3'
version.track;       // Track.DEV
version.branch;      // 'feature-name'
version.buildNr;     // 12
version.buildMeta;   // 'abcdef1'
version.buildString; // '12.abcdef1'
version.toString();  // '1.2.3-dev.feature-name+12.abcdef1'

// Return a new instance with updated values.
const candidate = version.modify({ track: Track.RC, branch: null });
candidate.toString(); // '1.2.3-rc+12.abcdef1'

candidate.toJSON();
// {
//   version: '1.2.3-rc+12.abcdef1',
//   track: Track.RC,
//   buildNr: 12,
//   buildMeta: 'abcdef1',
//   branch: null
// }
```

Version components (`major`, `minor`, and `patch`) are numbers. Build numbers are also numbers when present; `buildString` remains a string. `modify()` and the constructor do not validate track rules; use `parse()` to validate external input.

Represent an absent version with `RuntimeVersionString | null` and check `version == null` before accessing it. The `empty()` and `isEmpty()` helpers have been removed; `0.0.0` is a complete version.

## Version formats

| Track | Example input | Serialized version |
| --- | --- | --- |
| Stable | `1.2.3` or `1.2.3-stable` | `1.2.3` |
| Alpha | `1.2.3-alpha.9` | `1.2.3-alpha+9` |
| Beta | `1.2.3-beta+12` | `1.2.3-beta+12` |
| Release candidate | `1.2.3-rc+12` | `1.2.3-rc+12` |
| Development | `1.2.3-dev.feature-name+12.abcdef1` | `1.2.3-dev.feature-name+12.abcdef1` |

- Input must be valid SemVer and use a known `Track` value.
- Stable releases cannot include a build number.
- Non-stable releases require a numeric build number. Alpha releases read it from the second prerelease component, defaulting to `0` when absent; use `alpha.9` as input to retain build number `9`.
- Branch names are supported only on the development track.
- Build metadata follows the build number, separated by a dot.

The parser also accepts bundled development versions such as `4.58.6-dev.3dfa72698.d6eefc0`. These receive a placeholder build number of `0` and are not intended to round-trip through `toString()`.

## Validation errors

`parse()` and `RuntimeVersionString.parseBuildString()` throw `RuntimeVersionStringException` on validation failures. Its `code` property is an `ErrorCodes` value; its message also retains the code prefix for readability:

```ts
import { ErrorCodes, parse, RuntimeVersionStringException } from '@ja-platform/runtime-version-string';

try {
  parse('1.2.3-rc');
} catch (error) {
  if (error instanceof RuntimeVersionStringException && error.code === ErrorCodes.BUILD_NR_REQUIRED_FOR_NON_STABLE_TRACK) {
    // Ask for a numeric build number, e.g. '1.2.3-rc+1'.
  } else {
    throw error;
  }
}
```

See [the error definitions](./src/RuntimeVersionDefinition.ts) and [the tests](./tests/RuntimeVersionString.test.ts) for supported errors and additional examples.

## Development

Use Node.js 24 LTS (pinned in `.nvmrc`) and pnpm 12.4.1 (pinned in `package.json`). CI builds and tests on Node.js 22 and 24.

```sh
nvm use
pnpm install
pnpm build
pnpm test
```

## Publishing

Releases use Changesets and the [Release workflow](https://github.com/journeyapps-platform/runtime-version-string/actions/workflows/release.yml).

### Production release

1. Run `pnpm changeset`, select the version bump, and describe the change for consumers.
2. Commit the generated `.changeset/*.md` file with your changes and merge the PR into `master`.
3. Changesets opens or updates a version PR containing the version bump and changelog. Review and merge that PR to publish to npm.

Changesets manages production versions; do not manually bump `package.json`. The workflow runs the build and tests before either publishing path. `pnpm release` is the workflow's build-and-publish command and publishes to npm when run locally with credentials.

### Development release

1. Create and commit a changeset with `pnpm changeset` on your development branch.
2. Run the Release workflow manually on that branch.
3. Install the snapshot with `pnpm add @ja-platform/runtime-version-string@dev`.

Manual runs use `changeset version --snapshot dev` and publish under the `dev` tag. Snapshot version changes are not committed back to the branch.
