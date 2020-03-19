// @flow
/* eslint no-eval: off, import/prefer-default-export: off */
import * as babel from '@babel/core';
import babelPluginFailExplicit from '../src';
import { configs, defaultConfig } from './SafeCoercionEval.spec';

// eslint-disable-next-line jest/no-export
export const babelConfig = {
  compact: false,
  sourceType: 'module',
  plugins: [
    '@babel/plugin-transform-modules-commonjs',
    babelPluginFailExplicit
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
        return babel.transformSync(code, { ...defaultConfig, ...config }).code;
      }
      describe('Basic Tests', () => {
        describe('Object Access', () => {
          it('should fail on incorrect property access', () => {
            expect(() => {
              eval(
                transform(`
                const some = {}
                some.soo
              `)
              );
            }).toThrow(TypeError, 'Property "soo" does not exist in "Object"');
          });
        });

        describe('Array Access', () => {
          it('should pass on in bound property access', () => {
            expect(() => {
              eval(
                transform(`
                const some = [[]]
                some[0]
              `)
              );
              eval(
                transform(`
                const some = [[[]]]
                some[0][0]
              `)
              );
            }).not.toThrow();
          });

          it('should pass on valid iife as property access', () => {
            expect(() => {
              transform(`
              (() => {
                const fn = () => 1
                const some = [1, 2]
                return some[fn()]
              })()
            `);
            }).not.toThrow();
          });

          it('should fail on out out of bounds property access', () => {
            expect(() => {
              eval(
                transform(`
                const some = []
                some[2]
              `)
              );
            }).toThrow(TypeError, '"Array[2]" is out of bounds');
          });

          it('should fail on multiple dimentional array access', () => {
            expect(() => {
              eval(
                transform(`
                const some = [[[]]]
                some[0][0][2]
              `)
              );
            }).toThrow(TypeError, '"Array[0][0][2]" is out of bounds');
          });

          it('should fail on out of bounds on new Array()', () => {
            expect(() => {
              eval(
                transform(`
                const some = new Array(3)
                some[10]
              `)
              );
            }).toThrow(TypeError, '"Array[10]" is out of bounds');
          });

          it('should pass on valid multiple dimentional array access', () => {
            expect(
              eval(
                transform(`
              (() => {
                const some = [[[['moo']]]]
                return some[0][0][0][0]
              })()
            `)
              )
            ).toEqual('moo');
          });
        });

        describe('Mixed Access', () => {
          it('should fail on incorrect property access', () => {
            expect(() => {
              eval(
                transform(`
                const some = {}
                some.soo
              `)
              );
            }).toThrow(TypeError, 'Property "soo" does not exist in "Object"');
          });

          it('should pass on valid property access', () => {
            expect(
              eval(
                transform(`
              (function() {
                const some = {some:[{doo:['moo']}]}
                return some.some[0].doo[0]
              })()
            `)
              )
            ).toEqual('moo');
          });
        });

        describe('Invalid Access', () => {
          it('should fail on NaN property access', () => {
            expect(() => {
              eval(
                transform(`
                const some = [0]
                some[NaN]
              `)
              );
            }).toThrow(
              TypeError,
              'Type "NaN" cannot be used to access "Array"'
            );
          });

          describe('Square Bracket Notation', () => {
            it('should access square bracket notation properties', () => {
              expect(() => {
                eval(
                  transform(`
                  const some = {}
                  some['foo']
                `)
                );
              }).toThrow(
                TypeError,
                'Property "foo" does not exist in "Object"'
              );
            });

            it('should access mixed properties', () => {
              expect(
                eval(
                  transform(`
                (function() {
                  const some = {
                    foo: {
                      bar: 'baz'
                    }
                  }
                  return some['foo'].bar
                })()
              `)
                )
              ).toEqual('baz');

              expect(
                eval(
                  transform(`
                (function() {
                  const some = {
                    foo: {
                      bar: [0, 1, 2]
                    }
                  }
                  return some['foo'].bar[0]
                })()
              `)
                )
              ).toEqual(0);
            });
          });

          describe('Class', () => {
            it('should fail on incorrect class instance property access', () => {
              expect(() => {
                eval(
                  transform(`
                  class Foo {
                    soo() {}
                  }
                  const some = new Foo()
                  some.loo
                `)
                );
              }).toThrow(
                TypeError,
                'Property "loo" does not exist in "Object"'
              );
              expect(() => {
                eval(
                  transform(`
                  class Foo {
                    soo() {}
                  }
                  Foo.loo
                `)
                );
              }).toThrow(
                TypeError,
                'Property "loo" does not exist in "Function"'
              );
            });

            it('should fail on incorrect class static property access', () => {
              expect(() => {
                eval(
                  transform(`
                  class Foo {
                    static soo() {}
                  }
                  const some = new Foo()
                  Foo.loo
                `)
                );
              }).toThrow(
                TypeError,
                'Property "loo" does not exist in "Function"'
              );
            });
          });
        });
      });

      describe('Default Value Propagation', () => {
        it('should propagate default values with "||"', () => {
          expect(
            eval(
              transform(`
            (() => {
              const some = {}
              return some.foo || 'bar'
            })()
          `)
            )
          ).toEqual('bar');
        });

        it('should propagate default values with "&&"', () => {
          expect(
            eval(
              transform(`
            (() => {
              const some = {}
              return some.foo && 'bar'
            })()
          `)
            )
          ).toEqual(undefined);
        });

        it('should propagate in conditional test', () => {
          expect(
            eval(
              transform(`
            (() => {
              const some = {}
              if (some.foo || some.bar || some.baz) {}
              return true
            })()
          `)
            )
          ).toEqual(true);

          expect(
            eval(
              transform(`
            (() => {
              const some = {}
              if (some.foo && some.bar && some.baz) {}
              return true
            })()
          `)
            )
          ).toEqual(true);
        });
      });

      describe('Conditional Expressions', () => {
        it('should evaluate conditional expressions', () => {
          expect(() => {
            eval(
              transform(`
              (() => {
                const some = {}
                return some.foo ? true : false
              })()
            `)
            );
          }).toThrow(TypeError, 'Property "foo" does not exist in "Object"');
        });

        it('should fail on unsafe conditional access', () => {
          expect(() => {
            eval(
              transform(`
              (() => {
                const some = {}
                if (some.some === true) {
                  return false
                }
                return true
              })()
            `)
            );
          }).toThrow(TypeError, 'Property "some" does not exist in "Object"');
        });
      });
    });
  }
});
