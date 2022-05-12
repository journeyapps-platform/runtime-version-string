import * as semver from 'semver';
import {
  BuildString,
  ErrorCodes,
  IRuntimeVersionString,
  RuntimeVersionStringDef,
  Track,
  VersionString,
} from './RuntimeVersionDefinition';

export class RuntimeVersionString implements IRuntimeVersionString {
  constructor(readonly value: VersionString) {}

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
      return this.buildNr;
    }
  }

  modify(newValue: Partial<VersionString>): RuntimeVersionString {
    return new RuntimeVersionString({
      ...this.value,
      ...newValue,
    });
  }

  toJSON(): RuntimeVersionStringDef {
    const rawVersion = this.toString();
    return {
      version: rawVersion,
      track: this.value.track,
      buildNr: this.value.buildNr,
      buildMeta: this.value.buildMeta || null,
      branch: this.value.branch || null,
    };
  }

  toString(): string {
    try {
      const majMinPat = this.value.major + '.' + this.value.minor + '.' + this.value.patch;

      if (this.track === 'stable') {
        return semver.parse(majMinPat).raw;
      }

      return semver.parse(
        majMinPat +
          '-' +
          this.value.track +
          (this.value.branch != null ? '.' + this.value.branch : '') +
          (this.value.buildNr != null ? '+' + this.buildString : '')
      ).raw;
    } catch (e) {
      return '';
    }
  }

  static empty() {
    return new RuntimeVersionString({ major: null, minor: null, patch: null, track: Track.DEV });
  }

  static isEmpty(runtimeVersion: RuntimeVersionString): boolean {
    if (!runtimeVersion) {
      throw new Error(ErrorCodes.INVALID_INPUT);
    }
    return (
      runtimeVersion.major == null &&
      runtimeVersion.minor == null &&
      runtimeVersion.patch == null &&
      runtimeVersion.branch == null &&
      runtimeVersion.buildString == null
    );
  }

  static parseBuildString(buildString: string | string[]): BuildString {
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
