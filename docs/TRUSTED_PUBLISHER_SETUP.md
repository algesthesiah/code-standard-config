# npm Trusted Publisher 配置检查清单

## ✅ 配置验证清单

### 1. GitHub Actions 工作流文件配置

**文件路径**：`.github/workflows/publish.yml`

**必需配置**：

```yaml
permissions:
  id-token: write  # ✅ 必需：用于 OIDC 认证
  contents: write  # ✅ 必需：用于创建 PR 和提交
  pull-requests: write  # ✅ 必需：用于创建 PR
```

**Node.js 设置**：

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '20'
    registry-url: 'https://registry.npmjs.org'
    # ✅ 不需要 NPM_TOKEN，Trusted Publisher 会自动处理
```

### 2. npm Trusted Publisher 配置

在 npm 网站上配置：

1. **访问**：https://www.npmjs.com/settings/你的用户名/publishers
2. **添加 Trusted Publisher**：
   - **Workflow file path**：`.github/workflows/publish.yml` ✅
   - **Repository**：`你的用户名/code-standard-config`
   - **Environment**：`production`（或留空）

### 3. 验证配置

#### 检查工作流文件

```bash
# 确认文件存在
ls -la .github/workflows/publish.yml

# 确认已提交到 git
git ls-files .github/workflows/publish.yml
```

#### 检查权限配置

确保工作流文件中有：

```yaml
permissions:
  id-token: write  # 必需
```

#### 检查 npm 配置

1. 访问：https://www.npmjs.com/settings/你的用户名/publishers
2. 确认 Trusted Publisher 已添加
3. 确认 Workflow file path 是：`.github/workflows/publish.yml`

## 🔧 常见问题

### 问题 1：发布失败，提示认证错误

**可能原因**：
- Trusted Publisher 未配置
- 工作流文件路径不匹配
- 缺少 `id-token: write` 权限

**解决方案**：
1. 检查 npm 上的 Trusted Publisher 配置
2. 确认工作流文件路径完全匹配
3. 确保 `permissions.id-token: write` 已设置

### 问题 2：工作流文件路径不匹配

**npm 配置的路径**：`.github/workflows/publish.yml`

**检查**：
- 文件是否在正确位置
- 文件名是否完全匹配（大小写敏感）
- 是否已提交到 git

### 问题 3：权限不足

**必需权限**：
- `id-token: write` - 用于 OIDC 认证
- `contents: write` - 用于创建版本更新 PR
- `pull-requests: write` - 用于创建 PR

## 📋 完整配置示例

### GitHub Actions 工作流

```yaml
name: Version and Publish

on:
  push:
    branches:
      - main

permissions:
  contents: write
  id-token: write  # 必需：用于 Trusted Publisher
  pull-requests: write

jobs:
  version-and-publish:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 10.25.0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          registry-url: 'https://registry.npmjs.org'
          # 不需要 NPM_TOKEN

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build packages
        run: pnpm build

      - name: Create Release Pull Request or Publish
        uses: changesets/action@v1
        with:
          publish: pnpm exec changeset publish
          version: pnpm exec changeset version
          commit: 'chore: version packages'
          title: 'chore: version packages'
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## ✅ 验证步骤

1. **检查工作流文件**：
   ```bash
   cat .github/workflows/publish.yml
   ```

2. **检查 npm Trusted Publisher**：
   - 访问 npm 设置页面
   - 确认 Workflow file path 是 `.github/workflows/publish.yml`

3. **测试发布**：
   - 创建 changeset
   - 推送到 main 分支
   - 查看 GitHub Actions 日志

## 🚨 重要提示

- ✅ **工作流文件路径必须完全匹配** npm 配置中的路径
- ✅ **必须设置 `id-token: write` 权限**
- ✅ **不需要配置 NPM_TOKEN secret**
- ✅ **文件必须提交到 git 才能生效**

