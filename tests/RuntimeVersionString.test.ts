import { RuntimeVersionString, parse, ErrorCodes } from '../src/RuntimeVersionString';

describe('RuntimeVersionString', () => {
  it('parses as expected', () => {
    const first = '1.2.3-beta+1';
    const second = '1.2.3-dev.something-else-here+12';
    const third = '1.3.3-rc+1';

    const c1 = parse(first);
    const c2 = parse(second);
    const c5 = parse(third);

    expect(c1).toBeInstanceOf(RuntimeVersionString);

    expect(c1.major).toBe('1');
    expect(c1.minor).toBe('2');
    expect(c1.patch).toBe('3');
    expect(c1.track).toBe('beta');
    expect(c1.buildNr).toBe('1');
    expect(c1.branch).toBeUndefined();

    expect(c2.major).toBe('1');
    expect(c2.minor).toBe('2');
    expect(c2.patch).toBe('3');
    expect(c2.track).toBe('dev');
    expect(c2.branch).toBe('something-else-here');
    expect(c2.buildNr).toBe('12');

    expect(c5.major).toBe('1');
    expect(c5.minor).toBe('3');
    expect(c5.patch).toBe('3');
    expect(c5.track).toBe('rc');
    expect(c5.buildNr).toBe('1');
  });

  it('throws as expected', () => {
    const firstBroken = '1.1.1-bet-asd.what.f+a';
    const secondBroken = '1.1.1-beta.branch-name+222';
    const thirdBroken = '1.2.3-stable+3333';
    const fourthBroken = '1.2.3-rc';
    const fifthBroken = '1.1.1-beta+a';
    const sixthBroken = '123';
    const seventhBroken = 'a';

    expect(() => parse(firstBroken)).toThrow(ErrorCodes.NOT_RECOGNISED_TRACK);
    expect(() => parse(secondBroken)).toThrow(ErrorCodes.BRANCHES_ON_DEV_TRACK_ONLY);
    expect(() => parse(thirdBroken)).toThrow(ErrorCodes.NO_BUILD_NR_ON_STABLE);
    expect(() => parse(fourthBroken)).toThrow(ErrorCodes.BUILD_NR_REQUIRED_FOR_NON_STABLE_TRACK);
    expect(() => parse(fifthBroken)).toThrow(ErrorCodes.BUILD_NR_NOT_NUMBERIC);
    expect(() => parse(sixthBroken)).toThrow(ErrorCodes.INVALID_INPUT);
    expect(() => parse(seventhBroken)).toThrow(ErrorCodes.INVALID_INPUT);
  });
});
