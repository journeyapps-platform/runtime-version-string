import * as semver from 'semver';

interface SomeRuntimeValues extends Partial<RuntimeVersionString> {}
type Predicate<T> = (v: T) => boolean;
type PredicateCodePair = [Predicate<SomeRuntimeValues>, string];

export type Track = 'dev' | 'beta' | 'rc' | 'stable';

export enum ErrorCodes {
  INVALID_INPUT = 'INVALID_INPUT',
  NOT_RECOGNISED_TRACK = 'NOT_RECOGNISED_TRACK',
  NO_BUILD_NR_ON_STABLE = 'NO_BUILD_NR_ON_STABLE',
  BUILD_NR_REQUIRED_FOR_NON_STABLE_TRACK = 'BUILD_NR_REQUIRED_FOR_NON_STABLE_TRACK',
  BUILD_NR_INVALID = 'BUILD_NR_INVALID',
  BRANCHES_ON_DEV_TRACK_ONLY = 'BRANCHES_ON_DEV_TRACK_ONLY'
}

const KNOWN_TRACKS: Track[] = ['dev', 'beta', 'rc', 'stable'];

const isValidBuildNr = (string: string) => /^[0-9]+$/.test(string);
const exists = (value: any) => value != null;

const throwErrorIf = (predicateMessagePair: PredicateCodePair, value: SomeRuntimeValues) => {
  const [predicate, message] = predicateMessagePair;
  if (predicate(value)) {
    throw new Error(
      `${message}. "${JSON.stringify(
        value
      )}" failed checks. Please see https://github.com/journeyapps-platform/runtime-version-string for a list of runtime version string requirements.`
    );
  }
};

/* prettier-ignore */
const checksAndCodesPairs: [Predicate<SomeRuntimeValues>, string][] = [
  [v => !KNOWN_TRACKS.find(track => track === v.track),       ErrorCodes.NOT_RECOGNISED_TRACK],
  [v => v.track === 'stable' && exists(v.buildNr),            ErrorCodes.NO_BUILD_NR_ON_STABLE],
  [v => v.track !== 'stable' && !exists(v.buildNr),           ErrorCodes.BUILD_NR_REQUIRED_FOR_NON_STABLE_TRACK],
  [v => v.track !== 'dev' && exists(v.branch),                ErrorCodes.BRANCHES_ON_DEV_TRACK_ONLY],
  [v => exists(v.buildNr) && !isValidBuildNr(v.buildNr),      ErrorCodes.BUILD_NR_INVALID]
];

const throwIfChecksFail = (value: SomeRuntimeValues) => {
  checksAndCodesPairs.forEach(pair => {
    throwErrorIf(pair, value);
  });
};

/**
 * This function takes a string and does some basic validation on it before passing
 * the components to be serialised into a Channel. Returns throws a pre-defined error code if parsing is
 * unsuccessful.
 */

export const parse = (value: string) => {
  if (!value || !semver.valid(value)) {
    throw new Error(`${ErrorCodes.INVALID_INPUT}. Invalid string provided ${value}`);
  }

  const parsedSemver = semver.parse(value);
  const { major, minor, patch } = parsedSemver;
  const [track, branchName] = parsedSemver.prerelease;
  const { buildNr, buildMeta } = RuntimeVersionString.parseBuildString(parsedSemver.build);
  // const buildNr = parsedSemver.build.shift(); // Removes first value
  // const buildMeta = parsedSemver.build.length > 0 ? parsedSemver.build.join('.') : null;

  throwIfChecksFail({
    track: (track as Track) || 'stable',
    buildNr,
    branch: branchName,
    buildMeta
  });

  return new RuntimeVersionString({
    major: major + '',
    minor: minor + '',
    patch: patch + '',
    track: track as Track,
    buildNr,
    buildMeta,
    branch: branchName
  });
};

interface RuntimeVersionStringObject {
  version: string;
  track: Track;
  buildNr: string;
  buildMeta: string;
  branch: string;
}

interface BuildStringComponent {
  buildNr?: string;
  buildMeta?: string;
}

export type VersionStringComponentsObject = {
  major: string;
  minor: string;
  patch: string;
  track: Track;
  buildNr?: string;
  buildMeta?: string;
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

  get buildMeta() {
    return this.value.buildMeta;
  }

  get buildString() {
    if (exists(this.buildNr)) {
      if (exists(this.buildMeta)) {
        return this.buildNr + '.' + this.buildMeta;
      } else {
        return this.buildNr;
      }
    } else {
      return null;
    }
  }

  modify(newValue: Partial<VersionStringComponentsObject>) {
    return new RuntimeVersionString({
      ...this.value,
      ...newValue
    });
  }

  toJSON(): RuntimeVersionStringObject {
    const rawVersion = this.toString();
    return {
      version: rawVersion,
      track: this.value.track,
      buildNr: this.value.buildNr,
      buildMeta: this.value.buildMeta || null,
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
          (exists(this.value.buildNr) ? '+' + this.value.buildNr : '') +
          (exists(this.value.buildMeta) ? '.' + this.value.buildMeta : '')
      ).raw;
    } catch (e) {
      return '';
    }
  }

  static empty() {
    return new RuntimeVersionString({ major: null, minor: null, patch: null, track: 'dev' });
  }

  static parseBuildString(buildString: string | string[]): BuildStringComponent {
    let buildObject = typeof buildString == 'string' ? buildString.split('.') : (buildString as string[]);
    if (typeof buildString == 'string') {
      buildObject = buildString.split('.');
    }
    let buildNr = buildObject.shift(); // Removes first value
    if (buildNr == '') {
      buildNr = null;
    }
    const buildMeta = buildObject.length > 0 ? buildObject.join('.') : null;
    return { buildNr, buildMeta };
  }
}
