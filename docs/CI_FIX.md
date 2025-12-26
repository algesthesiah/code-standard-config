# CI 未触发修复指南

## 问题诊断

你遇到的情况：
- ✅ 工作流文件已被识别（左侧有 "Version and Publish"）
- ❌ 没有任何运行记录
- ❌ 没有手动运行按钮

## 已修复的问题

### 1. 添加手动触发功能

已添加 `workflow_dispatch` 到工作流配置，现在可以手动触发。

**需要提交这个更改**：

```bash
git add .github/workflows/publish.yml
git commit -m "chore: add workflow_dispatch for manual trigger"
git push origin main
```

## 可能的原因

### 1. GitHub Actions 未启用（最可能）

即使工作流文件被识别，如果 Actions 未启用，也不会运行。

**检查步骤**：
1. 访问：`https://github.com/algesthesiah/code-standard-config/settings/actions`
2. 在 **"Actions permissions"** 部分：
   - 选择 **"Allow all actions and reusable workflows"**
3. 在 **"Workflow permissions"** 部分：
   - 选择 **"Read and write permissions"**
4. 点击 **Save** 保存

### 2. 工作流文件需要重新提交

即使文件已提交，如果 GitHub 没有识别到，可能需要重新提交。

**操作**：
```bash
# 提交刚才的修改（添加 workflow_dispatch）
git add .github/workflows/publish.yml
git commit -m "chore: add workflow_dispatch for manual trigger"
git push origin main
```

### 3. 检查工作流文件语法

虽然文件被识别，但可能有语法错误导致无法运行。

**检查**：
- 访问 Actions 页面
- 点击工作流名称
- 查看是否有错误提示

## 修复步骤

### 步骤 1：提交工作流文件修改

```bash
git add .github/workflows/publish.yml
git commit -m "chore: add workflow_dispatch for manual trigger"
git push origin main
```

### 步骤 2：检查 GitHub Actions 设置

访问：`https://github.com/algesthesiah/code-standard-config/settings/actions`

确保：
- ✅ Actions permissions 已启用
- ✅ Workflow permissions 设置为 "Read and write"

### 步骤 3：等待几分钟

推送后，GitHub 可能需要几分钟来识别工作流文件。

### 步骤 4：手动触发测试

1. 访问：`https://github.com/algesthesiah/code-standard-config/actions`
2. 点击左侧 **"Version and Publish"** 工作流
3. 应该能看到 **"Run workflow"** 按钮（在右侧）
4. 点击按钮，选择 `main` 分支，运行

### 步骤 5：检查推送是否触发

推送后，访问 Actions 页面，查看是否有新的运行记录。

## 如果还是没有运行按钮

可能的原因：
1. **工作流文件有语法错误** - 检查 YAML 语法
2. **权限不足** - 检查仓库设置
3. **GitHub Actions 被禁用** - 检查组织或仓库设置

## 验证

提交修改后，运行：

```bash
# 检查工作流文件
cat .github/workflows/publish.yml | head -10

# 检查是否已提交
git log --oneline -1 --name-only
```

## 下一步

1. **提交工作流文件修改**
2. **检查 GitHub Actions 设置**
3. **等待几分钟后刷新 Actions 页面**
4. **尝试手动触发**

