import * as babel from 'babel-core';
import { expect as chaiExpect } from 'chai';
import babelPluginFailExplicit from '../src/index';


/* eslint no-eval: 0, import/prefer-default-export: 0 */

export const babelConfig = {
  compact: false,
  sourceType: 'module',
  presets: [
    'es2015'
  ],
  plugins: [
    babelPluginFailExplicit,
    'add-module-exports'
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
  ).code;
}

describe('Basic Tests', () => {
  describe('Object Access', () => {
    it('should fail on incorrect property access', () => {
      chaiExpect(() => {
        eval(transform(`
          const some = {}
          some.soo
        `));
      })
      .to.throw(TypeError, 'Property "soo" does not exist in "Object"');
    });
  });

  describe('Array Access', () => {
    it('should pass on in bound property access', () => {
      eval(transform(`
        const some = [[]]
        some[0]
      `));

      eval(transform(`
        const some = [[[]]]
        some[0][0]
      `));
    });

    it('should fail on out out of bounds property access', () => {
      chaiExpect(() => {
        eval(transform(`
          const some = []
          some[2]
        `));
      })
      .to.throw(TypeError, '"Array[2]" is out of bounds');
    });

    it('should fail on multiple dimentional array access', () => {
      chaiExpect(() => {
        eval(transform(`
          const some = [[[]]]
          some[0][0][2]
        `));
      })
      .to.throw(TypeError, '"Array[2]" is out of bounds');
    });

    it('should pass on valid multiple dimentional array access', () => {
      expect(eval(transform(`
        (() => {
          const some = [[[['moo']]]]
          return some[0][0][0]
        })()
      `)))
      .to.equal('moo');
    });
  });

  describe('Mixed Access', () => {
    it('should fail on incorrect property access', () => {
      chaiExpect(() => {
        eval(transform(`
          const some = {}
          some.soo
        `));
      })
      .to.throw(TypeError, 'Property "soo" does not exist in "Object"');
    });

    it('should pass on valid property access', () => {
      expect(eval(transform(`
        (function() {
          const some = {some:[{doo:['moo']}]}
          return some.some[0].doo[0]
        })()
      `)))
      .to.equal('moo');
    });
  });

  describe('Invalid Access', () => {
    it('should fail on NaN property access', () => {
      chaiExpect(() => {
        eval(transform(`
          const some = []
          some[NaN]
        `));
      })
      .to.throw(TypeError, 'Property "NaN" does not exist in "Array"');
    });

    it('should fail on undefined property access', () => {
      chaiExpect(() => {
        eval(transform(`
          const some = []
          some[undefined]
        `));
      })
      .to.throw(TypeError, 'Property "undefined" does not exist in "Array"');
    });

    it('should fail on null property access', () => {
      chaiExpect(() => {
        eval(transform(`
          const some = []
          some[null]
        `));
      })
      .to.throw(TypeError, 'Property "null" does not exist in "Array"');
    });

    it('should fail on object property access', () => {
      chaiExpect(() => {
        eval(transform(`
          const some = []
          some[{}]
        `));
      })
      .to.throw(TypeError, 'Property "{}" does not exist in "Array"');
    });
  });
});
