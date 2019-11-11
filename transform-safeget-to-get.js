const swapAt = (obj, indexA, indexB) =>
  ([obj[indexA], obj[indexB]] = [obj[indexB], obj[indexA]]);
export default (file, api, options) => {
  const j = api.jscodeshift;
  const root = j(file.source);

  let hasDeclarationLodash = false;
  let hasImportLodashObj = false;
  let hasImportGet = false;
  root.find(j.ImportDefaultSpecifier).forEach(({ value }) => {
    if (value.local.name === '_' || value.local.name === 'lodash') {
      hasImportLodashObj = true;
    }
  });
  root.find(j.ImportDeclaration).forEach(e => {
    if (e.value.source.value === 'lodash') {
      hasDeclarationLodash = true;
      e.value.specifiers.find(node => {
        if (node.type === 'ImportDefaultSpecifier') {
          hasImportLodashObj = true;
          return false;
        }
        if (node.imported && node.imported.name === 'get') {
          hasImportGet = true;
          return true;
        }
        return false;
      });
    }
  });
  if (hasDeclarationLodash) {
    // TODO: 生成一个 import { get } from 'lodash' 的语句
    console.log(hasDeclarationLodash, hasImportGet, hasImportLodashObj);
  }

  root.find(j.CallExpression).forEach(e => {
    if (e.value.callee.name !== 'safeGet') {
      return;
    }
    if (e.value.arguments.length >= 2) {
      swapAt(e.value.arguments, 0, 1);
    }
  });
  return null;
  // return root.toSource()
};
