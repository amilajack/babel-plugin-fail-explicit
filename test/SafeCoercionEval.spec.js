// @flow
import * as babel from '@babel/core';
import babelPluginFailExplicit from '../src';

// eslint-disable-next-line jest/no-export
export const defaultConfig = {
  compact: false,
  sourceType: 'module',
  plugins: [
    '@babel/plugin-transform-modules-commonjs',
    [
      babelPluginFailExplicit,
      {
        commonJSImports: true
      }
    ]
  ],
  generatorOpts: {
    quotes: 'double',
    compact: false
  }
};

// eslint-disable-next-line jest/no-export
export const configs = [
  {
    testConfigName: 'default'
  },
  {
    testConfigName: 'commonjs',
    plugins: [
      [babelPluginFailExplicit, { commonJSImports: true }],
      '@babel/plugin-transform-modules-commonjs'
    ]
  },
  {
    testConfigName: 'env preset',
    presets: ['@babel/preset-env']
  },
  {
    testConfigName: 'babel preset node 4',
    presets: [['@babel/preset-env', { targets: { node: 8 } }]],
    plugins: [
      [babelPluginFailExplicit, { commonJSImports: true }],
      '@babel/plugin-transform-modules-commonjs'
    ]
  },
  {
    testConfigName: 'babel preset node 5',
    presets: [['@babel/preset-env', { targets: { node: 10 } }]],
    plugins: [
      [babelPluginFailExplicit, { commonJSImports: true }],
      '@babel/plugin-transform-modules-commonjs'
    ]
  },
  {
    testConfigName: 'babel preset node 6',
    presets: [['@babel/preset-env', { targets: { node: 12 } }]],
    plugins: [
      [babelPluginFailExplicit, { commonJSImports: true }],
      '@babel/plugin-transform-modules-commonjs'
    ]
  },
  {
    testConfigName: 'babel preset node 7',
    presets: [['@babel/preset-env', { targets: { node: 13 } }]],
    plugins: [
      [babelPluginFailExplicit, { commonJSImports: true }],
      '@babel/plugin-transform-modules-commonjs'
    ]
  },
  {
    testConfigName: '@babel/plugin-transform-modules-commonjs',
    plugins: [
      [babelPluginFailExplicit, { commonJSImports: true }],
      '@babel/plugin-transform-modules-commonjs'
    ]
  },
  {
    testConfigName: 'transform-flow-strip-types',
    presets: ['@babel/preset-env'],
    plugins: [
      [babelPluginFailExplicit, { commonJSImports: true }],
      '@babel/plugin-transform-flow-strip-types',
      '@babel/plugin-transform-modules-commonjs'
    ]
  },
  {
    testConfigName: 'add-module-exports',
    plugins: [
      [babelPluginFailExplicit, { commonJSImports: true }],
      'babel-plugin-add-module-exports',
      '@babel/plugin-transform-modules-commonjs'
    ]
  },
  // @TODO
  // {
  //   testConfigName: '@babel/plugin-transform-es2015-modules-umd',
  //   plugins: [
  //     [babelPluginFailExplicit, { commonJSImports: true }],
  //     '@babel/plugin-transform-es2015-modules-umd'
  //   ]
  // },
  {
    testConfigName: 'transform-async-to-bluebird',
    plugins: [
      [babelPluginFailExplicit, { commonJSImports: true }],
      '@babel/plugin-transform-modules-commonjs',
      'babel-plugin-transform-async-to-bluebird'
    ]
  }
];

const debug = false;

