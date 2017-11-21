// @flow
import * as babel from 'babel-core';
import { expect as chaiExpect } from 'chai';
import babelPluginFailExplicit from '../src/index';


export const defaultConfig = {
  compact: false,
  sourceType: 'module',
  plugins: [
    [babelPluginFailExplicit, {
      commonJSImports: true
    }],
    'transform-es2015-modules-commonjs'
  ],
  generatorOpts: {
    quotes: 'double',
    compact: false
  }
};

export const configs = [
  {
    testConfigName: 'default'
  },
  {
    testConfigName: 'commonjs',
    plugins: [
      [babelPluginFailExplicit, { commonJSImports: true }],
      'transform-es2015-modules-commonjs'
    ]
  },
  {
    testConfigName: 'es2015 preset',
    presets: ['es2015']
  },
  {
    testConfigName: 'babel preset node 4',
    presets: [['env', { targets: { node: 4 } }]],
    plugins: [
      [babelPluginFailExplicit, { commonJSImports: true }],
      'transform-es2015-modules-commonjs'
    ]
  },
  {
    testConfigName: 'babel preset node 5',
    presets: [['env', { targets: { node: 5 } }]],
    plugins: [
      [babelPluginFailExplicit, { commonJSImports: true }],
      'transform-es2015-modules-commonjs'
    ]
  },
  {
    testConfigName: 'babel preset node 6',
    presets: [['env', { targets: { node: 6 } }]],
    plugins: [
      [babelPluginFailExplicit, { commonJSImports: true }],
      'transform-es2015-modules-commonjs'
    ]
  },
  {
    testConfigName: 'babel preset node 7',
    presets: [['env', { targets: { node: 7 } }]],
    plugins: [
      [babelPluginFailExplicit, { commonJSImports: true }],
      'transform-es2015-modules-commonjs'
    ]
  },
  {
    testConfigName: 'stage-0',
    presets: ['stage-0'],
    plugins: [
      [babelPluginFailExplicit, { commonJSImports: true }],
      'transform-es2015-modules-commonjs'
    ]
  },
  {
    testConfigName: 'es2015,stage-0',
    presets: ['es2015', 'stage-0'],
    plugins: [
      [babelPluginFailExplicit, { commonJSImports: true }],
      'transform-es2015-modules-commonjs'
    ]
  },
  {
    testConfigName: 'transform-es2015-modules-commonjs',
    plugins: [
      [babelPluginFailExplicit, { commonJSImports: true }],
      'transform-es2015-modules-commonjs'
    ]
  },
  {
    testConfigName: 'transform-flow-strip-types',
    presets: ['es2015'],
    plugins: [
      'transform-flow-strip-types',
      'transform-es2015-modules-commonjs',
      [babelPluginFailExplicit, { commonJSImports: true }]
    ]
  },
  {
    testConfigName: 'add-module-exports',
    plugins: [
      [babelPluginFailExplicit, { commonJSImports: true }],
      'add-module-exports',
      'transform-es2015-modules-commonjs'
    ]
  },
  // @TODO
  // {
  //   testConfigName: 'transform-es2015-modules-umd',
  //   plugins: [
  //     [babelPluginFailExplicit, { commonJSImports: true }],
  //     'transform-es2015-modules-umd'
  //   ]
  // },
  {
    testConfigName: 'transform-async-to-bluebird',
    plugins: [
      [babelPluginFailExplicit, { commonJSImports: true }],
      'transform-es2015-modules-commonjs',
      'transform-async-to-bluebird'
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

        const { code } = babel.transform(
          source,
          Object.assign({}, defaultConfig, config)
        );

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
          chaiExpect(() => {
            eval(transform(`
              'some' * 12;
            `));
          })
            .to.throw(TypeError, 'Unexpected coercion of type "string" and type "number" using "*" operator');
        });

        it('should work with division operator', () => {
          chaiExpect(() => {
            eval(transform(`
              'some' / 12;
            `));
          })
            .to.throw(TypeError, 'Unexpected coercion of type "string" and type "number" using "/" operator');
        });

        it('should work with exponent operator', () => {
          chaiExpect(() => {
            eval(transform(`
              'some' ** 12;
            `));
          })
            .to.throw(TypeError, 'Unexpected coercion of type "string" and type "number" using "**" operator');
        });

        it('should work with subtraction operator', () => {
          chaiExpect(() => {
            eval(transform(`
              'some' - 12;
            `));
          })
            .to.throw(TypeError, 'Unexpected coercion of type "string" and type "number" using "-" operator');
        });
      });

      describe('Comparison', () => {
        it('should allow for greater than comparison', () => {
          expect(eval(transform(`
            (() => {
              return 'b' > 'aaa'
            })()
            `)))
            .toEqual(true);

          expect(eval(transform(`
            (() => {
              const foo = 1
              const bar = 1
              return foo <= bar
            })()
            `)))
            .toEqual(true);

          expect(eval(transform(`
            (() => {
              const foo = 2
              const bar = 1
              return foo >= bar
            })()
            `)))
            .toEqual(true);
        });

        it('should fail on comparison of unexpected types', () => {
          chaiExpect(() => {
            eval(transform(`
              (() => {
                const foo = {}
                const bar = []
                return foo >= bar
              })()
              `));
          })
            .to.throw(TypeError, 'Unexpected comparison of type "Object" and type "Array" using ">=" operator');
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
        expect(eval(transform([
          '(() => {',
          'const some = { doo: "foo" };',
          'return `${some.doo}foo`;',
          '})()'
        ]
          .join(''))))
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
  }
});
