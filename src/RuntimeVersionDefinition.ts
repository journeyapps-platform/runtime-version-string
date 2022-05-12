export enum Track {
  DEV = 'dev',
  ALPHA = 'alpha',
  BETA = 'beta',
  RC = 'rc',
  STABLE = 'stable',
}

export const KNOWN_TRACKS: Track[] = Object.values(Track);

export enum ErrorCodes {
  INVALID_INPUT = 'INVALID_INPUT',
  NOT_RECOGNISED_TRACK = 'NOT_RECOGNISED_TRACK',
  NO_BUILD_NR_ON_STABLE = 'NO_BUILD_NR_ON_STABLE',
  BUILD_NR_REQUIRED_FOR_NON_STABLE_TRACK = 'BUILD_NR_REQUIRED_FOR_NON_STABLE_TRACK',
  BUILD_NR_INVALID = 'BUILD_NR_INVALID',
  BRANCHES_ON_DEV_TRACK_ONLY = 'BRANCHES_ON_DEV_TRACK_ONLY',
}

export interface VersionString {
  major: string;
  minor: string;
  patch: string;
  track: Track;
  buildNr?: string;
  buildMeta?: string;
  branch?: string;
}

export interface IRuntimeVersionString extends VersionString {
  base: string;
  buildString: string;
}

export type SomeRuntimeValues = Partial<IRuntimeVersionString>;

export interface RuntimeVersionStringDef {
  version: string;
  track: Track;
  buildNr: string;
  buildMeta: string;
  branch: string;
}

export interface BuildString {
  buildNr?: string;
  buildMeta?: string;
}
