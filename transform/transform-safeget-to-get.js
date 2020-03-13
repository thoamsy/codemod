import { Transform } from 'jscodeshift';

const transform: Transform = (file, api, options) => {
  const j = api.jscodeshift;
  const root = j(file.source);
  const printOptions = options.printOptions || { quote: 'single' };

  let hasDeclarationLodash = false;
  let hasImportLodashObj = false;
  let hasImportGet = false;

  root.find(j.ImportDeclaration).forEach(e => {
    if (e.value.source.value === 'lodash') {
      hasDeclarationLodash = true;
      e.value.specifiers.forEach(node => {
        if (node.type === 'ImportDefaultSpecifier') {
          hasImportLodashObj = true;
          return;
        }
        if (node.imported && node.imported.name === 'get') {
          hasImportGet = true;
          return;
        }
      });
    }
  });

  // remove safeget
  root
    .find(j.ImportDeclaration, {
      source: {
        value: 'util/safeGet',
      },
    })
    .remove();

  let needToReplace = false;
  root
    .find(j.CallExpression)
    .filter(e => {
      return e.value.callee.name === 'safeGet';
    })
    .replaceWith(e => {
      needToReplace = true;
      if (e.value.arguments.length >= 2) {
        const theIdentifier = hasImportGet
          ? j.identifier('get')
          : j.memberExpression(j.identifier('_'), j.identifier('get'));

        const argumentsCopy = [...e.value.arguments];
        [argumentsCopy[0], argumentsCopy[1]] = [
          argumentsCopy[1],
          argumentsCopy[0],
        ];
        return j.callExpression(theIdentifier, argumentsCopy);
      }
    });

  // 如果没有 lodash，就插入 import _ from 'lodash'
  if (needToReplace && !hasDeclarationLodash) {
    j(
      root
        .find(j.ImportDeclaration)
        .at(-1)
        .get(),
    ).insertAfter(
      j.importDeclaration(
        [j.importDefaultSpecifier(j.identifier('_'))],
        j.literal('lodash'),
      ),
    );
  }

  return root.toSource(printOptions);
};

export default transform;
