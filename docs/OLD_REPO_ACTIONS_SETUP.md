# 老项目启用 GitHub Actions 指南

## 问题：老项目可能没有触发 runner

对于在 GitHub Actions 功能推出之前创建的项目，可能需要手动启用 Actions。

## 检查步骤

### 1. 检查 Actions 是否被禁用

访问：`https://github.com/algesthesiah/code-standard-config/settings/actions`

**检查项：**

1. **Actions permissions**
   - 如果显示 "Disable Actions"，说明 Actions 被禁用了
   - 需要改为 "Allow all actions and reusable workflows"
   - 点击 "Save" 保存

2. **Actions 是否可见**
   - 如果仓库设置中没有 "Actions" 选项，可能需要：
     - 检查仓库类型（私有/公开）
     - 检查组织设置（如果是组织仓库）

### 2. 检查仓库设置

访问：`https://github.com/algesthesiah/code-standard-config/settings`

**检查：**
- 仓库是否可见（私有/公开）
- 是否有任何限制设置

### 3. 检查工作流文件

确保工作流文件在正确的位置：

```bash
# 检查文件是否存在
ls -la .github/workflows/

# 检查文件内容
cat .github/workflows/hello-world.yml
```

### 4. 强制触发

创建一个最简单的测试工作流并推送：

```yaml
name: Hello World

on:
  push:
    branches:
      - main
  workflow_dispatch:

jobs:
  hello:
    runs-on: ubuntu-latest
    steps:
      - name: Say Hello
        run: echo "Hello World!"
```

## 常见问题

### 问题 1：Actions 选项卡不可见

**原因：**
- 仓库可能禁用了 Actions
- 组织设置可能限制了 Actions

**解决：**
1. 检查仓库设置中的 Actions 选项
2. 如果是组织仓库，检查组织设置

### 问题 2：工作流文件已推送但无反应

**原因：**
- Actions 可能被禁用
- 工作流文件可能有语法错误
- 分支名称不匹配

**解决：**
1. 检查 Actions permissions 设置
2. 验证工作流文件语法
3. 确认分支名称正确

### 问题 3：显示 "Actions are disabled"

**解决：**
1. 访问仓库设置
2. 找到 "Actions" 部分
3. 选择 "Allow all actions and reusable workflows"
4. 保存设置

## 验证步骤

### 步骤 1：推送测试工作流

```bash
git add .github/workflows/hello-world.yml
git commit -m "test: add hello world workflow"
git push origin main
```

### 步骤 2：等待并检查

1. 等待 1-2 分钟
2. 访问：`https://github.com/algesthesiah/code-standard-config/actions`
3. 应该能看到 "Hello World" 工作流

### 步骤 3：手动触发

如果推送后没有自动运行：
1. 访问：`https://github.com/algesthesiah/code-standard-config/actions/workflows/hello-world.yml`
2. 点击 "Run workflow"
3. 选择 `main` 分支
4. 点击 "Run workflow"

## 如果仍然无法运行

### 检查清单

- [ ] Actions permissions 设置为 "Allow all actions"
- [ ] Workflow permissions 设置为 "Read and write"
- [ ] 工作流文件已推送到 `main` 分支
- [ ] 文件路径正确：`.github/workflows/*.yml`
- [ ] 工作流文件语法正确
- [ ] 分支名称匹配（`main`）
- [ ] 仓库不是 fork（fork 仓库的 Actions 可能被禁用）

### 联系支持

如果以上都正常但仍然无法运行：
1. 检查 GitHub 状态：`https://www.githubstatus.com/`
2. 查看 GitHub 文档：`https://docs.github.com/en/actions`
3. 联系 GitHub 支持


