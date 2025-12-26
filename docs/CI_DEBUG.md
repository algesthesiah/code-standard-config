# CI 未触发调试指南

## 问题：推送 main 后 CI 没有触发

### 已确认的信息

✅ 工作流文件已提交到 git
✅ 工作流文件已在远程仓库
✅ changeset 文件已推送
✅ 配置看起来正确

### 可能的原因和解决方案

#### 1. GitHub Actions 未启用（最可能）

**检查步骤**：
1. 访问：`https://github.com/algesthesiah/code-standard-config/settings/actions`
2. 查看 **"Actions permissions"** 部分
3. 确保选择了 **"Allow all actions and reusable workflows"**

**如果未启用**：
- 选择 "Allow all actions and reusable workflows"
- 点击 **Save** 保存

#### 2. 工作流文件路径问题

**检查**：
- npm Trusted Publisher 配置的工作流路径是：`.github/workflows/publish.yml`
- 确保文件名完全匹配（大小写敏感）

#### 3. 手动触发测试

**步骤**：
1. 访问：`https://github.com/algesthesiah/code-standard-config/actions`
2. 点击左侧 **"Version and Publish"** 工作流
3. 点击 **"Run workflow"** 按钮
4. 选择 `main` 分支
5. 点击 **"Run workflow"**

**如果手动触发可以运行**：
- 说明配置正确
- 可能是 GitHub Actions 权限问题
- 或者工作流文件在推送时没有被识别

#### 4. 检查工作流是否被识别

访问：`https://github.com/你的用户名/code-standard-config/actions`

查看：
- 左侧是否有 **"Version and Publish"** 工作流
- 如果有，说明文件已被识别
- 如果没有，说明文件可能有问题

#### 5. 检查最近的推送

```bash
# 查看最近的提交
git log --oneline -5

# 查看工作流文件是否在最近的提交中
git log --oneline -5 -- .github/workflows/publish.yml
```

如果工作流文件不在最近的提交中，需要重新提交：

```bash
git add .github/workflows/publish.yml
git commit -m "chore: update publish workflow"
git push origin main
```

## 快速修复步骤

### 步骤 1：确认 GitHub Actions 已启用

访问设置页面并启用 Actions。

### 步骤 2：手动触发一次

手动触发工作流，确认配置是否正确。

### 步骤 3：重新提交工作流文件（如果需要）

```bash
# 确保工作流文件已提交
git add .github/workflows/publish.yml
git commit -m "chore: ensure publish workflow is committed"
git push origin main
```

### 步骤 4：检查 GitHub Actions 页面

访问 Actions 页面，查看：
- 是否有工作流运行记录
- 是否有错误信息
- 工作流是否被禁用

## 验证命令

运行以下命令进行完整检查：

```bash
# 1. 检查工作流文件
echo "=== 工作流文件 ==="
ls -la .github/workflows/publish.yml
echo ""

# 2. 检查是否已提交
echo "=== Git 跟踪状态 ==="
git ls-files .github/workflows/publish.yml
echo ""

# 3. 检查远程仓库中的文件
echo "=== 远程仓库中的文件 ==="
git show origin/main:.github/workflows/publish.yml | head -10
echo ""

# 4. 检查当前分支
echo "=== 当前分支 ==="
git branch --show-current
echo ""

# 5. 检查最近的提交
echo "=== 最近 3 次提交 ==="
git log --oneline -3
```

## 下一步

如果以上都检查过了，还是没触发：

1. **访问 GitHub Actions 页面**，看是否有任何错误或提示
2. **手动触发一次**，确认配置是否正确
3. **检查仓库设置**，确认 Actions 已启用并有正确权限
4. **查看 GitHub 通知**，看是否有权限或配置问题

