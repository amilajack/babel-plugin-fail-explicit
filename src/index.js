import type { NodePath } from 'babel-traverse';


/* eslint no-restricted-syntax: 0, fp/no-loops: 0, no-continue: 0, func-names: 0, fp/no-let: 0 */

export default function ({ types: t }) {
  return {
    visitor: {
      Program(path: NodePath) {
        const identifier = t.identifier('safeAccessCheck');
        const importDefaultSpecifier = t.importDefaultSpecifier(identifier);
        const importDeclaration = t.importDeclaration([importDefaultSpecifier], t.stringLiteral('safe-access-check'));
        path.unshiftContainer('body', importDeclaration);
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
