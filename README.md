# CodeMod 集合

https://astexplorer.net/

https://github.com/facebook/jscodeshift/

## icon 迁移

因为组件库大更新，名字发生了变更。
思路：通过一个 Map 对应 imported.name，接着搜索所有的 JSX element，替换它们
总体比较简单

参考文档: https://skovy.dev/jscodeshift-custom-transform/


## 合并 import

用于合并同一个文件夹下的 import 到 `xxx/index` 中，让代码更加整洁。

```js
import a, { f } from 'util/index';
import b from 'util/a';
import c, {d, e} from 'util/b';
```
转化成

```js
import a, { f, b, c, d, e } from 'util/index';
```

同时如果需要在 index 生成 export 文件，可以使用 [generate-export-to-index.mjs](./generate-export-to-index.mjs), 目前功能简单，不支持文件夹递归


## 参考文献

https://nec.is/writing/transform-your-codebase-using-codemods/

https://medium.com/@andrew_levine/writing-your-very-first-codemod-with-jscodeshift-7a24c4ede31b

https://padraig.io/automate-refactoring-jscodeshift/
