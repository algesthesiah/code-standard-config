# 工作流运行问题排查

## 问题：点击 Run workflow 后找不到运行项

### 可能的原因

1. **GitHub Actions 延迟**
   - 工作流请求已提交，但 GitHub 需要时间分配 runner
   - 等待 1-2 分钟后再刷新页面

2. **权限问题**
   - 工作流可能因为权限不足而无法启动
   - 检查 `id-token: write` 权限是否已设置

3. **工作流文件语法错误**
   - 虽然文件被识别，但可能有隐藏的语法错误
   - 检查 YAML 语法

4. **Runner 不可用**
   - GitHub 的 runner 可能暂时不可用
   - 等待几分钟后重试

## 检查步骤

### 1. 刷新页面

等待 1-2 分钟后，刷新 Actions 页面：
`https://github.com/algesthesiah/code-standard-config/actions`

### 2. 检查运行记录

在 Actions 页面：
- 查看是否有新的运行记录出现
- 点击运行记录查看详细日志
- 查看是否有错误信息

### 3. 检查工作流文件

确保工作流文件已正确提交：

```bash
# 检查远程仓库中的文件
git show origin/main:.github/workflows/publish.yml | head -20
```

### 4. 查看工作流详情

访问工作流详情页面：
`https://github.com/algesthesiah/code-standard-config/actions/workflows/publish.yml`

查看：
- 是否有运行记录
- 是否有错误提示
- 工作流状态

## 常见解决方案

### 方案 1：等待并刷新

GitHub Actions 有时需要几分钟来分配 runner。等待 2-3 分钟后刷新页面。

### 方案 2：检查权限

确保工作流文件中有：

```yaml
permissions:
  contents: write
  id-token: write  # 必需
  pull-requests: write
```

### 方案 3：重新触发

如果等待后还是没有运行：
1. 再次点击 "Run workflow"
2. 选择 `main` 分支
3. 点击 "Run workflow"

### 方案 4：检查 GitHub Actions 状态

访问 GitHub 状态页面：
`https://www.githubstatus.com/`

检查 GitHub Actions 服务是否正常。

## 验证

运行以下命令检查配置：

```bash
# 检查工作流文件
cat .github/workflows/publish.yml | head -15

# 检查是否已提交
git log --oneline -1 --name-only
```

## 如果仍然无法运行

1. **查看 GitHub Actions 日志**：访问 Actions 页面，查看是否有错误信息
2. **检查仓库设置**：确认 Actions 权限已正确配置
3. **联系 GitHub 支持**：如果问题持续，可能需要联系 GitHub 支持


