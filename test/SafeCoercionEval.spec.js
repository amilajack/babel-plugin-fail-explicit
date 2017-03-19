import { expect as chaiExpect } from 'chai';
import { transform } from './SafeCoercionTransformation.spec';


/* eslint no-eval: 0 */

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
          var array = {};
          var obj = [];
          return array + obj;
        }
        some()
      `));
    })
    .to.throw(TypeError, 'Unexpected coercion of type "object" and type "array" using "+" operator');
  });
});
