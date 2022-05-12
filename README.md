# Overview

This library provides a way to share SemVer string parsing for the [Journey Runtime](https://github.com/journeyapps-platform/journey-runtime).


## Usage

The most likely use case is the `parse` function that this library ships which enables the parsing of a given string into the Journey compatible one. See the [tests](./tests/RuntimeVersionString.test.ts).

## Development

For the best development experience, write tests first, open a terminal in the project root and run `pnpm jest --watch`.

## Deployment

To deploy a dev version of this package, use: `pnpm deploy`. This will trigger a GitHub action.

Production builds will be automatically build and published when merging to master.


## Other Example Use Cases

- [Journey Runtime](https://github.com/journeyapps-platform/journey-runtime)
- [Journey Update Service](https://github.com/journeyapps-platform/journey-update-service)
- [Journey App Editor](https://github.com/journeyapps-platform/journey-app-editor)
