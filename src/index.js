import type { NodePath } from 'babel-traverse';


/* eslint func-names: 0 */

export default function ({ types: t }) {
  return {
    visitor: {
      Program(path: NodePath) {
        const importDeclaration = t.importDeclaration(
          [t.importDefaultSpecifier(t.identifier('moo'))],
          t.stringLiteral('foo')
        );

        importDeclaration.importKind = 'value';

        path.unshiftContainer(
          'body',
          t.callExpression(
            t.identifier('require'),
            [
              t.stringLiteral('safe-access-check')
            ]
          )
        );
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
