# NPM Token 故障排除

## 问题：每次发布都需要在浏览器中点击认证

### 原因分析

即使配置了 token，changesets 在发布时仍然要求浏览器认证，可能的原因：

1. **Token 类型不对**：当前使用的是 "Publish token"，可能需要 "Automation token"
2. **Token 权限不足**：token 可能没有足够的发布权限
3. **Changesets 没有正确读取 token**：虽然 `.npmrc` 中有 token，但 changesets 可能使用了不同的认证方式

### 解决方案

#### 方案 1：创建 Automation Token（推荐）

Automation token 专门用于 CI/CD 和自动化发布，不需要浏览器认证：

```bash
npm token create --read-only=false --type=automation
```

然后将生成的 token 更新到 `.npmrc.local` 文件中。

#### 方案 2：检查 Token 权限

查看当前 token 的权限：

```bash
npm token list
```

确保 token 类型是 "Automation" 或 "Publish"，并且有发布权限。

#### 方案 3：使用 npm login 重新认证

如果 token 不工作，可以尝试重新登录：

```bash
npm login
```

这会创建一个新的 session，但每次发布仍可能需要 2FA。

### 验证 Token 是否生效

```bash
# 检查 token 是否有效
npm whoami --registry=https://registry.npmjs.org/

# 如果显示你的用户名，说明 token 有效
```

### 最佳实践

1. **使用 Automation Token**：专门用于自动化发布，不需要浏览器认证
2. **定期轮换 Token**：建议每 90 天更换一次
3. **不要在代码中硬编码 Token**：使用 `.npmrc.local` 或环境变量
4. **在 CI/CD 中使用环境变量**：将 token 配置为 secret

### 创建 Automation Token 的完整步骤

1. 登录 npm（如果需要）：
   ```bash
   npm login
   ```

2. 创建 Automation token：
   ```bash
   npm token create --read-only=false --type=automation
   ```

3. 复制生成的 token（格式：`npm_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`）

4. 更新 `.npmrc.local`：
   ```bash
   echo "//registry.npmjs.org/:_authToken=你的新token" > .npmrc.local
   ```

5. 验证 token：
   ```bash
   npm whoami
   ```

6. 测试发布：
   ```bash
   pnpm release
   ```

现在应该不需要浏览器认证了。

