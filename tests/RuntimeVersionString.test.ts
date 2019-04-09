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
    expect(c1.branch).toBeUndefined();
    expect(c1.hash).toBeUndefined();
    expect(c1.date).toBeUndefined();
    expect(c1.toString()).toBe(first);

    expect(c2.major).toBe('1');
    expect(c2.minor).toBe('2');
    expect(c2.patch).toBe('3');
    expect(c2.track).toBe('dev');
    expect(c2.branch).toBe('something-else-here');
    expect(c2.buildNr).toBe('12');
    expect(c2.hash).toBeUndefined();
    expect(c2.date).toBeUndefined();
    expect(c2.toString()).toBe(second);

    expect(c3.major).toBe('1');
    expect(c3.minor).toBe('3');
    expect(c3.patch).toBe('3');
    expect(c3.track).toBe('rc');
    expect(c3.buildNr).toBe('1');
    expect(c3.hash).toBeUndefined();
    expect(c3.date).toBeUndefined();
    expect(c3.toString()).toBe(third);

    expect(c4.buildNr).toBe('12');
    expect(c4.hash).toBe('abcdef1');
    expect(c4.date).toBe('2019-04-09');
    expect(c4.toString()).toBe(fourth);
  });

  it('throws as expected', () => {
    const firstBroken = '1.1.1-bet-asd.what.f+a';
    const secondBroken = '1.1.1-beta.branch-name+222';
    const thirdBroken = '1.2.3-stable+3333';
    const fourthBroken = '1.2.3-rc';
    const fifthBroken = '1.1.1-beta+A';
    const sixthBroken = '123';
    const seventhBroken = 'a';
    const eightBroken = '1.2.3-dev.something-else-here+12.zzzzz.2019-04-09';
    const ninethBroken = '1.2.3-dev.something-else-here+12.abcdef1.201904-09';
    // const c8 = parse(eightBroken);
    // expect(c8.hash).toBe('a');

    expect(() => parse(firstBroken)).toThrow(ErrorCodes.NOT_RECOGNISED_TRACK);
    expect(() => parse(secondBroken)).toThrow(ErrorCodes.BRANCHES_ON_DEV_TRACK_ONLY);
    expect(() => parse(thirdBroken)).toThrow(ErrorCodes.NO_BUILD_NR_ON_STABLE);
    expect(() => parse(fourthBroken)).toThrow(ErrorCodes.BUILD_NR_REQUIRED_FOR_NON_STABLE_TRACK);
    expect(() => parse(fifthBroken)).toThrow(ErrorCodes.BUILD_NR_INVALID);
    expect(() => parse(sixthBroken)).toThrow(ErrorCodes.INVALID_INPUT);
    expect(() => parse(seventhBroken)).toThrow(ErrorCodes.INVALID_INPUT);
    expect(() => parse(eightBroken)).toThrow(ErrorCodes.HASH_INVALID);
    expect(() => parse(ninethBroken)).toThrow(ErrorCodes.DATE_INVALID);
  });
});
