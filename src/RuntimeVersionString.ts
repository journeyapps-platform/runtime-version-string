import * as semver from 'semver';
import * as fp from 'lodash/fp';
export type Track = 'dev' | 'beta' | 'rc' | 'stable';

const KNOWN_TRACKS: Track[] = ['dev', 'beta', 'rc', 'stable'];

const isNumericOnlyString = (string: string) => /^[0-9]+$/.test(string);
const exists = (value: any) => value != null;

/**
 * This function takes a string and does some basic validation on it before passing
 * the components to be serialised into a Channel. Returns `null` if parsing is
 * unsuccessful.
 */
interface ParserOptions {
  buildNrOptional: boolean; // Allows for more relaxed parsing. For instance, a client may want to parse a string that doesn't specify a build nr.
}

export const parse = (value: string, options?: ParserOptions) => {
  if (!value || !semver.valid(value)) {
    return null;
  }
  const skipBuildNr = options && options.buildNrOptional;

  const parsedSemver = semver.parse(value);
  const { major, minor, patch } = parsedSemver;
  const [track, branchName] = parsedSemver.prerelease;
  const [buildNr] = parsedSemver.build;

  const checks = [
    exists(major),
    exists(minor),
    exists(patch),
    skipBuildNr || (exists(buildNr) && isNumericOnlyString(buildNr)),
    !!KNOWN_TRACKS.find(fp.equals(track))
  ];

  if (!checks.every(fp.identity)) {
    return null;
  }

  return new RuntimeVersionString({
    major: major + '',
    minor: minor + '',
    patch: patch + '',
    track: track as Track,
    buildNr,
    branch: branchName
  });
};

interface RuntimeVersionStringObject {
  version: string;
  track: Track;
  buildNr: string;
  branch: string;
}

export type VersionStringComponentsObject = {
  major: string;
  minor: string;
  patch: string;
  track: Track;
  buildNr?: string;
  branch?: string;
};

export class RuntimeVersionString {
  constructor(readonly value: VersionStringComponentsObject) {}

  get major() {
    return this.value.major;
  }

  get minor() {
    return this.value.minor;
  }

  get patch() {
    return this.value.patch;
  }

  get branch() {
    return this.value.branch;
  }

  get track() {
    return this.value.track;
  }

  get buildNr() {
    return this.value.buildNr;
  }

  modify(newValue: Partial<VersionStringComponentsObject>) {
    return new RuntimeVersionString({
      ...this.value,
      ...newValue
    });
  }

  toJSON(): RuntimeVersionStringObject {
    const rawVesrion = this.toString();
    return {
      version: rawVesrion,
      track: this.value.track,
      buildNr: this.value.buildNr,
      branch: this.value.branch || null
    };
  }

  toString() {
    try {
      return semver.parse(
        this.value.major +
          '.' +
          this.value.minor +
          '.' +
          this.value.patch +
          '-' +
          this.value.track +
          (exists(this.value.branch) ? '.' + this.value.branch : '') +
          (exists(this.value.buildNr) ? '+' + this.value.buildNr : '')
      ).raw;
    } catch (e) {
      return '';
    }
  }

  static empty() {
    return new RuntimeVersionString({ major: null, minor: null, patch: null, track: 'dev' });
  }
}
