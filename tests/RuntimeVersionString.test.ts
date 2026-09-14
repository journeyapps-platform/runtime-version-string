import { describe, expect, expectTypeOf, it } from 'vitest';
import { RuntimeVersionString, parse, Track } from '../src';

describe('RuntimeVersionString', () => {
  it('exposes numeric components and supports numeric modifications', () => {
    const version = parse('10.20.30');
    expectTypeOf(version.major).toEqualTypeOf<number>();
    expectTypeOf(version.minor).toEqualTypeOf<number>();
    expectTypeOf(version.patch).toEqualTypeOf<number>();
    const updated = version.modify({ minor: version.minor + 1, patch: 0 });

    expect(updated.toString()).toBe('10.21.0');
    expect(version.toString()).toBe('10.20.30');
    expect(new RuntimeVersionString({ major: 0, minor: 0, patch: 0, track: Track.STABLE }).toString()).toBe('0.0.0');
  });

  it('uses numeric build numbers while preserving serialized build metadata', () => {
    const version = parse('1.2.3-beta+12.abcdef');
    expectTypeOf(version.buildNr).toEqualTypeOf<number | null | undefined>();
    expect(version.buildNr).toBe(12);
    expect(version.buildString).toBe('12.abcdef');
    expect(version.toJSON().buildNr).toBe(12);
    expect(version.modify({ buildNr: 13 }).toString()).toBe('1.2.3-beta+13.abcdef');
    expect(parse('1.2.3-beta+0').buildNr).toBe(0);
    expect(parse('1.2.3-beta+0012').toString()).toBe('1.2.3-beta+12');
    expect(parse('1.2.3-alpha.9').buildNr).toBe(9);
    expect(parse('1.2.3-beta+9007199254740991').buildNr).toBe(Number.MAX_SAFE_INTEGER);
  });

  it('preserves absent fields when serializing a stable version', () => {
    const version = parse('1.2.3');

    expect(version.buildString).toBeNull();
    expect(version.toJSON()).toEqual({
      version: '1.2.3',
      track: Track.STABLE,
      buildNr: undefined,
      buildMeta: null,
      branch: null
    });
  });

  it('serializes invalid numeric versions as an empty string', () => {
    expect(parse('1.2.3').modify({ major: NaN }).toString()).toBe('');
    expect(parse('1.2.3-beta+1').modify({ major: NaN }).toString()).toBe('');
  });

  it('should parse BETA as expected', () => {
    const first = '1.2.3-beta+1';
    const c1 = parse(first);
    expect(c1).toBeInstanceOf(RuntimeVersionString);

    expect(c1.base).toBe('1.2.3');
    expect(c1.major).toBe(1);
    expect(c1.minor).toBe(2);
    expect(c1.patch).toBe(3);
    expect(c1.track).toBe(Track.BETA);
    expect(c1.buildNr).toBe(1);
    expect(c1.buildMeta).toBeNull();
    expect(c1.branch).toBeNull();
    expect(c1.buildString).toBe('1');
    expect(c1.toString()).toBe(first);
  });

  it('should parse DEV as expected', () => {
    const second = '1.2.3-dev.something-else-here+12';
    const fourth = '1.2.3-dev.something-else-here+12.abcdef1.2019-04-09';

    const c2 = parse(second);

    expect(c2.base).toBe('1.2.3');
    expect(c2.major).toBe(1);
    expect(c2.minor).toBe(2);
    expect(c2.patch).toBe(3);
    expect(c2.track).toBe(Track.DEV);
    expect(c2.branch).toBe('something-else-here');
    expect(c2.buildNr).toBe(12);
    expect(c2.buildString).toBe('12');
    expect(c2.toString()).toBe(second);

    const c4 = parse(fourth);

    expect(c4.base).toBe('1.2.3');
    expect(c4.buildNr).toBe(12);
    expect(c4.buildMeta).toBe('abcdef1.2019-04-09');
    expect(c4.buildString).toBe('12.abcdef1.2019-04-09');
    expect(c4.toString()).toBe(fourth);
  });

  it('should parse RC as expected', () => {
    const third = '1.3.3-rc+1';
    const c3 = parse(third);

    expect(c3.base).toBe('1.3.3');
    expect(c3.major).toBe(1);
    expect(c3.minor).toBe(3);
    expect(c3.patch).toBe(3);
    expect(c3.track).toBe(Track.RC);
    expect(c3.buildNr).toBe(1);
    expect(c3.buildString).toBe('1');
    expect(c3.toString()).toBe(third);
  });

  it('should parse ALPHA as expected', () => {
    const version = '1.2.3-alpha.9';
    const expected = '1.2.3-alpha+9';
    const c5 = parse(version);

    //1.2.3-alpha.9
    expect(c5.base).toBe('1.2.3');
    expect(c5.major).toBe(1);
    expect(c5.minor).toBe(2);
    expect(c5.patch).toBe(3);
    expect(c5.track).toBe(Track.ALPHA);
    expect(c5.toString()).toBe(expected);
  });

  it('should build parse string as expected', () => {
    expect(RuntimeVersionString.parseBuildString('12.abcdef1.2019-04-09')).toEqual({
      buildNr: 12,
      buildMeta: 'abcdef1.2019-04-09'
    });
    expect(RuntimeVersionString.parseBuildString('12')).toEqual({
      buildNr: 12,
      buildMeta: null
    });
    expect(RuntimeVersionString.parseBuildString(['12'])).toEqual({
      buildNr: 12,
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
      buildNr: 12,
      buildMeta: 'abcdef1.2019-04-09'
    });
  });

  it('should fallback to a value of `stable` when track is not provided', () => {
    expect(parse('1.2.3').track).toBe(Track.STABLE);
    expect(parse('1.2.3').base).toBe('1.2.3');
    expect(parse('1.2.3-stable').track).toBe(Track.STABLE);
    expect(parse('1.2.3-beta+1').track).toBe(Track.BETA);
    expect(parse('1.2.3-alpha+1').track).toBe(Track.ALPHA);
  });

  it('should stringify versions as expected', () => {
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
    expect(parsed.major).toBe(4);
    expect(parsed.minor).toBe(58);
    expect(parsed.patch).toBe(6);
    expect(parsed.track).toBe(Track.DEV);
  });
});
