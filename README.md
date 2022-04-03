# code-standard-config

一款偏细腻、优雅的前端代码规范

# Use

安装

## eslint-plugin-airbnb-react

``` bash
npm i eslint-plugin-airbnb-react --save-dev

```

in `.eslintrc.js`

``` js
module.exports = {
  root: true,
  extends: './node_modules/eslint-plugin-airbnb-react',
}
```

in `.prettierrc.js`

``` js
const prettier = require('./node_modules/eslint-plugin-airbnb-react/prettier')

module.exports = {
  ...prettier,
}

```

## stylelint-plugin-standard

``` bash
npm i stylelint-plugin-standard --save-dev

```

in `.stylelintrc.js`

``` js
module.exports = {
  extends: ['stylelint-plugin-standard'],
}
```
