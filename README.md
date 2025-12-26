# code-standard-config

一款偏细腻、优雅的前端代码规范

## 开发

本项目使用 [Turborepo](https://turbo.build/) 进行 monorepo 管理，使用 [Changesets](https://github.com/changesets/changesets) 进行版本管理和发布。

### 常用命令

```bash
# 构建所有包
pnpm build

# 运行所有测试
pnpm test

# 运行 lint
pnpm lint

# 创建 changeset（用于记录变更）
pnpm changeset

# 更新版本号（基于 changesets）
pnpm version

# 发布包到 npm
pnpm release
```

### 添加变更

当你修改了某个包时，需要创建一个 changeset 来记录变更：

```bash
pnpm changeset
```

这会引导你选择：
- 要变更的包
- 变更类型（major/minor/patch）
- 变更描述

### 发布流程（使用 GitHub Trusted Publisher）

1. 创建 changeset：`pnpm changeset`
2. 提交 changeset 文件并推送到 main 分支
3. GitHub Actions 会自动处理版本更新和发布

**注意**：本项目使用 GitHub Trusted Publisher 进行自动化发布，无需配置 npm token。详情见 `docs/GITHUB_TRUSTED_PUBLISHER.md`

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
