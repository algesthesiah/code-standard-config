# CI 故障排除指南

## CI 没有触发？检查这些：

### 1. 检查 GitHub Actions 是否启用

1. 访问你的仓库：`https://github.com/你的用户名/code-standard-config`
2. 点击 **Settings**（设置）
3. 左侧菜单找到 **Actions** → **General**
4. 确保 **"Allow all actions and reusable workflows"** 已启用

### 2. 检查工作流文件是否存在

确保 `.github/workflows/version-and-publish.yml` 文件存在且已提交：

```bash
# 检查文件是否存在
ls -la .github/workflows/version-and-publish.yml

# 检查是否已提交到 git
git ls-files .github/workflows/version-and-publish.yml
```

### 3. 检查是否推送到 main 分支

工作流只监听 `main` 分支的推送：

```bash
# 确认当前分支
git branch --show-current

# 确认已推送到远程
git log origin/main -1
```

### 4. 检查是否有 changeset 文件

工作流需要检测到 changeset 文件才会运行：

```bash
# 检查 .changeset 目录下是否有 .md 文件
ls -la .changeset/*.md
```

### 5. 手动触发工作流（测试）

如果以上都正常，可以手动触发：

1. 访问：`https://github.com/你的用户名/code-standard-config/actions`
2. 点击左侧 **"Version and Publish"** 工作流
3. 点击 **"Run workflow"** 按钮
4. 选择 `main` 分支
5. 点击 **"Run workflow"**

### 6. 检查工作流日志

如果工作流运行了但失败了：

1. 访问：`https://github.com/你的用户名/code-standard-config/actions`
2. 点击最新的工作流运行
3. 查看错误日志

## 常见问题

### 问题 1：工作流文件格式错误

确保 YAML 文件格式正确，没有语法错误。

### 问题 2：权限不足

确保仓库设置中允许 GitHub Actions 运行，并且有写入权限。

### 问题 3：changesets/action 版本问题

如果 `changesets/action@v1` 有问题，可以尝试更新到最新版本。

### 问题 4：Trusted Publisher 未配置

如果发布失败，检查 npm 上的 Trusted Publisher 配置是否正确。

## 验证步骤

运行以下命令验证配置：

```bash
# 1. 确认工作流文件存在
ls -la .github/workflows/version-and-publish.yml

# 2. 确认已提交
git ls-files .github/workflows/

# 3. 确认在 main 分支
git branch --show-current

# 4. 确认有 changeset 文件
ls -la .changeset/*.md

# 5. 推送测试
git push origin main
```


