'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (_ref) {
  var t = _ref.types;

  return {
    visitor: {
      'BinaryExpression|AssignmentExpression': _flowRuntime2.default.annotate(function (path) {
        var _pathType = _flowRuntime2.default.ref(NodePath);

        _flowRuntime2.default.param('path', _pathType).assert(path);

        if (path.node.operator === '===' || path.node.operator === '==' || path.node.operator === '!=' || path.node.operator === '!==' || path.node.operator === 'instanceof' || path.node.operator === 'in') {
          return;
        }

        path.replaceWith(t.callExpression(t.identifier('safeCoerce'), [path.node.left, t.stringLiteral(path.node.operator), path.node.right]));
      }, _flowRuntime2.default.function(_flowRuntime2.default.param('path', _flowRuntime2.default.ref(NodePath))))
    }
  };
};

var _babelTraverse = require('babel-traverse');

require('safe-access-check');

var _flowRuntime = require('flow-runtime');

var _flowRuntime2 = _interopRequireDefault(_flowRuntime);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var NodePath = _flowRuntime2.default.tdz(function () {
  return _babelTraverse.NodePath;
});

/* eslint func-names: 0 */

module.exports = exports['default'];
