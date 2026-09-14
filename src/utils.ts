import { ErrorCodes, KNOWN_TRACKS, SomeRuntimeValues, Track } from './RuntimeVersionDefinition';

export const isValidBuildNr = (string: string) => /^[0-9]+$/.test(string);

export type Predicate<T> = (v: T) => boolean;
export type PredicateCodePair = [Predicate<SomeRuntimeValues>, string];

export function throwErrorIf(predicateMessagePair: PredicateCodePair, value: SomeRuntimeValues) {
  const [predicate, message] = predicateMessagePair;
  if (predicate(value)) {
    throw new Error(
      `${message}. "${JSON.stringify(
        value
      )}" failed checks. Please see https://github.com/journeyapps-platform/runtime-version-string for a list of runtime version string requirements.`
    );
  }
}

export function throwIfChecksFail(value: SomeRuntimeValues) {
  checksAndCodesPairs.forEach((pair) => {
    throwErrorIf(pair, value);
  });
}

const exists = <T>(value: T): value is NonNullable<T> => value != null;

/* prettier-ignore */
export const checksAndCodesPairs: [Predicate<SomeRuntimeValues>, string][] = [
    [v => !KNOWN_TRACKS.find(track => track === v.track),       ErrorCodes.NOT_RECOGNISED_TRACK],
    [v => v.track === Track.STABLE && exists(v.buildNr),            ErrorCodes.NO_BUILD_NR_ON_STABLE],
    [v => v.track !== Track.STABLE && !exists(v.buildNr),           ErrorCodes.BUILD_NR_REQUIRED_FOR_NON_STABLE_TRACK],
    [v => v.track !== Track.DEV && exists(v.branch),                ErrorCodes.BRANCHES_ON_DEV_TRACK_ONLY],
    [v => exists(v.buildNr) && !isValidBuildNr(v.buildNr),      ErrorCodes.BUILD_NR_INVALID]
];

export function isDevBundledRuntime(value: string) {
  let DEV_BUNDLED_REGEX = /^(\d)+\.(\d)+\.(\d)-dev.(\w){5,}\.(\w){5,}$/;
  return !!value.match(DEV_BUNDLED_REGEX);
}
