import type { NodePath } from 'babel-traverse';


/* eslint no-restricted-syntax: 0, fp/no-loops: 0, no-continue: 0, func-names: 0, fp/no-let: 0 */


// https://astexplorer.net/#/gist/a6acab67ec110ce0ebcfbbee7521de2a/779ae92132ef8c26e0b8f37e96ec83ab176d33f3

export default function ({ types: t }) {
  return {
    visitor: {
      Program(path: NodePath) {
        path.unshiftContainer('body', [
          t.variableDeclaration('var', [
            t.variableDeclarator(
              t.identifier('safeCoerce'),
              t.memberExpression(t.callExpression(t.identifier('require'),
                [t.stringLiteral('safe-access-check')]), t.identifier('safeCoerce'))
            )
          ])
        ]);
        path.unshiftContainer('body', [
          t.variableDeclaration('var', [
            t.variableDeclarator(
              t.identifier('safePropertyAccess'),
              t.memberExpression(t.callExpression(t.identifier('require'),
                [t.stringLiteral('safe-access-check')]), t.identifier('safePropertyAccess'))
            )
          ])
        ]);
      },

      MemberExpression(path) {
        let object = path.node;
        const items = [];
        let id;

        while (t.isMemberExpression(object)) {
          if (object.computed === false) {
            items.push(t.stringLiteral(object.property.name));
          } else {
            items.push(object.property);
          }
          object = object.object;
          id = object;
        }

        if (id.callee) {
          if (id.callee.name === 'require') {
            return;
          }
        }

        path.replaceWith(
          t.callExpression(
            t.identifier('safePropertyAccess'),
            [
              t.arrayExpression(
                items.reverse()
              ),
              t.identifier(id.name || id.callee.name)
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
