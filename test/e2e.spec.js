import * as babel from 'babel-core';
import dedent from 'dedent';
import { defaultConfig } from './SafeCoercionEval.spec';


function transform(code: string): string {
  return babel.transform(
    code,
    defaultConfig
  )
  .code;
}

describe('e2e', () => {
  it.skip('should test multiple exports', () => {
    expect(transform(
      `
      foo(some.some, '+', 'doo')
      `
    ))
    .toEqual(dedent(`
      var safePropertyAccess = require("safe-access-check").safePropertyAccess;

      var safeCoerce = require("safe-access-check").safeCoerce;

      foo(safePropertyAccess(["some"], some), '+', 'doo');
    `));
  });
});
