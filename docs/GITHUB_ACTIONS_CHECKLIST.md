# GitHub Actions 无法运行排查清单

## 问题：工作流文件已推送，但 CI 不运行

### 检查步骤

#### 1. 确认工作流文件已推送

```bash
# 检查远程仓库中的文件
git show origin/main:.github/workflows/ci.yml

# 检查本地文件
cat .github/workflows/ci.yml
```

#### 2. 检查 GitHub Actions 设置

访问：`https://github.com/algesthesiah/code-standard-config/settings/actions`

**必须检查的项：**

1. **Actions permissions**
   - 选择 "Allow all actions and reusable workflows"
   - 不要选择 "Allow local actions and reusable workflows only"
   - 不要选择 "Disable Actions"

2. **Workflow permissions**
   - 选择 "Read and write permissions"
   - 不要选择 "Read repository contents and packages permissions"

3. **保存设置**
   - 点击页面底部的 "Save" 按钮

#### 3. 检查工作流文件路径

工作流文件必须在以下路径：
- `.github/workflows/*.yml`
- `.github/workflows/*.yaml`

**常见错误：**
- ❌ `.github/workflow/` (单数)
- ❌ `github/workflows/` (缺少点)
- ✅ `.github/workflows/` (正确)

#### 4. 检查工作流文件语法

```bash
# 检查 YAML 语法（如果安装了 yamllint）
yamllint .github/workflows/ci.yml
```

**常见语法错误：**
- 缩进错误（必须使用空格，不能使用 tab）
- 缺少冒号
- 引号不匹配

#### 5. 检查分支名称

工作流中指定的分支必须存在：

```yaml
on:
  push:
    branches:
      - main  # 确保这个分支存在
```

#### 6. 检查 GitHub Actions 状态

访问：`https://www.githubstatus.com/`

确认 GitHub Actions 服务正常。

#### 7. 查看 Actions 页面

访问：`https://github.com/algesthesiah/code-standard-config/actions`

**检查：**
- 左侧是否有工作流列表
- 是否有任何运行记录（包括失败的）
- 是否有错误提示

#### 8. 检查仓库权限

确保你有权限：
- 查看仓库设置
- 修改 Actions 设置
- 查看 Actions 运行记录

#### 9. 尝试手动触发

如果工作流有 `workflow_dispatch`：

1. 访问 Actions 页面
2. 点击左侧的工作流名称
3. 点击右侧 "Run workflow" 按钮
4. 选择分支
5. 点击 "Run workflow"

#### 10. 检查工作流文件内容

确保工作流文件内容完整，没有被截断：

```bash
# 检查文件完整性
wc -l .github/workflows/ci.yml
cat .github/workflows/ci.yml
```

## 快速测试

创建一个最简单的测试工作流：

```yaml
name: Test

on:
  push:
    branches:
      - main
  workflow_dispatch:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Hello World
        run: echo "Hello World from GitHub Actions!"
```

如果这个最简单的测试也无法运行，说明是 GitHub Actions 设置问题。

## 如果仍然无法运行

1. **检查仓库类型**：确保不是 fork 仓库（fork 仓库的 Actions 可能被禁用）
2. **检查组织设置**：如果是组织仓库，检查组织的 Actions 设置
3. **联系 GitHub 支持**：如果以上都正常，可能需要联系 GitHub 支持

## 验证清单

- [ ] 工作流文件已推送到 `main` 分支
- [ ] 文件路径正确：`.github/workflows/*.yml`
- [ ] GitHub Actions 已启用（设置 → Actions → Allow all actions）
- [ ] 工作流权限设置为 "Read and write"
- [ ] 工作流文件语法正确
- [ ] 分支名称匹配（`main`）
- [ ] GitHub Actions 服务正常
- [ ] 有权限查看 Actions 运行记录

