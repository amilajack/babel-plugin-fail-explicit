import * as babel from 'babel-core';
import { expect as chaiExpect } from 'chai';
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

describe('SafePropertyAccessEval', () => {
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
            .to.throw(TypeError, '"Array[0][0][2]" is out of bounds');
          });

          it('should fail on out of bounds on new Array()', () => {
            chaiExpect(() => {
              eval(transform(`
                const some = new Array(3)
                some[10]
              `));
            })
            .to.throw(TypeError, '"Array[10]" is out of bounds');
          });

          it('should pass on valid multiple dimentional array access', () => {
            chaiExpect(eval(transform(`
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
            chaiExpect(() => {
              eval(transform(`
                const some = {}
                some.soo
              `));
            })
            .to.throw(TypeError, 'Property "soo" does not exist in "Object"');
          });

          it('should pass on valid property access', () => {
            chaiExpect(eval(transform(`
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
                const some = [0]
                some[NaN]
              `));
            })
            .to.throw(TypeError, 'Type "NaN" cannot be used to access "Array"');
          });

          describe('Square Bracket Notation', () => {
            it('should access square bracket notation properties', () => {
              chaiExpect(() => {
                eval(transform(`
                  const some = {}
                  some['foo']
                `));
              })
              .to.throw(TypeError, 'Property "foo" does not exist in "Object"');
            });

            it('should access mixed properties', () => {
              chaiExpect(eval(transform(`
                (function() {
                  const some = {
                    foo: {
                      bar: 'baz'
                    }
                  }
                  return some['foo'].bar
                })()
              `)))
              .to.equal('baz');

              chaiExpect(eval(transform(`
                (function() {
                  const some = {
                    foo: {
                      bar: [0, 1, 2]
                    }
                  }
                  return some['foo'].bar[0]
                })()
              `)))
              .to.equal(0);
            });
          });

          describe('Class', () => {
            it('should fail on incorrect class instance property access', () => {
              chaiExpect(() => {
                eval(transform(`
                  class Foo {
                    soo() {}
                  }
                  const some = new Foo()
                  some.loo
                `));
              })
              .to.throw(TypeError, 'Property "loo" does not exist in "Object"');
              chaiExpect(() => {
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
              chaiExpect(() => {
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

      describe('Default Value Propagation', () => {
        it('should propagate default values with "||"', () => {
          chaiExpect(eval(transform(`
            (() => {
              const some = {}
              return some.foo || 'bar'
            })()
          `)))
          .to.equal('bar');
        });

        it('should propagate default values with "&&"', () => {
          chaiExpect(eval(transform(`
            (() => {
              const some = {}
              return some.foo && 'bar'
            })()
          `)))
          .to.equal(undefined);
        });

        it('should propagate in conditional test', () => {
          chaiExpect(eval(transform(`
            (() => {
              const some = {}
              if (some.foo || some.bar || some.baz) {}
              return true
            })()
          `)))
          .to.equal(true);

          chaiExpect(eval(transform(`
            (() => {
              const some = {}
              if (some.foo && some.bar && some.baz) {}
              return true
            })()
          `)))
          .to.equal(true);
        });
      });

      describe('Conditional Expressions', () => {
        it('should evaluate conditional expressions', () => {
          chaiExpect(() => {
            eval(transform(`
              (() => {
                const some = {}
                return some.foo ? true : false
              })()
            `));
          })
          .to.throw(TypeError, 'Property "foo" does not exist in "Object"');
        });

        it('should fail on unsafe conditional access', () => {
          chaiExpect(() => {
            eval(transform(`
              (() => {
                const some = {}
                if (some.some === true) {
                  return false
                }
                return true
              })()
            `));
          })
          .to.throw(TypeError, 'Property "some" does not exist in "Object"');
        });
      });
    });
  }
});