describe('SafeCoercionEval', () => {
  for (const config of configs) {
    describe(`Config "${config.testConfigName}"`, () => {
      function transform(source: string): string {
        const { testConfigName } = config;
        delete config.testConfigName;

        const { code } = babel.transform(source, {
          ...defaultConfig,
          ...config
        });

        if (debug) {
          console.log(`
            Config: ${testConfigName}, SOURCE:
            ===============================================
          `);
          console.log(source);
          console.log(`
            ===============================================
          `);
          console.log(`
            OUTPUT:
            ===============================================
          `);
          console.log(code);
          console.log(`
            ===============================================
          `);
        }

        return code;
      }

      describe('Multiple Operators', () => {
        it('should work with multiplication operator', () => {
          expect(() => {
            eval(
              transform(`
              'some' * 12;
            `)
            );
          }).toThrow(
            TypeError,
            'Unexpected coercion of type "string" and type "number" using "*" operator'
          );
        });

        it('should work with division operator', () => {
          expect(() => {
            eval(
              transform(`
              'some' / 12;
            `)
            );
          }).toThrow(
            TypeError,
            'Unexpected coercion of type "string" and type "number" using "/" operator'
          );
        });

        it('should work with exponent operator', () => {
          expect(() => {
            eval(
              transform(`
              'some' ** 12;
            `)
            );
          }).toThrow(
            TypeError,
            'Unexpected coercion of type "string" and type "number" using "**" operator'
          );
        });

        it('should work with subtraction operator', () => {
          expect(() => {
            eval(
              transform(`
              'some' - 12;
            `)
            );
          }).toThrow(
            TypeError,
            'Unexpected coercion of type "string" and type "number" using "-" operator'
          );
        });
      });

      describe('Comparison', () => {
        it('should allow for greater than comparison', () => {
          expect(
            eval(
              transform(`
            (() => {
              return 'b' > 'aaa'
            })()
            `)
            )
          ).toEqual(true);

          expect(
            eval(
              transform(`
            (() => {
              const foo = 1
              const bar = 1
              return foo <= bar
            })()
            `)
            )
          ).toEqual(true);

          expect(
            eval(
              transform(`
            (() => {
              const foo = 2
              const bar = 1
              return foo >= bar
            })()
            `)
            )
          ).toEqual(true);
        });

        it('should fail on comparison of unexpected types', () => {
          expect(() => {
            eval(
              transform(`
              (() => {
                const foo = {}
                const bar = []
                return foo >= bar
              })()
              `)
            );
          }).toThrow(
            TypeError,
            'Unexpected comparison of type "Object" and type "Array" using ">=" operator'
          );
        });
      });

      it('should not fail on safe coercion', () => {
        expect(
          eval(
            transform(`
          var array = 'some';
          var obj = 12;
          array + obj;
        `)
          )
        ).toEqual('some12');
      });

      it('should not fail on template literal coercion', () => {
        /* eslint no-template-curly-in-string: off */
        expect(
          eval(
            transform(
              [
                '(() => {',
                'const some = { doo: "foo" };',
                'return `${some.doo}foo`;',
                '})()'
              ].join('')
            )
          )
        ).toEqual('foofoo');
      });

      it('should fail on coercion with += operator', () => {
        expect(() => {
          eval(
            transform(`
            let some = {};
            some += 'moo';
          `)
          );
        }).toThrow(
          TypeError,
          'Unexpected coercion of type "Object" and type "string" using "+=" operator'
        );
      });

      it('should fail on coercion in constructor', () => {
        expect(() => {
          eval(
            transform(`
            new String('some' + {})
          `)
          );
        }).toThrow(
          TypeError,
          'Unexpected coercion of type "string" and type "Object" using "+" operator'
        );
      });

      it('should pass on coercion of new String() concatenation', () => {
        eval(
          transform(`
          (new String('some' + 'some')) + (new String('some' + 'some'))
        `)
        );
      });

      it('should fail with new operator', () => {
        expect(() => {
          eval(
            transform(`
            (new Array()) + (new Array())
          `)
          );
        }).toThrow(
          TypeError,
          'Unexpected coercion of type "Array" and type "Array" using "+" operator'
        );
      });

      it('should fail with null', () => {
        expect(() => {
          eval(
            transform(`
            (null) + (null)
          `)
          );
        }).toThrow(
          TypeError,
          'Unexpected coercion of type "null" and type "null" using "+" operator'
        );
      });

      it('should fail with NaN', () => {
        expect(() => {
          eval(
            transform(`
            (NaN) + (NaN)
          `)
          );
        }).toThrow(
          TypeError,
          'Unexpected coercion of type "NaN" and type "NaN" using "+" operator'
        );
      });

      it('should fail with undefined', () => {
        expect(() => {
          eval(
            transform(`
            (undefined) + (undefined)
          `)
          );
        }).toThrow(
          TypeError,
          'Unexpected coercion of type "undefined" and type "undefined" using "+" operator'
        );
      });

      it('should not fail on safe coercion in function declaration', () => {
        expect(
          eval(
            transform(`
          function some() {
            var array = 'some';
            var obj = 12;
            return array + obj;
          }
          some()
        `)
          )
        ).toEqual('some12');
      });

      it('should throw error on unsafe coercion', () => {
        expect(() => {
          eval(
            transform(`
            var array = [];
            var obj = {};
            array + obj;
          `)
          );
        }).toThrow(
          TypeError,
          'Unexpected coercion of type "Array" and type "Object" using "+" operator'
        );

        expect(() => {
          eval(
            transform(`
            var array = function () { return [] };
            var obj = function () { return {} };
            array() + obj();
          `)
          );
        }).toThrow(
          TypeError,
          'Unexpected coercion of type "Array" and type "Object" using "+" operator'
        );
      });

      it('should fail on unsafe coercion in function declaration', () => {
        expect(() => {
          eval(
            transform(`
            function some() {
              var array = [];
              var obj = {};
              return array + obj;
            }
            some()
          `)
          );
        }).toThrow(
          TypeError,
          'Unexpected coercion of type "Array" and type "Object" using "+" operator'
        );
      });
    });
  }
});
