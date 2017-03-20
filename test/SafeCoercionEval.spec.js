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
