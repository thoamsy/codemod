import path from 'path';
import program from 'commander';
import fs from 'fs';
import j from 'jscodeshift';

program
  .requiredOption('-d, --dir <dir>', '生成 index 文件的路径')
  .parse(process.argv);

const cur = new URL(path.dirname(import.meta.url)).pathname;
const dir = path.resolve(cur, '..', program.dir);

const jtsx = j.withParser('tsx');

try {
  console.group('读取开始');
  const statusOfExported = fs
    .readdirSync(dir)
    .filter(name => !name.startsWith('index.') && name.endsWith('.ts'))
    .reduce((result, name) => {
      const source = fs.readFileSync(path.resolve(dir, './' + name), {
        encoding: 'utf8',
      });
      const hasExportNamed =
        jtsx(source).find(j.ExportNamedDeclaration).length > 0;
      const hasExportDefault =
        jtsx(source).find(j.ExportDefaultDeclaration).length > 0;
      result[name] = [hasExportNamed, hasExportDefault];
      console.log(`读取 ${name} 成功`);
      return result;
    }, {});
  console.groupEnd();

  const indexPath = path.resolve(dir, './index.ts');
  let wroteExportNamed = new Set();
  let wroteExportDefault = new Set();
  try {
    const source = fs.readFileSync(indexPath, {
      encoding: 'utf8',
    });
    const getNameWithoutPrefix = node =>
      node.value.source.value.replace(/^\.\//, '');

    wroteExportNamed = new Set(
      jtsx(source)
        .find(j.ExportAllDeclaration)
        .paths()
        .map(getNameWithoutPrefix),
    );

    wroteExportDefault = new Set(
      jtsx(source)
        .find(j.ExportNamedDeclaration)
        .paths()
        .filter(node => {
          // export const a = 1 这种是没有 source 的
          if (!node.value.source) {
            return false;
          }
          return (
            statusOfExported[getNameWithoutPrefix(node) + '.ts'] &&
            node.value.specifiers.findIndex(
              specifier => specifier.local.name === 'default',
            ) > -1
          );
        })
        .map(getNameWithoutPrefix),
    );
  } catch (err) {
    console.log('index 文件不存在，将会自动创建');
  }

  const content = Object.entries(statusOfExported)
    .flatMap(([name, [hasExportNamed, hasExportDefault]]) => {
      const noSuffix = name.replace(/\..+$/, '');
      const res = [];
      if (!wroteExportNamed.has(noSuffix) && hasExportNamed) {
        res.push(`export * from './${noSuffix}';`);
      }
      if (!wroteExportDefault.has(noSuffix) && hasExportDefault) {
        res.push(`export { default as ${noSuffix} } from './${noSuffix}';`);
      }
      return res;
    })
    .join('\n');
  if (!content) {
    console.log('没有可写入的 export');
  } else {
    fs.appendFileSync(indexPath, content, {
      encoding: 'utf8',
    });
    console.info(`写入 export to ${dir} 成功!`);
  }
} catch (err) {
  console.error(err.message);
}
