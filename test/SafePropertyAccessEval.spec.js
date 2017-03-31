import * as babel from 'babel-core';
import { expect } from 'chai';
import babelPluginFailExplicit from '../src/index';
import { configs, defaultConfig } from './SafeCoercionEval.spec';


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

describe('SafePropertyAccess', () => {
  for (const config of configs) {
    describe(`Config "${config.testConfigName}"`, () => {
      function transform(code: string): string {
        delete config.testConfigName;
        return babel.transform(
          code,
          Object.assign({}, defaultConfig, config)
        )
        .code;
      }
      describe('Basic Tests', () => {
        describe('Object Access', () => {
          it('should fail on incorrect property access', () => {
            expect(() => {
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

          it('should pass on valid iife as property access', () => {
            transform(`
              (() => {
                const fn = () => 1
                const some = [1, 2]
                return some[fn()]
              })()
            `);
          });

          it('should fail on out out of bounds property access', () => {
            expect(() => {
              eval(transform(`
                const some = []
                some[2]
              `));
            })
            .to.throw(TypeError, '"Array[2]" is out of bounds');
          });

          it('should fail on multiple dimentional array access', () => {
            expect(() => {
              eval(transform(`
                const some = [[[]]]
                some[0][0][2]
              `));
            })
            .to.throw(TypeError, '"Array[0][0][2]" is out of bounds');
          });

          it('should pass on valid multiple dimentional array access', () => {
            expect(eval(transform(`
              (() => {
                const some = [[[['moo']]]]
                return some[0][0][0][0]
              })()
            `)))
            .to.equal('moo');
          });
        });

        describe('Mixed Access', () => {
          it('should fail on incorrect property access', () => {
            expect(() => {
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
            expect(() => {
              eval(transform(`
                const some = [0]
                some[NaN]
              `));
            })
            .to.throw(TypeError, 'Property "NaN" does not exist in "Array[NaN]"');
          });

          describe('Class', () => {
            it('should fail on incorrect class instance property access', () => {
              expect(() => {
                eval(transform(`
                  class Foo {
                    soo() {}
                  }
                  const some = new Foo()
                  some.loo
                `));
              })
              .to.throw(TypeError, 'Property "loo" does not exist in "Object"');
              expect(() => {
                eval(transform(`
                  class Foo {
                    soo() {}
                  }
                  Foo.loo
                `));
              })
              .to.throw(TypeError, 'Property "loo" does not exist in "Function"');
            });

            it('should fail on incorrect class static property access', () => {
              expect(() => {
                eval(transform(`
                  class Foo {
                    static soo() {}
                  }
                  const some = new Foo()
                  Foo.loo
                `));
              })
              .to.throw(TypeError, 'Property "loo" does not exist in "Function"');
            });
          });
        });
      });
    });
  }
});
