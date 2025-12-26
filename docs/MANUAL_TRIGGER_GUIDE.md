# 手动触发工作流指南

## 问题：工作流页面可见但列表为空

如果能看到工作流页面（`https://github.com/algesthesiah/code-standard-config/actions/workflows/hello-world.yml`），说明：
- ✅ 工作流文件已被识别
- ✅ 权限设置正确
- ❌ 但工作流从未运行过

## 解决方案：手动触发

### 步骤 1：访问工作流页面

访问：`https://github.com/algesthesiah/code-standard-config/actions/workflows/hello-world.yml`

### 步骤 2：查找 "Run workflow" 按钮

在页面右侧应该有一个 "Run workflow" 按钮（蓝色按钮）。

**如果看不到按钮：**
- 刷新页面
- 检查是否在正确的分支（`main`）
- 检查浏览器权限

### 步骤 3：点击 "Run workflow"

1. 点击 "Run workflow" 按钮
2. 在下拉菜单中选择 `main` 分支
3. 点击绿色的 "Run workflow" 按钮

### 步骤 4：等待运行

点击后：
1. 页面会显示 "Workflow run was successfully requested"
2. 等待 10-30 秒
3. 刷新页面
4. 应该能看到运行记录出现在列表中

## 如果仍然看不到 "Run workflow" 按钮

### 检查项：

1. **确认工作流文件已推送**
   ```bash
   git show origin/main:.github/workflows/hello-world.yml
   ```

2. **检查工作流文件语法**
   - 确保 YAML 格式正确
   - 确保缩进使用空格（不是 tab）
   - 确保有 `workflow_dispatch:` 触发器

3. **检查分支**
   - 确保在 `main` 分支
   - 工作流文件必须在 `main` 分支上

4. **清除浏览器缓存**
   - 尝试硬刷新（Ctrl+Shift+R 或 Cmd+Shift+R）
   - 尝试无痕模式

## 验证工作流文件

确保工作流文件包含 `workflow_dispatch`：

```yaml
name: Hello World

on:
  push:
    branches:
      - main
  workflow_dispatch:  # 这个必须存在，才能手动触发

jobs:
  hello:
    runs-on: ubuntu-latest
    steps:
      - name: Say Hello
        run: echo "Hello World!"
```

## 如果手动触发后仍然没有运行记录

1. **等待更长时间**：有时需要 1-2 分钟
2. **检查 GitHub 状态**：`https://www.githubstatus.com/`
3. **查看是否有错误提示**：在 Actions 页面查看是否有错误信息
4. **尝试推送一个小的修改**：触发 `push` 事件

## 测试推送触发

如果手动触发成功，可以测试推送触发：

```bash
# 做一个小的修改
echo "# test" >> README.md
git add README.md
git commit -m "test: trigger workflow"
git push origin main
```

推送后，工作流应该自动运行。


