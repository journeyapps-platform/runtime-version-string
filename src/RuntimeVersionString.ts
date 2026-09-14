import { RuntimeVersionStringException } from './RuntimeVersionStringException';
import * as semver from 'semver';
import { isValidBranch, isValidBuildMetadata, parseBuildString, validateBuildNumber } from './utils';
import {
  BuildString,
  ErrorCodes,
  IRuntimeVersionString,
  KNOWN_TRACKS,
  RuntimeVersionStringDef,
  Track,
  VersionString
} from './RuntimeVersionDefinition';

export class RuntimeVersionString implements IRuntimeVersionString {
  readonly value: Readonly<VersionString>;

  constructor(value: VersionString) {
    this.value = Object.freeze({ ...value });
  }

  /**
   * Validate this version, throwing RuntimeVersionStringException on failure.
   */
  validate(): void {
    if (![this.major, this.minor, this.patch].every((component) => Number.isSafeInteger(component) && component >= 0)) {
      throw new RuntimeVersionStringException(
        ErrorCodes.INVALID_INPUT,
        'Version components must be non-negative safe integers'
      );
    }
    if (!KNOWN_TRACKS.includes(this.track)) {
      throw new RuntimeVersionStringException(ErrorCodes.NOT_RECOGNISED_TRACK, 'Unknown release track');
    }
    if (this.track === Track.STABLE && this.buildNr != null) {
      throw new RuntimeVersionStringException(
        ErrorCodes.NO_BUILD_NR_ON_STABLE,
        'Stable releases cannot have a build number'
      );
    }
    if (this.track !== Track.STABLE && this.buildNr == null) {
      throw new RuntimeVersionStringException(
        ErrorCodes.BUILD_NR_REQUIRED_FOR_NON_STABLE_TRACK,
        'Non-stable releases require a build number'
      );
    }
    if (this.track !== Track.DEV && this.branch != null) {
      throw new RuntimeVersionStringException(
        ErrorCodes.BRANCHES_ON_DEV_TRACK_ONLY,
        'Branches are only supported on the dev track'
      );
    }
    validateBuildNumber(this.buildNr);
    if (!isValidBranch(this.branch) || !isValidBuildMetadata(this.buildMeta, this.buildNr) || this.toString() === '') {
      throw new RuntimeVersionStringException(ErrorCodes.INVALID_INPUT, 'Invalid version branch or build metadata');
    }
  }

  get major() {
    return this.value.major;
  }

  get minor() {
    return this.value.minor;
  }

  get patch() {
    return this.value.patch;
  }

  get base() {
    return [this.major, this.minor, this.patch].join('.');
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
    if (this.buildNr == null) {
      return null;
    }
    if (this.buildMeta != null) {
      return this.buildNr + '.' + this.buildMeta;
    } else {
      return `${this.buildNr}`;
    }
  }

  modify(newValue: Partial<VersionString>): RuntimeVersionString {
    const version = new RuntimeVersionString({
      ...this.value,
      ...newValue
    });
    version.validate();
    return version;
  }

  toJSON(): RuntimeVersionStringDef {
    const rawVersion = this.toString();
    return {
      version: rawVersion,
      track: this.value.track,
      buildNr: this.value.buildNr,
      buildMeta: this.value.buildMeta || null,
      branch: this.value.branch || null
    };
  }

  toString(): string {
    try {
      const majMinPat = this.value.major + '.' + this.value.minor + '.' + this.value.patch;

      if (this.track === Track.STABLE) {
        return semver.parse(majMinPat)?.raw ?? '';
      }

      return (
        semver.parse(
          majMinPat +
            '-' +
            this.value.track +
            (this.value.branch != null ? '.' + this.value.branch : '') +
            (this.value.buildNr != null ? '+' + this.buildString : '')
        )?.raw ?? ''
      );
    } catch (e) {
      return '';
    }
  }

  static parseBuildString(buildString: string | string[]): BuildString {
    return parseBuildString(buildString);
  }
}
