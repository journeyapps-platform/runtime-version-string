import * as semver from 'semver';
import * as fp from 'lodash/fp';
export type Track = 'dev' | 'beta' | 'rc' | 'stable';

const KNOWN_TRACKS: Track[] = ['dev', 'beta', 'rc', 'stable'];

const isNumericOnlyString = (string: string) => /^[0-9]+$/.test(string);
const exists = (value: any) => value != null;

export enum ErrorCodes {
  NOT_RECOGNISED_TRACK = 'NOT_RECOGNISED_TRACK',
  NO_BUILD_NR_ON_STABLE = 'NO_BUILD_NR_ON_STABLE',
  BUILD_NR_REQUIRED_FOR_NON_STABLE_TRACK = 'BUILD_NR_REQUIRED_FOR_NON_STABLE_TRACK',
  BUILD_NR_NOT_NUMBERIC = 'BUILD_NR_NOT_NUMBERIC',
}

interface SomeRuntimeValues extends Partial<RuntimeVersionString> {}

const throwIf = <T = SomeRuntimeValues>(predicate: (v: T) => boolean, message: string, value: T) => {
  if (predicate(value)) {
    throw new Error(message);
  }
  return value;
}

const throwIfC = fp.curry<(v: SomeRuntimeValues) => boolean, string, SomeRuntimeValues, SomeRuntimeValues>(throwIf);

/* prettier-ignore */
const trackAndBuildNr: (v: SomeRuntimeValues) => SomeRuntimeValues = fp.pipe([
  throwIfC(v => !KNOWN_TRACKS.find(fp.equals(v.track)))               (ErrorCodes.NOT_RECOGNISED_TRACK),
  throwIfC(v => v.track === 'stable' && exists(v.buildNr))            (ErrorCodes.NO_BUILD_NR_ON_STABLE),
  throwIfC(v => v.track !== 'stable' && !exists(v.buildNr))           (ErrorCodes.BUILD_NR_REQUIRED_FOR_NON_STABLE_TRACK),
  throwIfC(v => exists(v.buildNr) && !isNumericOnlyString(v.buildNr)) (ErrorCodes.BUILD_NR_NOT_NUMBERIC),
]);

/**
 * This function takes a string and does some basic validation on it before passing
 * the components to be serialised into a Channel. Returns throws a pre-defined error code if parsing is
 * unsuccessful.
 */

export const parse = (value: string) => {
  if (!value || !semver.valid(value)) {
    return null;
  }

  const parsedSemver = semver.parse(value);
  const { major, minor, patch } = parsedSemver;
  const [track, branchName] = parsedSemver.prerelease;
  const [buildNr] = parsedSemver.build;

  trackAndBuildNr({ track: track as Track || 'stable', buildNr });

  const checks = [
    exists(major),
    exists(minor),
    exists(patch),
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
