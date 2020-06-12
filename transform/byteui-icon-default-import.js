import { Transform } from 'jscodeshift';

const transform: Transform = (file, api, options) => {
  const j = api.jscodeshift;
  const root = j(file.source);
  const printOptions = options.printOptions || { quote: 'single' };

  const libraryName = '@bytedesign/web-react/icon';
  const transform = (iconName) => libraryName + '/react-icon/' + iconName;

  let iconNames = [];
  root
    .find(j.ImportDeclaration, {
      source: {
        value: libraryName,
      },
    })
    .forEach((path) => {
      iconNames.push(
        ...path.value.specifiers.map((specifier) => specifier.imported.name)
      );
    })
    .insertAfter(
      iconNames.map((icon) => {
        return j.importDeclaration(
          [j.importDefaultSpecifier(j.identifier(icon))],
          j.literal(transform(icon)),
          'value'
        );
      })
    );

  root
    .find(j.ImportDeclaration, {
      source: {
        value: libraryName,
      },
    })
    .remove();

  return root.toSource(printOptions);
};

export default transform;

