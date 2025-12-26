# 工作流运行问题排查

## 问题：点击 Run workflow 后找不到运行项

### 可能的原因和解决方案

#### 1. GitHub Actions 延迟（最常见）

**症状**：显示 "Workflow run was successfully requested" 但看不到运行记录

**解决方案**：
- 等待 1-2 分钟
- 刷新 Actions 页面：`https://github.com/algesthesiah/code-standard-config/actions`
- 运行记录应该会出现在列表中

#### 2. 检查工作流详情页面

访问工作流详情页面：
`https://github.com/algesthesiah/code-standard-config/actions/workflows/publish.yml`

查看：
- 是否有运行记录
- 运行状态（Queued、In progress、Completed、Failed）
- 错误信息

#### 3. 检查权限配置

确保工作流文件中有正确的权限：

```yaml
permissions:
  contents: write
  id-token: write  # 必需：用于 Trusted Publisher
  pull-requests: write
```

#### 4. 检查工作流文件语法

虽然文件被识别，但可能有隐藏的语法错误：

```bash
# 检查 YAML 语法（如果安装了 yamllint）
yamllint .github/workflows/publish.yml
```

#### 5. 重新触发

如果等待后还是没有运行：
1. 再次访问 Actions 页面
2. 点击 "Version and Publish" 工作流
3. 点击 "Run workflow" 按钮
4. 选择 `main` 分支
5. 点击 "Run workflow"

## 检查步骤

### 步骤 1：等待并刷新

等待 2-3 分钟后，刷新页面：
`https://github.com/algesthesiah/code-standard-config/actions`

### 步骤 2：查看工作流详情

访问：
`https://github.com/algesthesiah/code-standard-config/actions/workflows/publish.yml`

查看运行记录列表。

### 步骤 3：检查运行状态

如果看到运行记录：
- 点击运行记录查看详细日志
- 查看是否有错误信息
- 检查每个步骤的状态

### 步骤 4：查看日志

如果运行失败：
- 点击失败的步骤
- 查看错误日志
- 根据错误信息修复问题

## 常见错误

### 错误 1：权限不足

**症状**：运行失败，提示权限错误

**解决**：确保工作流文件中有 `id-token: write` 权限

### 错误 2：Runner 不可用

**症状**：一直处于 Queued 状态

**解决**：
- 等待几分钟
- 检查 GitHub 状态页面：`https://www.githubstatus.com/`
- 如果 GitHub Actions 服务有问题，需要等待服务恢复

### 错误 3：工作流文件语法错误

**症状**：工作流无法启动

**解决**：
- 检查 YAML 语法
- 确保缩进正确（使用空格，不是 tab）
- 检查是否有未闭合的引号或括号

## 验证配置

运行以下命令验证：

```bash
# 检查工作流文件
cat .github/workflows/publish.yml | head -15

# 检查是否已提交
git log --oneline -1 --name-only | grep publish
```

## 如果仍然无法运行

1. **等待更长时间**：有时 GitHub 需要 5-10 分钟来分配 runner
2. **检查 GitHub 状态**：访问 `https://www.githubstatus.com/` 查看服务状态
3. **查看工作流详情页面**：可能有错误信息提示
4. **重新触发**：再次点击 "Run workflow"

