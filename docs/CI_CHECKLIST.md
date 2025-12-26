# CI 触发检查清单

## ✅ 快速检查清单

### 1. GitHub Actions 是否启用？

访问：`https://github.com/你的用户名/code-standard-config/settings/actions`

确保：
- ✅ **"Allow all actions and reusable workflows"** 已启用
- ✅ **"Workflow permissions"** 设置为 **"Read and write permissions"**

### 2. 工作流文件是否正确？

```bash
# 检查文件是否存在
ls -la .github/workflows/version-and-publish.yml

# 检查文件内容（应该包含 name, on, jobs 等）
cat .github/workflows/version-and-publish.yml | head -10
```

### 3. 文件是否已提交到 git？

```bash
# 检查是否已跟踪
git ls-files .github/workflows/version-and-publish.yml

# 如果返回空，需要添加并提交
git add .github/workflows/version-and-publish.yml
git commit -m "chore: add GitHub Actions workflow"
git push origin main
```

### 4. 是否推送到 main 分支？

```bash
# 确认当前分支
git branch --show-current

# 应该显示：main

# 确认已推送
git log origin/main -1
```

### 5. 是否有 changeset 文件？

```bash
# 检查 changeset 文件
ls -la .changeset/*.md

# 应该至少有一个 .md 文件
```

## 🔧 如果 CI 仍然没有触发

### 方法 1：手动触发测试

1. 访问：`https://github.com/你的用户名/code-standard-config/actions`
2. 点击左侧 **"Version and Publish"**
3. 点击 **"Run workflow"** 按钮
4. 选择 `main` 分支
5. 点击 **"Run workflow"**

如果手动触发可以运行，说明配置正确，可能是推送时的问题。

### 方法 2：检查最近的推送

```bash
# 查看最近的提交
git log --oneline -5

# 确认工作流文件在最近的提交中
git log --all --full-history -- .github/workflows/version-and-publish.yml
```

### 方法 3：重新提交工作流文件

如果工作流文件是新创建的，确保它被提交：

```bash
# 添加工作流文件
git add .github/workflows/version-and-publish.yml

# 提交
git commit -m "chore: add GitHub Actions workflow for CI/CD"

# 推送
git push origin main
```

## 📋 完整验证命令

运行以下命令进行完整检查：

```bash
# 1. 检查工作流文件
echo "=== 工作流文件 ==="
ls -la .github/workflows/version-and-publish.yml
echo ""

# 2. 检查是否已提交
echo "=== Git 跟踪状态 ==="
git ls-files .github/workflows/version-and-publish.yml
echo ""

# 3. 检查当前分支
echo "=== 当前分支 ==="
git branch --show-current
echo ""

# 4. 检查 changeset 文件
echo "=== Changeset 文件 ==="
ls -la .changeset/*.md 2>/dev/null || echo "没有找到 changeset 文件"
echo ""

# 5. 检查最近的提交
echo "=== 最近 3 次提交 ==="
git log --oneline -3
```

## 🚨 常见问题

### 问题：工作流文件存在但 CI 不触发

**可能原因**：
1. GitHub Actions 未启用
2. 工作流文件格式错误
3. 文件未提交到 git
4. 推送到错误的分支

**解决方案**：
1. 检查 GitHub 仓库设置中的 Actions 权限
2. 验证 YAML 文件格式
3. 确保文件已提交：`git add .github/workflows/ && git commit && git push`

### 问题：CI 运行但失败

**检查**：
1. 查看 GitHub Actions 日志
2. 检查错误信息
3. 验证 Trusted Publisher 配置


