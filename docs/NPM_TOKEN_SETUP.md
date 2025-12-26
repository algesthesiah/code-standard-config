# NPM Token 配置指南

为了避免每次发布时都需要输入 2FA 密码，可以创建并使用 npm token。

## 创建 NPM Token

### 方式 1：通过命令行创建（推荐）

```bash
npm token create --read-only=false
```

这会提示你输入：
1. npm 密码
2. 2FA 一次性密码（如果启用了 2FA）

创建成功后，会显示类似这样的 token：
```
npm_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 方式 2：通过 npm 网站创建

1. 访问 https://www.npmjs.com/settings/[你的用户名]/tokens
2. 点击 "Generate New Token"
3. 选择 "Automation" 类型（用于 CI/CD 和自动化发布）
4. 复制生成的 token

## 配置 Token

### 方式 1：添加到 .npmrc（本地开发）

在项目根目录的 `.npmrc` 文件中添加：

```
//registry.npmjs.org/:_authToken=YOUR_NPM_TOKEN_HERE
```

**⚠️ 注意**：如果 `.npmrc` 文件会被提交到 git，请确保 token 不会被提交。建议：
- 使用环境变量：`//registry.npmjs.org/:_authToken=${NPM_TOKEN}`
- 或者将 `.npmrc` 添加到 `.gitignore`（但会丢失其他配置）

### 方式 2：使用环境变量（推荐，适合 CI/CD）

在 `.npmrc` 中使用环境变量：

```
//registry.npmjs.org/:_authToken=${NPM_TOKEN}
```

然后在发布前设置环境变量：

```bash
export NPM_TOKEN=your_token_here
pnpm release
```

或者在 CI/CD 中配置环境变量。

### 方式 3：使用 pnpm 的配置

pnpm 会自动读取 `.npmrc` 中的 token 配置。

## 验证 Token

创建 token 后，可以验证是否生效：

```bash
npm whoami --registry=https://registry.npmjs.org/
```

如果显示你的用户名，说明 token 配置成功。

## 安全建议

1. **不要将 token 提交到 git**
   - 使用环境变量
   - 或者使用 `.npmrc.local` 文件（添加到 `.gitignore`）

2. **定期轮换 token**
   - 建议每 90 天更换一次
   - 删除不再使用的 token

3. **使用最小权限**
   - 如果只需要发布，使用 `--read-only=false` 创建
   - 不要使用账户密码作为 token

4. **在 CI/CD 中使用环境变量**
   - 在 GitHub Actions、GitLab CI 等平台配置 secret
   - 不要硬编码 token

## 删除 Token

如果 token 泄露或不再需要：

```bash
# 列出所有 token
npm token list

# 删除指定 token
npm token revoke <token-id>
```


