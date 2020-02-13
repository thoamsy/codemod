import { Transform } from 'jscodeshift';
// const urls = process.argv.slice(2).length
//   ? process.argv.slice(2)
//   : ['util', 'services', 'constants'];

const urls = ['util'];
const transform: Transform = (file, api, options) => {
  const j = api.jscodeshift;
  const printOptions = options.printOptions || { quote: 'single' };
  const root = j(file.source);

  let hasModifications = false;
  function mergePrefixURLWith(prefix) {
    const imported = root.find(j.ImportDeclaration).filter(e => {
      return e.value.source.value.startsWith(prefix);
    });

    // console.log(imported.paths().map((path) => path.value.source.value));
    const firstIndexImport = imported
      .filter(e => e.value.source.value === prefix + '/index')
      .paths()[0];

    if (!firstIndexImport) {
      return;
    }

    const otherImport = imported.filter(e => e !== firstIndexImport);

    const otherImportSpecifiers = otherImport.find(j.ImportSpecifier).nodes();
    const otherImportDefaultSpecifiers = otherImport
      .find(j.ImportDefaultSpecifier)
      .replaceWith(node =>
        j.importSpecifier.from({
          imported: node.value.local,
        }),
      )
      .nodes();
    imported.replaceWith(node => {
      if (node !== firstIndexImport) {
        return null;
      }

      node.value.specifiers = node.value.specifiers
        .concat(otherImportDefaultSpecifiers)
        .concat(otherImportSpecifiers);
      hasModifications = true;
      return j.importDeclaration(node.value.specifiers, node.value.source);
    });
  }
  urls.forEach(mergePrefixURLWith);

  if (!hasModifications) {
    return;
  }

  return root.toSource(printOptions);
};

export default transform;
