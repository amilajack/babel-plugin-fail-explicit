'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (_ref) {
  var t = _ref.types;

  return {
    visitor: {
      Program(path) {
        path.unshiftContainer('body', t.callExpression(t.identifier('require'), [t.stringLiteral('safe-access-check')]));
      },

      /**
       * @TODO: Support BinaryExpression|AssignmentExpression|UnaryExpression
       */
      'BinaryExpression|AssignmentExpression': function BinaryExpressionAssignmentExpression(path) {
        if (path.node.operator === '===' || path.node.operator === '==' || path.node.operator === '=' || path.node.operator === '!=' || path.node.operator === '!==' || path.node.operator === 'instanceof' || path.node.operator === 'in') {
          return;
        }

        path.replaceWith(t.callExpression(t.identifier('safeCoerce'), [path.node.left, t.stringLiteral(path.node.operator), path.node.right]));
      }
    }
  };
};

module.exports = exports['default'];

/* eslint no-restricted-syntax: 0, fp/no-loops: 0, no-continue: 0, func-names: 0, fp/no-let: 0 */
