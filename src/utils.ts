import { BuildString, ErrorCodes } from './RuntimeVersionDefinition';
import { RuntimeVersionStringException } from './RuntimeVersionStringException';

/**
 * Decode build fields without validating them. Invalid numeric text becomes NaN
 * so the version validator can report errors in its normal order.
 */
export function decodeBuildString(value: string | readonly string[]): BuildString {
  const [rawBuildNr, ...metadata] = typeof value === 'string' ? value.split('.') : value;
  const buildMeta = metadata.length > 0 ? metadata.join('.') : null;
  if (rawBuildNr === '') {
    return { buildNr: null, buildMeta };
  }
  if (rawBuildNr == null) {
    return { buildNr: undefined, buildMeta };
  }
  // Build numbers contain only decimal digits, with no sign, spaces, or exponent.
  if (!/^[0-9]+$/.test(rawBuildNr)) {
    return { buildNr: NaN, buildMeta };
  }
  return { buildNr: Number(rawBuildNr), buildMeta };
}

export function isDevBundledRuntime(value: string) {
  let DEV_BUNDLED_REGEX = /^(\d)+\.(\d)+\.(\d)-dev.(\w){5,}\.(\w){5,}$/;
  return !!value.match(DEV_BUNDLED_REGEX);
}

export function isValidBranch(branch: unknown): boolean {
  // One non-empty identifier containing only ASCII letters, digits, or hyphens (e.g. feature-123).
  return branch == null || (typeof branch === 'string' && /^[0-9A-Za-z-]+$/.test(branch));
}

export function isValidBuildMetadata(buildMeta: unknown, buildNr: BuildString['buildNr']): boolean {
  if (buildMeta == null) {
    return true;
  }
  // Dot-separated non-empty identifiers containing ASCII letters, digits, or hyphens (e.g. abc123.2026-09-14).
  return buildNr != null && typeof buildMeta === 'string' && /^[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*$/.test(buildMeta);
}

export function validateBuildNumber(buildNr: BuildString['buildNr']): void {
  if (buildNr != null && (!Number.isSafeInteger(buildNr) || buildNr < 0)) {
    throw new RuntimeVersionStringException(
      ErrorCodes.BUILD_NR_INVALID,
      'Build numbers must be non-negative safe integers'
    );
  }
}

export function parseBuildString(buildString: string | readonly string[]): BuildString {
  const decoded = decodeBuildString(buildString);
  validateBuildNumber(decoded.buildNr);
  return decoded;
}
