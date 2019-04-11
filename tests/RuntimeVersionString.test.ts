import { RuntimeVersionString, parse, ErrorCodes } from '../src/RuntimeVersionString';

describe('RuntimeVersionString', () => {
  it('parses as expected', () => {
    const first = '1.2.3-beta+1';
    const second = '1.2.3-dev.something-else-here+12';
    const third = '1.3.3-rc+1';
    const fourth = '1.2.3-dev.something-else-here+12.abcdef1.2019-04-09';

    const c1 = parse(first);
    const c2 = parse(second);
    const c3 = parse(third);
    const c4 = parse(fourth);

    expect(c1).toBeInstanceOf(RuntimeVersionString);

    expect(c1.major).toBe('1');
    expect(c1.minor).toBe('2');
    expect(c1.patch).toBe('3');
    expect(c1.track).toBe('beta');
    expect(c1.buildNr).toBe('1');
    expect(c1.buildMeta).toBeNull();
    expect(c1.branch).toBeUndefined();
    expect(c1.buildString).toBe('1');
    expect(c1.toString()).toBe(first);

    expect(c2.major).toBe('1');
    expect(c2.minor).toBe('2');
    expect(c2.patch).toBe('3');
    expect(c2.track).toBe('dev');
    expect(c2.branch).toBe('something-else-here');
    expect(c2.buildNr).toBe('12');
    expect(c2.buildString).toBe('12');
    expect(c2.toString()).toBe(second);

    expect(c3.major).toBe('1');
    expect(c3.minor).toBe('3');
    expect(c3.patch).toBe('3');
    expect(c3.track).toBe('rc');
    expect(c3.buildNr).toBe('1');
    expect(c3.buildString).toBe('1');
    expect(c3.toString()).toBe(third);

    expect(c4.buildNr).toBe('12');
    expect(c4.buildMeta).toBe('abcdef1.2019-04-09');
    expect(c4.buildString).toBe('12.abcdef1.2019-04-09');
    expect(c4.toString()).toBe(fourth);

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
  });

  it('throws as expected', () => {
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
  });
});
