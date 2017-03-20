import * as babel from 'babel-core';
import { expect as chaiExpect } from 'chai';
import babelPluginFailExplicit from '../src/index';


/* eslint no-eval: 0 */

const babelConfig = {
  compact: false,
  sourceType: 'module',
  presets: [
    'es2015'
  ],
  plugins: [
    'add-module-exports',
    babelPluginFailExplicit
  ],
  generatorOpts: {
    quotes: 'double',
    compact: false
  }
};

function transform(code: string): string {
  return babel.transform(
    code,
    babelConfig
  ).code;
}

describe('SafeCoercionEval', () => {
  it('should not fail on safe coercion', () => {
    expect(eval(transform(`
      var array = 'some';
      var obj = 12;
      array + obj;
    `)))
    .toEqual('some12');
  });

  it('should fail on coercion with += operator', () => {
    chaiExpect(() => {
      eval(transform(`
        let some = {};
        some += 'moo';
      `));
    })
    .to.throw(TypeError, 'Unexpected coercion of type "object" and type "string" using "+=" operator');
  });

  it('should fail on coercion in constructor', () => {
    chaiExpect(() => {
      eval(transform(`
        new String('some' + {})
      `));
    })
    .to.throw(TypeError, 'Unexpected coercion of type "string" and type "object" using "+" operator');
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
    .to.throw(TypeError, 'Unexpected coercion of type "array" and type "array" using "+" operator');
  });

  it('should fail with null', () => {
    chaiExpect(() => {
      eval(transform(`
        (null) + (null)
      `));
    })
    .to.throw(TypeError, 'Unexpected coercion of type "null" and type "null" using "+" operator');
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
    .to.throw(TypeError, 'Unexpected coercion of type "array" and type "object" using "+" operator');

    chaiExpect(() => {
      eval(transform(`
        var array = function () { return [] };
        var obj = function () { return {} };
        array() + obj();
      `));
    })
    .to.throw(TypeError, 'Unexpected coercion of type "array" and type "object" using "+" operator');
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
    .to.throw(TypeError, 'Unexpected coercion of type "array" and type "object" using "+" operator');
  });
});
