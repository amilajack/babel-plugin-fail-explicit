import type { NodePath } from 'babel-traverse';


/* eslint no-restricted-syntax: 0, fp/no-loops: 0, no-continue: 0, func-names: 0, fp/no-let: 0 */


// https://astexplorer.net/#/gist/a6acab67ec110ce0ebcfbbee7521de2a/779ae92132ef8c26e0b8f37e96ec83ab176d33f3

export default function ({ types: t }) {
  return {
    visitor: {
      Program(path: NodePath) {
        path.unshiftContainer('body', t.importDeclaration(
          [
            t.importSpecifier(
              t.identifier('safeCoerce'),
              t.identifier('safeCoerce')
            )
          ],
          t.stringLiteral('safe-access-check')
        ));

        path.unshiftContainer('body', t.importDeclaration(
          [
            t.importSpecifier(
              t.identifier('safePropertyAccess'),
              t.identifier('safePropertyAccess')
            )
          ],
          t.stringLiteral('safe-access-check')
        ));
      },

      MemberExpression(path) {
        let obj = path.node;
        const items = [];
        let id;

        while ('property' in obj) {
          items.push(obj.property.value || obj.property.name);
          obj = obj.object;
          id = obj;
        }

        path.replaceWith(
          t.callExpression(
            t.identifier('safePropertyAccess'),
            [
              t.arrayExpression(
                items.reverse().map((item: string | number) => {
                  if (!(typeof item === 'number' || typeof item === 'string')) {
                    throw new TypeError(`Cannot access object using property "${item}"`);
                  }
                  return typeof item === 'number'
                    ? t.numericLiteral(item)
                    : t.stringLiteral(item);
                })
              ),
              t.identifier(id.name)
            ]
          )
        );
      },

      // @TODO
      // MemberExpression(path) {
      //   let obj = path.node;
      //   const items = [];
      //   let id;

      //   while ('property' in obj) {
      //     items.push(obj.property);
      //     obj = obj.object;
      //     id = obj;
      //   }

      //   path.replaceWith(
      //     t.callExpression(
      //       t.identifier('safePropertyAccess'),
      //       [
      //         t.arrayExpression(
      //           items.reverse()
      //         ),
      //         t.identifier(id.name)
      //       ]
      //     )
      //   );
      // },

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
