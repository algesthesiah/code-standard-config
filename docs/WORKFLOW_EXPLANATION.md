# 工作流配置说明

## 当前配置的工作流程

### 触发条件
- 推送到 `main` 分支时触发

### 工作流程

1. **检测 changeset 文件**
   - 如果有 changeset 文件（`.changeset/*.md`，排除 README.md）
   - 运行 `changeset version` 更新版本号
   - 提交版本更新（使用 `[skip ci]` 避免触发新的工作流）
   - 然后发布

2. **如果没有 changeset 文件**
   - 直接运行 `changeset publish`
   - `changeset publish` 会自动检查是否有待发布的版本
   - 如果有待发布的版本（本地版本 > npm 版本），则发布
   - 如果没有，则跳过

## 使用方式

### 场景 1：有 changeset 文件

```bash
# 1. 创建 changeset
pnpm changeset

# 2. 提交并推送
git add .changeset
git commit -m "feat: add new feature"
git push origin main

# 3. CI 自动：
#    - 检测到 changeset
#    - 更新版本号
#    - 提交版本更新（[skip ci]）
#    - 发布到 npm
```

### 场景 2：没有 changeset 文件

如果推送时没有 changeset 文件，`changeset publish` 会检查：
- 是否有待发布的版本（本地版本 > npm 版本）
- 如果有，则发布
- 如果没有，则跳过

## 注意事项

1. **`[skip ci]` 标记**：版本更新提交使用 `[skip ci]` 避免触发新的工作流
2. **Trusted Publisher**：使用 npm Trusted Publisher 进行认证，无需 token
3. **自动检测**：`changeset publish` 会自动检测是否需要发布

## 配置检查清单

- [x] 触发条件：推送到 main 分支
- [x] 权限配置：`id-token: write`（用于 Trusted Publisher）
- [x] 版本更新：自动检测 changeset 并更新版本
- [x] 避免循环：使用 `[skip ci]` 标记
- [x] 自动发布：`changeset publish` 自动检测并发布


