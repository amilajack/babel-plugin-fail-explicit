import * as babel from 'babel-core';
import dedent from 'dedent';
import babelPluginFailExplicit from '../src/index';


/* eslint no-eval: 0, import/prefer-default-export: 0 */

export const babelConfig = {
  compact: false,
  sourceType: 'module',
  plugins: [
    babelPluginFailExplicit
  ],
  generatorOpts: {
    quotes: 'double',
    compact: false
  }
};

export function transform(code: string): string {
  return dedent(babel.transform(
    code,
    babelConfig
  ).code);
}

describe('SafePropertyTransform', () => {
  describe('Basic', () => {
    it('should perform basic object access transform', () => {
      expect(transform(`
        const some = {
          foo: 'doo'
        }
        some.foo
      `))
      .toEqual(dedent(`
        var safePropertyAccess = require("safe-access-check").safePropertyAccess;

        var safeCoerce = require("safe-access-check").safeCoerce;

        const some = {
        foo: 'doo'
        };
        safePropertyAccess(["foo"], some);
      `));
    });

    it('should perform basic array access transform', () => {
      expect(transform(`
        const some = []
        some[0]
      `))
      .toEqual(dedent(`
        var safePropertyAccess = require("safe-access-check").safePropertyAccess;

        var safeCoerce = require("safe-access-check").safeCoerce;

        const some = [];
        safePropertyAccess([0], some);
      `));
    });
  });
});
