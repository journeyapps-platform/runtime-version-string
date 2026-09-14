import { RuntimeVersionStringException } from './RuntimeVersionStringException';
import * as semver from 'semver';
import {
  BuildString,
  ErrorCodes,
  IRuntimeVersionString,
  RuntimeVersionStringDef,
  Track,
  VersionString
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
      return `${this.buildNr}`;
    }
  }

  modify(newValue: Partial<VersionString>): RuntimeVersionString {
    return new RuntimeVersionString({
      ...this.value,
      ...newValue
    });
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
    let buildObject = typeof buildString == 'string' ? buildString.split('.') : (buildString as string[]);
    if (typeof buildString == 'string') {
      buildObject = buildString.split('.');
    }
    const rawBuildNr = buildObject.shift();
    const buildNr = rawBuildNr === '' ? null : rawBuildNr == null ? undefined : Number(rawBuildNr);
    if (rawBuildNr != null && rawBuildNr !== '' && (!/^[0-9]+$/.test(rawBuildNr) || !Number.isSafeInteger(buildNr))) {
      throw new RuntimeVersionStringException(ErrorCodes.BUILD_NR_INVALID);
    }
    const buildMeta = buildObject.length > 0 ? buildObject.join('.') : null;
    return { buildNr, buildMeta };
  }
}
