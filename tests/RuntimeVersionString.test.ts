import { RuntimeVersionString, parse } from '../src/RuntimeVersionString';

describe('RuntimeVersionString', () => {
  it('parses as expected', () => {
    const first = '1.2.3-beta+1';
    const second = '1.2.3-dev.something-else-here+12';
    const third = '1.2.3-stable+3333';
    const fourth = '1.2.3-rc';
    const fifth = '1.3.3-rc+1';

    const firstBroken = '1.1.1-beta-asd.what.f';
    const secondBroken = '1.1.1-notarealtrack.something-else-here+12';
    const thirdBroken = '1.1.1-beta';

    const c1 = parse(first);
    const c2 = parse(second);
    const c3 = parse(third);
    const c4 = parse(fourth, { buildNrOptional: true });
    const c5 = parse(fifth, { buildNrOptional: true });

    const c1Broken = parse(firstBroken);
    const c2Broken = parse(secondBroken);
    const c3Broken = parse(thirdBroken);

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

    expect(c3.major).toBe('1');
    expect(c3.minor).toBe('2');
    expect(c3.patch).toBe('3');
    expect(c3.track).toBe('stable');
    expect(c3.buildNr).toBe('3333');
    expect(c3.branch).toBeUndefined();

    expect(c4.major).toBe('1');
    expect(c4.minor).toBe('2');
    expect(c4.patch).toBe('3');
    expect(c4.track).toBe('rc');
    expect(c4.buildNr).toBeUndefined();

    expect(c5.major).toBe('1');
    expect(c5.minor).toBe('3');
    expect(c5.patch).toBe('3');
    expect(c5.track).toBe('rc');
    expect(c5.buildNr).toBe('1');

    expect(c1Broken).toBeNull();
    expect(c2Broken).toBeNull();
    expect(c3Broken).toBeNull();
  });
});
