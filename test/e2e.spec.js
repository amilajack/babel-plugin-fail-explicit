// import { execSync } from 'child_process';
import dedent from 'dedent';
import { transform } from './SafeCoercionTransformation.spec';


describe('e2e', () => {
  // beforeAll(() => {
  //   execSync('git clone https://github.com/amilajack/async.git ./e2e/object-assign');
  // });
  it('should test multiple exports', () => {
    expect(transform(
      `
// @flow
import SumTimelineMethod from '../LeetCode/Easy/371';
import ZigZag from '../LeetCode/Easy/6';
import SingleNumber from '../LeetCode/Easy/136';
import CanWinNim from '../LeetCode/Easy/292';


describe('LeetCode', () => {
  test('SumTimelineMethod()', () => {
    expect(SumTimelineMethod(1, -1)).toEqual(0);
    expect(SumTimelineMethod(-1, 1)).toEqual(0);
    expect(SumTimelineMethod(1, 2)).toEqual(3);
    expect(SumTimelineMethod(10, 20)).toEqual(30);
  });

  test('ZigZag', () => {
    expect(ZigZag('PAYPALISHIRING', 3)).toEqual('PAHNAPLSIIGYIR');
    expect(ZigZag('ABC', 2)).toEqual('ACB');
    expect(ZigZag('ABC', 3)).toEqual('ABC');
  });

  test('SingleNumber()', () => {
    expect(SingleNumber([1])).toEqual(1);
    expect(SingleNumber([1, 1, 2, 2, 3, 3, 4])).toEqual(4);
  });

  test('CanWinNim()', () => {
    expect(CanWinNim(4)).toEqual(false);
  });
});`
    ))
    .toEqual(dedent(
      `
// @flow
import SumTimelineMethod from '../LeetCode/Easy/371';
import ZigZag from '../LeetCode/Easy/6';
import SingleNumber from '../LeetCode/Easy/136';
import CanWinNim from '../LeetCode/Easy/292';

require("safe-access-check")

describe('LeetCode', () => {
  test('SumTimelineMethod()', () => {
    expect(SumTimelineMethod(1, -1)).toEqual(0);
    expect(SumTimelineMethod(-1, 1)).toEqual(0);
    expect(SumTimelineMethod(1, 2)).toEqual(3);
    expect(SumTimelineMethod(10, 20)).toEqual(30);
  });

  test('ZigZag', () => {
    expect(ZigZag('PAYPALISHIRING', 3)).toEqual('PAHNAPLSIIGYIR');
    expect(ZigZag('ABC', 2)).toEqual('ACB');
    expect(ZigZag('ABC', 3)).toEqual('ABC');
  });

  test('SingleNumber()', () => {
    expect(SingleNumber([1])).toEqual(1);
    expect(SingleNumber([1, 1, 2, 2, 3, 3, 4])).toEqual(4);
  });

  test('CanWinNim()', () => {
    expect(CanWinNim(4)).toEqual(false);
  });
});`
    ));
  });
});
