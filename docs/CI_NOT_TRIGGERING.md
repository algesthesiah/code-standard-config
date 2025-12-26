# CI 未触发问题排查

## 快速检查清单

### 1. 检查 GitHub Actions 是否启用

访问：`https://github.com/algesthesiah/code-standard-config/settings/actions`

确保：
- ✅ **"Allow all actions and reusable workflows"** 已启用
- ✅ **"Workflow permissions"** 设置为 **"Read and write permissions"**

### 2. 检查工作流文件是否已提交

```bash
# 检查文件是否在 git 中
git ls-files .github/workflows/publish.yml

# 应该返回：.github/workflows/publish.yml

# 如果返回空，需要提交：
git add .github/workflows/publish.yml
git commit -m "chore: add publish workflow"
git push origin main
```

### 3. 检查工作流文件路径

确保文件路径完全正确：
- ✅ 路径：`.github/workflows/publish.yml`
- ✅ 文件名：`publish.yml`（与 npm Trusted Publisher 配置一致）
- ✅ 扩展名：`.yml` 或 `.yaml`

### 4. 检查触发条件

工作流配置：
```yaml
on:
  push:
    branches:
      - main
```

确保：
- ✅ 推送到的是 `main` 分支（不是 `master` 或其他分支）
- ✅ 工作流文件在推送的提交中

### 5. 检查最近的推送

```bash
# 查看最近的提交
git log --oneline -5

# 查看工作流文件是否在最近的提交中
git log --oneline -5 -- .github/workflows/publish.yml
```

### 6. 手动触发测试

1. 访问：`https://github.com/algesthesiah/code-standard-config/actions`
2. 点击左侧 **"Version and Publish"** 工作流
3. 点击 **"Run workflow"** 按钮
4. 选择 `main` 分支
5. 点击 **"Run workflow"**

如果手动触发可以运行，说明配置正确，可能是推送时的问题。

### 7. 检查 GitHub Actions 页面

访问：`https://github.com/algesthesiah/code-standard-config/actions`

查看：
- 是否有工作流运行记录
- 是否有错误信息
- 工作流是否被禁用

## 常见问题

### 问题 1：工作流文件未提交

**症状**：文件存在但 git 中没有

**解决**：
```bash
git add .github/workflows/publish.yml
git commit -m "chore: add publish workflow"
git push origin main
```

### 问题 2：GitHub Actions 未启用

**症状**：推送后没有任何工作流运行

**解决**：
1. 访问仓库设置
2. 启用 GitHub Actions
3. 设置权限为 "Read and write"

### 问题 3：工作流文件语法错误

**症状**：工作流显示但无法运行

**解决**：
- 检查 YAML 语法
- 确保缩进正确（使用空格，不是 tab）
- 检查是否有未闭合的引号或括号

### 问题 4：分支名称不匹配

**症状**：推送到其他分支，工作流不触发

**解决**：
- 确认推送到 `main` 分支
- 或修改工作流配置匹配你的分支名

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

# 3. 检查当前分支
echo "=== 当前分支 ==="
git branch --show-current
echo ""

# 4. 检查最近的提交
echo "=== 最近 3 次提交 ==="
git log --oneline -3
echo ""

# 5. 检查工作流文件是否在最近的提交中
echo "=== 工作流文件提交历史 ==="
git log --oneline -5 -- .github/workflows/publish.yml
```

## 下一步

如果以上都检查过了，还是没触发：

1. **手动触发一次**，看看是否能运行
2. **查看 GitHub Actions 页面**，看是否有错误信息
3. **检查仓库设置**，确认 Actions 已启用
4. **查看 GitHub 通知**，看是否有权限问题

