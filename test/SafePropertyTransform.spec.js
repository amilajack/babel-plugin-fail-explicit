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
        import { safePropertyAccess as _safePropertyAccess } from "safe-access-check";
        import { safeCoerce as _safeCoerce } from "safe-access-check";

        const some = {
        foo: 'doo'
        };
        _safePropertyAccess(["foo"], some);
      `));
    });

    it('should safely transform AssignmentExpression', () => {
      expect(transform(`
        const some = {
          foo: 'doo'
        }
        some.foo = 'some'
      `))
      .toEqual(dedent(`
        import { safePropertyAccess as _safePropertyAccess } from "safe-access-check";
        import { safeCoerce as _safeCoerce } from "safe-access-check";

        const some = {
        foo: 'doo'
        };
        some.foo = 'some';
      `));

      expect(transform(`
        const some = {
          foo: 'doo'
        }
        some.foo = some.doo
      `))
      .toEqual(dedent(`
        import { safePropertyAccess as _safePropertyAccess } from "safe-access-check";
        import { safeCoerce as _safeCoerce } from "safe-access-check";

        const some = {
        foo: 'doo'
        };
        some.foo = _safePropertyAccess(["doo"], some);
      `));

      expect(transform(`
        const some = {
          foo: 'doo'
        }
        some.foo.moo = some.doo
      `))
      .toEqual(dedent(`
        import { safePropertyAccess as _safePropertyAccess } from "safe-access-check";
        import { safeCoerce as _safeCoerce } from "safe-access-check";

        const some = {
        foo: 'doo'
        };
        _safePropertyAccess(["foo"], some).moo = _safePropertyAccess(["doo"], some);
      `));
    });

    it('should perform basic array access transform', () => {
      expect(transform(`
        const some = []
        some[0]
      `))
      .toEqual(dedent(`
        import { safePropertyAccess as _safePropertyAccess } from "safe-access-check";
        import { safeCoerce as _safeCoerce } from "safe-access-check";

        const some = [];
        _safePropertyAccess([0], some);
      `));
    });
  });
});
