import * as babel from 'babel-core';
import { expect as chaiExpect } from 'chai';
import babelPluginFailExplicit from '../src/index';


/* eslint no-eval: 0, import/prefer-default-export: 0 */

export const babelConfig = {
  compact: false,
  sourceType: 'module',
  plugins: [
    [babelPluginFailExplicit, {
      commonJSImports: true
    }]
  ],
  generatorOpts: {
    quotes: 'double',
    compact: false
  }
};

export function transform(code: string): string {
  return babel.transform(
    code,
    babelConfig
  )
  .code;
}

describe('SafeCoercionEval', () => {
  describe('Comparison', () => {
    it('should allow for greater than comparison', () => {
      expect(eval(transform(
        `
        (() => {
          return 'b' > 'aaa'
        })()
        `
      )))
      .toEqual(true);

      expect(eval(transform(
        `
        (() => {
          const foo = 1
          const bar = 1
          return foo + bar
        })()
        `
      )))
      .toEqual(2);

      expect(eval(transform(
        `
        (() => {
          const foo = 2
          const bar = 1
          return foo >= bar
        })()
        `
      )))
      .toEqual(true);
    });

    it('should fail on comparison of unexpected types', () => {
      chaiExpect(() => {
        eval(transform(
          `
          (() => {
            const foo = {}
            const bar = []
            return foo + bar
          })()
          `
        ));
      })
      .to.throw(TypeError, 'Unexpected coercion of type "Object" and type "Array" using "+" operator');
    });
  });

  it('should not fail on safe coercion', () => {
    expect(eval(transform(`
      var array = 'some';
      var obj = 12;
      array + obj;
    `)))
    .toEqual('some12');
  });

  it('should not fail on template literal coercion', () => {
    /* eslint no-template-curly-in-string: 0 */
    expect(eval(transform(
      [
        '(() => {',
        'const some = { doo: "foo" };',
        'return `${some.doo}foo`;',
        '})()'
      ]
      .join('')
    )))
    .toEqual('foofoo');
  });

  it('should fail on coercion with += operator', () => {
    chaiExpect(() => {
      eval(transform(`
        let some = {};
        some += 'moo';
      `));
    })
    .to.throw(TypeError, 'Unexpected coercion of type "Object" and type "string" using "+=" operator');
  });

  it('should fail on coercion in constructor', () => {
    chaiExpect(() => {
      eval(transform(`
        new String('some' + {})
      `));
    })
    .to.throw(TypeError, 'Unexpected coercion of type "string" and type "Object" using "+" operator');
  });

  it('should pass on coercion of new String() concatenation', () => {
    eval(transform(`
      (new String('some' + 'some')) + (new String('some' + 'some'))
    `));
  });

  it('should fail with new operator', () => {
    chaiExpect(() => {
      eval(transform(`
        (new Array()) + (new Array())
      `));
    })
    .to.throw(TypeError, 'Unexpected coercion of type "Array" and type "Array" using "+" operator');
  });

  it('should fail with null', () => {
    chaiExpect(() => {
      eval(transform(`
        (null) + (null)
      `));
    })
    .to.throw(TypeError, 'Unexpected coercion of type "null" and type "null" using "+" operator');
  });

  it('should fail with NaN', () => {
    chaiExpect(() => {
      eval(transform(`
        (NaN) + (NaN)
      `));
    })
    .to.throw(TypeError, 'Unexpected coercion of type "NaN" and type "NaN" using "+" operator');
  });

  it('should fail with undefined', () => {
    chaiExpect(() => {
      eval(transform(`
        (undefined) + (undefined)
      `));
    })
    .to.throw(TypeError, 'Unexpected coercion of type "undefined" and type "undefined" using "+" operator');
  });

  it('should not fail on safe coercion in function declaration', () => {
    expect(eval(transform(`
      function some() {
        var array = 'some';
        var obj = 12;
        return array + obj;
      }
      some()
    `)))
    .toEqual('some12');
  });

  it('should throw error on unsafe coercion', () => {
    chaiExpect(() => {
      eval(transform(`
        var array = [];
        var obj = {};
        array + obj;
      `));
    })
    .to.throw(TypeError, 'Unexpected coercion of type "Array" and type "Object" using "+" operator');

    chaiExpect(() => {
      eval(transform(`
        var array = function () { return [] };
        var obj = function () { return {} };
        array() + obj();
      `));
    })
    .to.throw(TypeError, 'Unexpected coercion of type "Array" and type "Object" using "+" operator');
  });

  it('should fail on unsafe coercion in function declaration', () => {
    chaiExpect(() => {
      eval(transform(`
        function some() {
          var array = [];
          var obj = {};
          return array + obj;
        }
        some()
      `));
    })
    .to.throw(TypeError, 'Unexpected coercion of type "Array" and type "Object" using "+" operator');
  });
});
