import { RuntimeVersionStringException } from './RuntimeVersionStringException';
import * as semver from 'semver';
import { ErrorCodes, KNOWN_TRACKS, Track } from './RuntimeVersionDefinition';
import { RuntimeVersionString } from './RuntimeVersionString';
import { isDevBundledRuntime, throwIfChecksFail } from './utils';

/**
 * This function takes a string and does some basic validation on it before passing
 * the components to be serialised into a Channel. Returns throws a pre-defined error code if parsing is
 * unsuccessful.
 */
export function parse(value: string) {
  const parsedSemver = semver.parse(value);
  if (!parsedSemver) {
    throw new RuntimeVersionStringException(ErrorCodes.INVALID_INPUT, `Invalid string provided ${value}`);
  }

  const { major, minor, patch, build } = parsedSemver;
  const [track, branchName] = parsedSemver.prerelease;
  const actualTrack = (track != null ? `${track}` : Track.STABLE) as Track;
  if (!KNOWN_TRACKS.includes(actualTrack)) {
    throw new RuntimeVersionStringException(ErrorCodes.NOT_RECOGNISED_TRACK);
  }
  let { buildNr, buildMeta } = RuntimeVersionString.parseBuildString([...build]);
  if (isDevBundledRuntime(value)) {
    // We don't have to reconstruct devBundledRuntimes, but we don't want the parsing to fail,
    // so we put a dummy buildNr of 0
    buildNr = 0;
  }
  let finalBranch = branchName != null ? `${branchName}` : null;

  if (actualTrack == Track.ALPHA) {
    buildNr = branchName != null ? RuntimeVersionString.parseBuildString([`${branchName}`]).buildNr : 0;
    finalBranch = null;
  }
  throwIfChecksFail({
    track: actualTrack,
    buildNr,
    branch: finalBranch,
    buildMeta
  });

  return new RuntimeVersionString({
    major,
    minor,
    patch,
    track: actualTrack,
    buildNr,
    buildMeta,
    branch: finalBranch
  });
}
