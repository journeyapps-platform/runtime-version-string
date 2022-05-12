import * as semver from 'semver';
import { ErrorCodes, Track } from './RuntimeVersionDefinition';
import { RuntimeVersionString } from './RuntimeVersionString';
import { isDevBundledRuntime, throwIfChecksFail } from './utils';

/**
 * This function takes a string and does some basic validation on it before passing
 * the components to be serialised into a Channel. Returns throws a pre-defined error code if parsing is
 * unsuccessful.
 */
export function parse(value: string) {
  if (!value || !semver.valid(value)) {
    throw new Error(`${ErrorCodes.INVALID_INPUT}. Invalid string provided ${value}`);
  }

  const parsedSemver = semver.parse(value);
  const { major, minor, patch, build } = parsedSemver;
  const [track, branchName] = parsedSemver.prerelease;
  let { buildNr, buildMeta } = RuntimeVersionString.parseBuildString([...build]);
  if (isDevBundledRuntime(value)) {
    // We don't have to reconstruct devBundledRuntimes, but we don't want the parsing to fail,
    // so we put a dummy buildNr of "0"
    buildNr = '0';
  }
  const actualTrack = (track != null ? `${track}` : Track.STABLE) as Track;
  let finalBranch = branchName != null ? `${branchName}` : null;

  if (actualTrack == Track.ALPHA) {
    buildNr = branchName != null ? `${branchName}` : '0';
    finalBranch = null;
  }
  throwIfChecksFail({
    track: actualTrack,
    buildNr,
    branch: finalBranch,
    buildMeta,
  });

  return new RuntimeVersionString({
    major: `${major}`,
    minor: `${minor}`,
    patch: `${patch}`,
    track: actualTrack,
    buildNr,
    buildMeta,
    branch: finalBranch,
  });
}
