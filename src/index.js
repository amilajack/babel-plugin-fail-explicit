import type { NodePath } from 'babel-traverse';


/* eslint no-restricted-syntax: 0, fp/no-loops: 0, no-continue: 0, func-names: 0, fp/no-let: 0 */

export default function ({ types: t }) {
  return {
    visitor: {
      Program(path: NodePath) {
        const requireCallExpression = t.callExpression(
          t.identifier('require'),
          [
            t.stringLiteral('safe-access-check')
          ]
        );

        let last;

        for (const item of path.get('body')) {
          if (item.isDirective() || item.isImportDeclaration()) {
            last = item;
            continue;
          }

          item.insertBefore(requireCallExpression);
          return;
        }

        if (last) {
          last.insertAfter(requireCallExpression);
        } else {
          path.get('body').unshiftContainer('body', requireCallExpression);
        }
      },

      /**
       * @TODO: Support BinaryExpression|AssignmentExpression|UnaryExpression
       */
      'BinaryExpression|AssignmentExpression': function (path: NodePath) {
        if (
          path.node.operator === '===' ||
          path.node.operator === '==' ||
          path.node.operator === '=' ||
          path.node.operator === '!=' ||
          path.node.operator === '!==' ||
          path.node.operator === 'instanceof' ||
          path.node.operator === 'in'
        ) {
          return;
        }

        path.replaceWith(
          t.callExpression(
            t.identifier('safeCoerce'),
            [
              path.node.left,
              t.stringLiteral(path.node.operator),
              path.node.right
            ]
          )
        );
      }
    }
  };
}
