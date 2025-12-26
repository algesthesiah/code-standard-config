# GitHub Trusted Publisher 配置指南

本项目使用 GitHub Trusted Publisher 进行 npm 包的自动化发布，无需配置 token，更安全便捷。

## 工作原理

GitHub Trusted Publisher 使用 OIDC (OpenID Connect) 进行身份验证：
- 无需存储和管理 npm token
- 更安全的发布流程
- 自动处理认证

## 发布流程

### 1. 创建 Changeset

当你修改了某个包时，需要创建一个 changeset：

```bash
pnpm changeset
```

这会引导你选择：
- 要变更的包
- 变更类型（major/minor/patch）
- 变更描述

### 2. 提交 Changeset

将 changeset 文件提交并推送到 main 分支：

```bash
git add .changeset
git commit -m "chore: add changeset"
git push origin main
```

### 3. 自动发布

GitHub Actions 会自动：
1. 检测到 changeset 文件
2. 创建版本更新 PR（如果有多个 changeset）
3. 合并 PR 后自动发布到 npm

## GitHub Actions 工作流

工作流文件：`.github/workflows/version-and-publish.yml`

**触发条件**：
- 推送到 main 分支
- 检测到 changeset 文件变更

**工作流程**：
1. 检出代码
2. 安装依赖
3. 构建包
4. 使用 changesets 处理版本和发布

## 本地发布（可选）

如果需要本地发布，仍然可以使用：

```bash
pnpm release
```

这会：
1. 构建所有包
2. 使用 changesets 发布

**注意**：本地发布可能仍需要 npm 认证（如果未配置 Trusted Publisher 或 token）。

## 配置 Trusted Publisher

如果还没有配置 Trusted Publisher，请按照以下步骤：

1. 访问 npm 网站：https://www.npmjs.com/
2. 登录你的账户
3. 进入包的设置页面
4. 找到 "Publishers" 或 "Trusted Publishers" 部分
5. 添加你的 GitHub 仓库作为受信任的发布者

## 权限要求

GitHub Actions 工作流需要以下权限：
- `contents: write` - 创建版本更新 PR
- `id-token: write` - 生成 OIDC token（用于 Trusted Publisher）
- `pull-requests: write` - 创建和管理 PR

这些权限已在工作流文件中配置。

## 优势

✅ **更安全**：不需要存储 token，减少泄露风险
✅ **自动化**：完全自动化的发布流程
✅ **符合最佳实践**：使用 OIDC 进行身份验证
✅ **无需维护**：不需要定期更新 token

## 故障排除

### 发布失败

如果发布失败，检查：
1. Trusted Publisher 是否已正确配置
2. GitHub Actions 工作流是否正常运行
3. changeset 文件格式是否正确

### 本地发布问题

如果本地发布需要认证，可以：
1. 使用 `npm login` 登录
2. 或配置 npm token（见 `docs/NPM_TOKEN_SETUP.md`）

