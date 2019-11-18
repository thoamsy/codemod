# CodeMod 集合

https://astexplorer.net/

https://github.com/facebook/jscodeshift/

## icon 迁移

组件库大更新，名字发生了变更。
思路：通过一个 Map 对应 imported.name，接着搜索所有的 JSX element，替换它们
总体比较简单

## safeGet -> get

将内部的 safeGet 改成 lodash 的 get，真的搞不明白为什么要自己写个 safeGet？？
思路大概如下：

1. 判断是否导入了 lodash
   1. default import
   2. named import
   3. 是否已经导入了 get
2. 找到所有的 safeGet，交换第一个参数和第二个参数的位置
3. 导入过 import 的
   1. 如果已经导入过 `get` 了，直接将 `safeGet` 改成 `get`
   2. 如果采用了 named import，在这一行加上 get，接下来同 1
   3. 将这一行改成 `_.get`
4. 没导入过的新生成一条 `import { get } from 'lodash'`
5. 删除 safeGet 的 import 声明

- [x] safeGet -> get
- [ ] 删除 safeGet
- [ ] 改成 `_.get` 或者对应的变量名
- [ ] 创建 import 语句
- [ ] 更加声明式的写法

## 参考文献

https://nec.is/writing/transform-your-codebase-using-codemods/

https://medium.com/@andrew_levine/writing-your-very-first-codemod-with-jscodeshift-7a24c4ede31b

https://padraig.io/automate-refactoring-jscodeshift/
