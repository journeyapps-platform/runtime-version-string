import { describe, expect, expectTypeOf, it } from 'vitest';
import { ErrorCodes, parse, RuntimeVersionString, RuntimeVersionStringException, Track } from '../src';
import { throwIfChecksFail } from '../src/utils';

describe('RuntimeVersionStringException', () => {
  it.each([
    {
      name: 'invalid input',
      test: () => parse('invalid'),
      code: ErrorCodes.INVALID_INPUT
    },
    {
      name: 'unknown track',
      test: () => parse('1.2.3-unknown+1'),
      code: ErrorCodes.NOT_RECOGNISED_TRACK
    },
    {
      name: 'stable build number',
      test: () => parse('1.2.3+1'),
      code: ErrorCodes.NO_BUILD_NR_ON_STABLE
    },
    {
      name: 'missing build number',
      test: () => parse('1.2.3-beta'),
      code: ErrorCodes.BUILD_NR_REQUIRED_FOR_NON_STABLE_TRACK
    },
    {
      name: 'invalid build number',
      test: () => parse('1.2.3-beta+invalid'),
      code: ErrorCodes.BUILD_NR_INVALID
    },
    {
      name: 'branch on beta',
      test: () => parse('1.2.3-beta.branch+1'),
      code: ErrorCodes.BRANCHES_ON_DEV_TRACK_ONLY
    },
    {
      name: 'direct build parsing',
      test: () => RuntimeVersionString.parseBuildString('invalid'),
      code: ErrorCodes.BUILD_NR_INVALID
    },
    {
      name: 'unknown track takes precedence over an invalid build number',
      test: () => parse('1.1.1-bet-asd.what.f+a'),
      code: ErrorCodes.NOT_RECOGNISED_TRACK
    },
    {
      name: 'explicit stable track with a build number',
      test: () => parse('1.2.3-stable+1'),
      code: ErrorCodes.NO_BUILD_NR_ON_STABLE
    },
    {
      name: 'build number exceeding safe integer precision',
      test: () => parse('1.2.3-beta+9007199254740992'),
      code: ErrorCodes.BUILD_NR_INVALID
    },
    {
      name: 'invalid alpha build number',
      test: () => parse('1.2.3-alpha.invalid'),
      code: ErrorCodes.BUILD_NR_INVALID
    },
    {
      name: 'negative build number',
      test: () => RuntimeVersionString.parseBuildString('-1'),
      code: ErrorCodes.BUILD_NR_INVALID
    },
    {
      name: 'scientific notation build number',
      test: () => RuntimeVersionString.parseBuildString('1e3'),
      code: ErrorCodes.BUILD_NR_INVALID
    },
    {
      name: 'infinite build number',
      test: () => RuntimeVersionString.parseBuildString('Infinity'),
      code: ErrorCodes.BUILD_NR_INVALID
    },
    {
      name: 'whitespace in a build number',
      test: () => RuntimeVersionString.parseBuildString(' 1'),
      code: ErrorCodes.BUILD_NR_INVALID
    },
    {
      name: 'numeric build validation',
      test: () => throwIfChecksFail({ track: Track.BETA, buildNr: -1 }),
      code: ErrorCodes.BUILD_NR_INVALID
    }
  ])('exposes the exception type and code for $name', ({ test, code }) => {
    expect.assertions(5);
    try {
      test();
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(RuntimeVersionStringException);
      if (!(error instanceof RuntimeVersionStringException)) {
        throw error;
      }
      expectTypeOf(error.code).toEqualTypeOf<ErrorCodes>();
      expect(error.name).toBe('RuntimeVersionStringException');
      expect(error.code).toBe(code);
      expect(error.message.startsWith(code)).toBe(true);
    }
  });
});
