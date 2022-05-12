// https://prettier.io/docs/en/options.html

module.exports = {
  htmlWhitespaceSensitivity: 'ignore', // 格式化完整的换行
  printWidth: 120, // 指定每行代码的最佳长度， 超出长度则换行。
  tabWidth: 2, // 每个制表符占用的空格数
  useTabs: false, // 是否使用制表符（tab）缩进
  semi: false, // 是否在每行末尾添加分号
  singleQuote: true, // 如果为 true，将使用单引号而不是双引号（非 JSX）
  quoteProps: 'consistent', // 对象属性名加引号
  jsxSingleQuote: false, // 在 JSX 中使用单引号而不是双引号
  trailingComma: 'es5', // 尾后逗号，设置为 "es5" 有利于 git diff，了解更多 https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Trailing_commas
  bracketSpacing: true, // 对象左右两边添加空格
  bracketSameLine: false, // 如果为 true，则将多行 jsx 元素的 `>` 放在最后一行的末尾，而不是单独放在下一行
  arrowParens: 'avoid', // 当箭头函数仅有一个参数时加上括号
  endOfLine: 'lf',
}
