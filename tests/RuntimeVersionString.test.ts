import { describe, expect, it } from 'vitest';
import { RuntimeVersionString, parse, ErrorCodes, Track } from '../src';

describe('RuntimeVersionString', () => {
  it('should parse BETA as expected', () => {
    const first = '1.2.3-beta+1';
    const c1 = parse(first);
    expect(c1).toBeInstanceOf(RuntimeVersionString);

    expect(c1.base).toBe('1.2.3');
    expect(c1.major).toBe('1');
    expect(c1.minor).toBe('2');
    expect(c1.patch).toBe('3');
    expect(c1.track).toBe(Track.BETA);
    expect(c1.buildNr).toBe('1');
    expect(c1.buildMeta).toBeNull();
    expect(c1.branch).toBeNull();
    expect(c1.buildString).toBe('1');
    expect(c1.toString()).toBe(first);

    expect(RuntimeVersionString.isEmpty(c1)).toBe(false);
    const clearedC1 = c1.modify({
      major: null,
      minor: null,
      patch: null,
      branch: null,
      buildNr: null,
      buildMeta: null
    });
    expect(RuntimeVersionString.isEmpty(clearedC1)).toBe(true);
  });

  it('should parse DEV as expected', () => {
    const second = '1.2.3-dev.something-else-here+12';
    const fourth = '1.2.3-dev.something-else-here+12.abcdef1.2019-04-09';

    const c2 = parse(second);

    expect(c2.base).toBe('1.2.3');
    expect(c2.major).toBe('1');
    expect(c2.minor).toBe('2');
    expect(c2.patch).toBe('3');
    expect(c2.track).toBe(Track.DEV);
    expect(c2.branch).toBe('something-else-here');
    expect(c2.buildNr).toBe('12');
    expect(c2.buildString).toBe('12');
    expect(c2.toString()).toBe(second);
    expect(RuntimeVersionString.isEmpty(c2)).toBe(false);

    const c4 = parse(fourth);

    expect(c4.base).toBe('1.2.3');
    expect(c4.buildNr).toBe('12');
    expect(c4.buildMeta).toBe('abcdef1.2019-04-09');
    expect(c4.buildString).toBe('12.abcdef1.2019-04-09');
    expect(c4.toString()).toBe(fourth);
    expect(RuntimeVersionString.isEmpty(c4)).toBe(false);
  });

  it('should parse RC as expected', () => {
    const third = '1.3.3-rc+1';
    const c3 = parse(third);

    expect(c3.base).toBe('1.3.3');
    expect(c3.major).toBe('1');
    expect(c3.minor).toBe('3');
    expect(c3.patch).toBe('3');
    expect(c3.track).toBe(Track.RC);
    expect(c3.buildNr).toBe('1');
    expect(c3.buildString).toBe('1');
    expect(c3.toString()).toBe(third);
    expect(RuntimeVersionString.isEmpty(c3)).toBe(false);
  });

  it('should parse ALPHA as expected', () => {
    const version = '1.2.3-alpha.9';
    const expected = '1.2.3-alpha+9';
    const c5 = parse(version);

    //1.2.3-alpha.9
    expect(c5.base).toBe('1.2.3');
    expect(c5.major).toBe('1');
    expect(c5.minor).toBe('2');
    expect(c5.patch).toBe('3');
    expect(c5.track).toBe(Track.ALPHA);
    expect(c5.toString()).toBe(expected);
  });

  it('should build parse string as expected', () => {
    expect(RuntimeVersionString.parseBuildString('12.abcdef1.2019-04-09')).toEqual({
      buildNr: '12',
      buildMeta: 'abcdef1.2019-04-09'
    });
    expect(RuntimeVersionString.parseBuildString('12')).toEqual({
      buildNr: '12',
      buildMeta: null
    });
    expect(RuntimeVersionString.parseBuildString(['12'])).toEqual({
      buildNr: '12',
      buildMeta: null
    });
    expect(RuntimeVersionString.parseBuildString('')).toEqual({
      buildNr: null,
      buildMeta: null
    });
    expect(RuntimeVersionString.parseBuildString([''])).toEqual({
      buildNr: null,
      buildMeta: null
    });
    expect(RuntimeVersionString.parseBuildString(['12', 'abcdef1', '2019-04-09'])).toEqual({
      buildNr: '12',
      buildMeta: 'abcdef1.2019-04-09'
    });

    expect(RuntimeVersionString.isEmpty(RuntimeVersionString.empty())).toBe(true);
  });

  it('should throws as expected', () => {
    const firstBroken = '1.1.1-bet-asd.what.f+a';
    const secondBroken = '1.1.1-beta.branch-name+222';
    const thirdBroken = '1.2.3-stable+3333';
    const fourthBroken = '1.2.3-rc';
    const fifthBroken = '1.1.1-beta+A';
    const sixthBroken = '123';
    const seventhBroken = 'a';

    expect(() => parse(firstBroken)).toThrow(ErrorCodes.NOT_RECOGNISED_TRACK);
    expect(() => parse(secondBroken)).toThrow(ErrorCodes.BRANCHES_ON_DEV_TRACK_ONLY);
    expect(() => parse(thirdBroken)).toThrow(ErrorCodes.NO_BUILD_NR_ON_STABLE);
    expect(() => parse(fourthBroken)).toThrow(ErrorCodes.BUILD_NR_REQUIRED_FOR_NON_STABLE_TRACK);
    expect(() => parse(fifthBroken)).toThrow(ErrorCodes.BUILD_NR_INVALID);
    expect(() => parse(sixthBroken)).toThrow(ErrorCodes.INVALID_INPUT);
    expect(() => parse(seventhBroken)).toThrow(ErrorCodes.INVALID_INPUT);
    expect(() => RuntimeVersionString.isEmpty(null)).toThrow(ErrorCodes.INVALID_INPUT);
  });

  it('should fallback to a value of `stable` when track is not provided', () => {
    expect(parse('1.2.3').track).toBe(Track.STABLE);
    expect(parse('1.2.3').base).toBe('1.2.3');
    expect(parse('1.2.3-stable').track).toBe(Track.STABLE);
    expect(parse('1.2.3-beta+1').track).toBe(Track.BETA);
    expect(parse('1.2.3-alpha+1').track).toBe(Track.ALPHA);
  });

  it('should stringifies versions as expected', () => {
    const stable = '1.2.3';
    const stablePlus = '1.2.3-stable';
    const rc = '1.2.3-rc+1';
    const beta = '1.2.3-beta+1';
    const alpha = '1.2.3-alpha.1';
    const alphaExpected = '1.2.3-alpha+1';
    const dev = '1.2.3-dev+1.test.123';
    expect(parse(stable).toString()).toBe(stable);
    expect(parse(stablePlus).toString()).toBe(stable);
    expect(parse(rc).toString()).toBe(rc);
    expect(parse(beta).toString()).toBe(beta);
    expect(parse(dev).toString()).toBe(dev);
    expect(parse(alpha).toString()).toBe(alphaExpected);
  });

  it('should parse bundled runtime versions', () => {
    const bundledVersion = '4.58.6-dev.3dfa72698.d6eefc0';
    const parsed = parse(bundledVersion);
    expect(parsed.base).toBe('4.58.6');
    expect(parsed.major).toBe('4');
    expect(parsed.minor).toBe('58');
    expect(parsed.patch).toBe('6');
    expect(parsed.track).toBe(Track.DEV);
  });
});
