// @flow
import type { NodePath } from 'babel-traverse';


/* eslint fp/no-loops: 0, no-continue: 0, func-names: 0, fp/no-let: 0 */

// https://astexplorer.net/#/gist/a6acab67ec110ce0ebcfbbee7521de2a/779ae92132ef8c26e0b8f37e96ec83ab176d33f3

export default function ({ types: t }: Object) {
  return {
    visitor: {
      Program: {
        exit(path: NodePath, state: Object) {
          state.file.addImport('safe-access-check', 'default');
        }
      },
      /**
       * Used by safePropertyAccess
       *
       * http://2ality.com/2015/12/babel-commonjs.html
       *
       * BUG:
       * var _safeAccessCheck = require('safe-access-check');
       * var _safeAccessCheck2 = interopRequireDefault(_safeAccessCheck)
       * _safeAccessCheck2.safePropertyAccess()
       *
       * @TODO: Enforce that call to safeCoerce() and safePropertyAccess()
       *        ALWAYS come after the import
       */
      MemberExpression(path: Object, state: Object) {
        // Exit if safeCoerceCheck is disabled
        if (state.opts.safePropertyAccess === false) {
          return;
        }

        if (t.isAssignmentExpression(path.parent)) {
          if (path.parentKey === 'left') {
            return;
          }
        }

        // Abort if immediate parent is logical expression (`||` or `&&`)
        if (state.opts.enforceLogicExpressionCheck !== false) {
          if (t.isLogicalExpression(path.parent)) {
            return;
          }
        }

        // @TODO @HACK: Temporarily prevent wrapping callExpression's
        //              Reason of bug is unknown
        if (t.isCallExpression(path.parent)) {
          return;
        }

        let object = path.node;
        const items = [];
        let id;

        while (t.isMemberExpression(object)) {
          if (object.computed === false) {
            // @HACK: Hardcode edge case
            if (object.property.name === '__esModule') {
              return;
            }
            items.push(t.stringLiteral(object.property.name));
          } else {
            items.push(object.property);
          }
          object = object.object; // eslint-disable-line
          id = object;
        }

        if (t.isCallExpression(id)) {
          if (id && id.callee) {
            if (id.callee.name === 'require') {
              return;
            }
          }
        }

        if (!id) {
          return;
        }
        if (!(id.name)) {
          if (!id.callee) {
            return;
          }
        } else if (!id.callee) {
          if (!id.name) {
            return;
          }
        }

        try {
          if (!(id.name || id.callee.name)) {
            return;
          }
        } catch (e) {
          return;
        }

        try {
          path.replaceWith(t.callExpression(
            t.memberExpression(t.identifier('global'), t.identifier('safePropertyAccess')),
            [
              t.arrayExpression(items.reverse()),
              t.identifier(id.name || id.callee.name)
            ]
          ));
        } catch (error) {
          throw new Error([
            'This is an issue with "babel-plugin-fail-explicit"',
            `Line "${path.node.loc.start}" in "${state.file.opts.filename}"`,
            error
          ].join('. '));
        }
      },

      /**
       * Used by safeCoerce
       * @TODO: Support BinaryExpression|AssignmentExpression|UnaryExpression
       */
      'BinaryExpression|AssignmentExpression': function (path: NodePath, state: Object) {
        // Exit if safeCoerce is disabled
        if (state.opts.safeCoerce === false) {
          return;
        }

        if (
          path.node.operator === '==='
          || path.node.operator === '=='
          || path.node.operator === '='
          || path.node.operator === '!='
          || path.node.operator === '!=='
          || path.node.operator === 'instanceof'
          || path.node.operator === 'in'
        ) {
          return;
        }

        path.replaceWith(t.callExpression(
          t.memberExpression(t.identifier('global'), t.identifier('safeCoerce')),
          [
            path.node.left,
            t.stringLiteral(path.node.operator),
            path.node.right
          ]
        ));
      }
    }
  };
}
