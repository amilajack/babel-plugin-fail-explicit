import type { NodePath } from 'babel-traverse';


/* eslint no-restricted-syntax: 0, fp/no-loops: 0, no-continue: 0, func-names: 0, fp/no-let: 0 */

// https://astexplorer.net/#/gist/a6acab67ec110ce0ebcfbbee7521de2a/779ae92132ef8c26e0b8f37e96ec83ab176d33f3

export default function ({ types: t }) {
  return {
    visitor: {
      Program(path: NodePath, state) {
        if (state.opts.commonJSImports === true) {
          // CommonJS Imports
          // @NOTE: CommonJS imports do not work as expected. Prefer ES6 imports
          path.unshiftContainer('body', [
            t.variableDeclaration('var', [
              t.variableDeclarator(
                t.identifier('_safeCoerce'),
                t.memberExpression(t.callExpression(t.identifier('require'),
                  [t.stringLiteral('safe-access-check')]), t.identifier('safeCoerce'))
              )
            ])
          ]);
          path.unshiftContainer('body', [
            t.variableDeclaration('var', [
              t.variableDeclarator(
                t.identifier('_safePropertyAccess'),
                t.memberExpression(t.callExpression(t.identifier('require'),
                  [t.stringLiteral('safe-access-check')]), t.identifier('safePropertyAccess'))
              )
            ])
          ]);
        } else {
          // ES6 Imports
          state.file.addImport('safe-access-check', 'safeCoerce', '_safeCoerce');
          state.file.addImport('safe-access-check', 'safePropertyAccess', '_safePropertyAccess');
        }
      },

      MemberExpression(path, state) {
        if (t.isAssignmentExpression(path.parent)) {
          if (path.parentKey === 'left') {
            return;
          }
        }

        // @HACK: Temporarily prevent wrapping callExpression's
        //        Reason of bug is unknown
        if (t.isCallExpression(path.parent)) {
          return;
        }

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

        if (t.isCallExpression(id)) {
          if (id.callee.name === 'require') {
            return;
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
          path.replaceWith(
            t.callExpression(
              t.identifier('_safePropertyAccess'),
              [
                t.arrayExpression(
                  items.reverse()
                ),
                t.identifier(id.name || id.callee.name)
              ]
            )
          );
        } catch (error) {
          throw new Error([
            'This is an issue with "babel-plugin-fail-explicit"',
            `Line "${path.node.loc.start}" in "${state.file.opts.filename}"`,
            error
          ].join('. '));
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
            t.identifier('_safeCoerce'),
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
