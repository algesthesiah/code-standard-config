# 发布流程指南

## 触发 CI 发布的完整步骤

### 第一步：创建 Changeset

在项目**根目录**运行：

```bash
pnpm changeset
```

这会引导你：
1. 选择要变更的包（使用空格选择，回车确认）
2. 选择变更类型：
   - `major` - 重大变更（破坏性更新）
   - `minor` - 新功能（向后兼容）
   - `patch` - 修复（向后兼容）
3. 输入变更描述

完成后会在 `.changeset/` 目录下生成一个 markdown 文件（如 `good-deer-cross.md`）

### 第二步：提交并推送

```bash
# 添加 changeset 文件
git add .changeset

# 提交
git commit -m "chore: add changeset"

# 推送到 main 分支
git push origin main
```

### 第三步：等待 CI 自动处理

GitHub Actions 会自动：

1. **检测到 changeset 文件**
2. **如果有多个 changeset**：
   - 创建版本更新 PR（标题：`chore: version packages`）
   - 自动更新所有包的版本号
   - 生成 CHANGELOG
   - 你需要**合并这个 PR**
3. **合并 PR 后**（或只有一个 changeset 时）：
   - 自动构建所有包
   - 自动发布到 npm
   - 使用 GitHub Trusted Publisher 进行认证（无需 token）

## 流程图

```
1. 修改代码
   ↓
2. pnpm changeset (创建变更记录)
   ↓
3. git add .changeset && git commit && git push
   ↓
4. GitHub Actions 触发
   ↓
5. 有多个 changeset？
   ├─ 是 → 创建版本更新 PR → 合并 PR → 自动发布
   └─ 否 → 直接自动发布
```

## 示例

### 场景 1：单个包的小修复

```bash
# 1. 创建 changeset
pnpm changeset
# 选择：eslint-plugin-react-translation-safe
# 类型：patch
# 描述：修复数字表达式误报问题

# 2. 提交
git add .changeset
git commit -m "chore: add changeset for translation-safe fix"
git push origin main

# 3. CI 会自动发布
```

### 场景 2：多个包同时更新

```bash
# 1. 创建多个 changeset
pnpm changeset  # 为包 A 创建
pnpm changeset  # 为包 B 创建

# 2. 提交
git add .changeset
git commit -m "chore: add changesets"
git push origin main

# 3. CI 会创建版本更新 PR
# 4. 合并 PR 后自动发布
```

## 重要提示

✅ **必须在根目录运行** `pnpm changeset`，不要在子包目录中运行

✅ **必须推送到 main 分支**，工作流只监听 main 分支

✅ **Trusted Publisher 已配置**，无需手动配置 npm token

✅ **自动处理版本号**，不需要手动更新 package.json

## 查看发布状态

1. 访问 GitHub Actions：`https://github.com/algesthesiah/code-standard-config/actions`
2. 查看 "Version and Publish" 工作流
3. 查看发布日志确认是否成功

## 故障排除

### CI 没有触发？

- 检查是否推送到 `main` 分支
- 检查 `.changeset/` 目录下是否有 `.md` 文件
- 查看 GitHub Actions 页面是否有错误

### 发布失败？

- 检查 Trusted Publisher 是否已正确配置
- 查看 GitHub Actions 日志中的错误信息
- 确认包的 `package.json` 配置正确

