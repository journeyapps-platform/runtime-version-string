import { RuntimeVersionStringException } from './RuntimeVersionStringException';
import * as semver from 'semver';
import { ErrorCodes, Track } from './RuntimeVersionDefinition';
import { RuntimeVersionString } from './RuntimeVersionString';
import { decodeBuildString, isDevBundledRuntime } from './utils';

/**
 * Decode a SemVer string and normalize Journey-specific fields.
 * Validate the resulting version before returning it.
 */
export function parse(value: string) {
  const parsedSemver = semver.parse(value);
  if (!parsedSemver) {
    throw new RuntimeVersionStringException(ErrorCodes.INVALID_INPUT, `Invalid string provided ${value}`);
  }

  const { major, minor, patch, build } = parsedSemver;
  const [track, branchName] = parsedSemver.prerelease;
  const actualTrack = (track != null ? `${track}` : Track.STABLE) as Track;
  let { buildNr, buildMeta } = decodeBuildString(build);
  if (isDevBundledRuntime(value)) {
    // We don't have to reconstruct devBundledRuntimes, but we don't want the parsing to fail,
    // so we put a dummy buildNr of 0
    buildNr = 0;
  }
  let finalBranch = branchName != null ? `${branchName}` : null;

  if (actualTrack == Track.ALPHA) {
    buildNr = branchName != null ? decodeBuildString([`${branchName}`]).buildNr : 0;
    finalBranch = null;
  }
  const version = new RuntimeVersionString({
    major,
    minor,
    patch,
    track: actualTrack,
    buildNr,
    buildMeta,
    branch: finalBranch
  });
  version.validate();
  return version;
}
