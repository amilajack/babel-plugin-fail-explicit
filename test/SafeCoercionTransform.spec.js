import * as babel from 'babel-core';
import dedent from 'dedent';
import babelPluginFailExplicit from '../src/index';


/* eslint import/prefer-default-export: 0 */

const babelConfig = {
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

describe('SafeCoercion', () => {
  describe('Comparison', () => {
    it('should fail on comparison of unexpected types', () => {
      expect(transform(
        `
        'b' > 'aaa';
        'some' > 'a';
        (() => {
          return 'b' > 'aaa'
        })()
        `
      ))
      .toEqual(dedent(
        `
        import { safePropertyAccess as _safePropertyAccess } from "safe-access-check";
        import { safeCoerce as _safeCoerce } from "safe-access-check";

        _safeCoerce('b', ">", 'aaa');
        _safeCoerce('some', ">", 'a');
        (() => {
        return _safeCoerce('b', ">", 'aaa');
        })();
        `
      ));
    });
  });

  it('should wrap safeCoerce on binary expressions', () => {
    expect(transform(
      `
      var array = [];
      var obj = {};
      array + obj;`
    ))
    .toEqual(dedent(
      `
      import { safePropertyAccess as _safePropertyAccess } from "safe-access-check";
      import { safeCoerce as _safeCoerce } from "safe-access-check";

      var array = [];
      var obj = {};
      _safeCoerce(array, "+", obj);
      `
    ));
  });

  it('should wrap expressions', () => {
    expect(transform(
      `
      var array = 1;
      var obj = '2';
      array + obj;
      `
    ))
    .toEqual(dedent(
      `
      import { safePropertyAccess as _safePropertyAccess } from "safe-access-check";
      import { safeCoerce as _safeCoerce } from "safe-access-check";

      var array = 1;
      var obj = '2';
      _safeCoerce(array, "+", obj);
      `
    ));
  });

  it('should wrap function expressions', () => {
    expect(transform(
      `
      var fn1 = function () {};
      var fn2 = function () {};
      fn1 + fn2;
      `
    ))
    .toEqual(dedent(
      `
      import { safePropertyAccess as _safePropertyAccess } from "safe-access-check";
      import { safeCoerce as _safeCoerce } from "safe-access-check";

      var fn1 = function () {};
      var fn2 = function () {};
      _safeCoerce(fn1, "+", fn2);
      `
    ));
  });

  it('should wrap parenthesizedExpression expressions', () => {
    expect(transform(
      `
      (fn1 + fn2);
      `
    ))
    .toEqual(dedent(
      `
      import { safePropertyAccess as _safePropertyAccess } from "safe-access-check";
      import { safeCoerce as _safeCoerce } from "safe-access-check";

      _safeCoerce(fn1, "+", fn2);
      `
    ));
  });

  it('should wrap return statements', () => {
    expect(transform(
      'function some() { return fn1 + fn2; }'
    ))
    .toEqual(dedent(
      // Don't fix the spacing in this test. Cant get it to work without it
      `
      import { safePropertyAccess as _safePropertyAccess } from "safe-access-check";
      import { safeCoerce as _safeCoerce } from "safe-access-check";
      function some() {
      return _safeCoerce(fn1, "+", fn2);
      }`
    ));
  });

  it('should wrap nested expressions', () => {
    expect(transform(`
      fn1(fn1 + fn2, fn1 + fn2);
    `))
    .toEqual(dedent(
      `
      import { safePropertyAccess as _safePropertyAccess } from "safe-access-check";
      import { safeCoerce as _safeCoerce } from "safe-access-check";

      fn1(_safeCoerce(fn1, "+", fn2), _safeCoerce(fn1, "+", fn2));
      `
    ));

    expect(transform(
      `
      fn1(
        fn1(fn1 + fn2) +
        fn1(fn1 + fn2)
      );
      `
    ))
    .toEqual(dedent(
      `
      import { safePropertyAccess as _safePropertyAccess } from "safe-access-check";
      import { safeCoerce as _safeCoerce } from "safe-access-check";

      fn1(_safeCoerce(fn1(_safeCoerce(fn1, "+", fn2)), "+", fn1(_safeCoerce(fn1, "+", fn2))));
      `
    ));

    expect(transform(
      `
      fn1(fn1(fn1 + fn2));
      `
    ))
    .toEqual(dedent(
      `
      import { safePropertyAccess as _safePropertyAccess } from "safe-access-check";
      import { safeCoerce as _safeCoerce } from "safe-access-check";

      fn1(fn1(_safeCoerce(fn1, "+", fn2)));
      `
    ));
  });

  describe('Avoid Unrelated Binary Expressions', () => {
    it('should not transform "instanceof" BinaryExpression', () => {
      expect(transform(
        'some instanceof foo;'
      ))
      .toEqual(dedent(
        `
        import { safePropertyAccess as _safePropertyAccess } from "safe-access-check";
        import { safeCoerce as _safeCoerce } from "safe-access-check";
        some instanceof foo;
        `
      ));
    });

    it('should not transform "===" BinaryExpression', () => {
      expect(transform(
        'some === foo;'
      ))
      .toEqual(dedent(
        `
        import { safePropertyAccess as _safePropertyAccess } from "safe-access-check";
        import { safeCoerce as _safeCoerce } from "safe-access-check";
        some === foo;
        `
      ));
    });

    it('should not transform "==" BinaryExpression', () => {
      expect(transform(
        'some == foo;'
      ))
      .toEqual(dedent(
        `
        import { safePropertyAccess as _safePropertyAccess } from "safe-access-check";
        import { safeCoerce as _safeCoerce } from "safe-access-check";
        some == foo;
        `
      ));
    });

    it('should not transform "!==" BinaryExpression', () => {
      expect(transform(
        'some !== foo;'
      ))
      .toEqual(dedent(
        `
        import { safePropertyAccess as _safePropertyAccess } from "safe-access-check";
        import { safeCoerce as _safeCoerce } from "safe-access-check";
        some !== foo;
        `
      ));
    });

    it('should not transform "!=" BinaryExpression', () => {
      expect(transform(
        'some != foo;'
      ))
      .toEqual(dedent(
        `
        import { safePropertyAccess as _safePropertyAccess } from "safe-access-check";
        import { safeCoerce as _safeCoerce } from "safe-access-check";
        some != foo;
        `
      ));
    });

    it('should not transform "in" BinaryExpression', () => {
      expect(transform(
        'some in foo;'
      ))
      .toEqual(dedent(
        `
        import { safePropertyAccess as _safePropertyAccess } from "safe-access-check";
        import { safeCoerce as _safeCoerce } from "safe-access-check";
        some in foo;
        `
      ));
    });
  });

  describe('Binary, Assignment, Unary Expressions', () => {
    it('should wrap += expression', () => {
      expect(transform(
        'obj += arr;'
      ))
      .toEqual(dedent(
        `
        import { safePropertyAccess as _safePropertyAccess } from "safe-access-check";
        import { safeCoerce as _safeCoerce } from "safe-access-check";
        _safeCoerce(obj, "+=", arr);
        `
      ));
    });

    it('should wrap -= expression', () => {
      expect(transform(
        'obj -= arr;'
      ))
      .toEqual(dedent(
        `
        import { safePropertyAccess as _safePropertyAccess } from "safe-access-check";
        import { safeCoerce as _safeCoerce } from "safe-access-check";
        _safeCoerce(obj, "-=", arr);
        `
      ));
    });

    it.skip('should wrap =- expression', () => {
      expect(transform(
        'obj =- arr;'
      ))
      .toEqual(dedent(
        `
        import { safePropertyAccess as _safePropertyAccess } from "safe-access-check";
        import { safeCoerce as _safeCoerce } from "safe-access-check";
        _safeCoerce(obj,"=-", arr);
        `
      ));
    });

    it.skip('should wrap =+ expression', () => {
      expect(transform(
        'obj =+ arr;'
      ))
      .toEqual(dedent(
        `
        import { safePropertyAccess as _safePropertyAccess } from "safe-access-check";
        import { safeCoerce as _safeCoerce } from "safe-access-check";
        _safeCoerce(obj,"=+", arr);
        `
      ));
    });
  });
});
