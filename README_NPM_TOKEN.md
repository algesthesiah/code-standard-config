# NPM Token 快速设置

## 快速开始

### 方式 1：使用自动化脚本（推荐）

```bash
./scripts/setup-npm-token.sh
```

脚本会引导你：
1. 创建新的 npm token（需要输入密码和 2FA）
2. 或输入已有的 token
3. 自动创建 `.npmrc.local` 文件

### 方式 2：手动创建

1. **创建 npm token**：
   ```bash
   npm token create --read-only=false
   ```
   复制生成的 token（格式：`npm_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`）

2. **配置 token**：

   在项目根目录创建 `.npmrc.local` 文件：
   ```bash
   echo "//registry.npmjs.org/:_authToken=YOUR_TOKEN_HERE" > .npmrc.local
   ```

   或者直接编辑 `.npmrc` 文件，取消注释并填入 token：
   ```
   //registry.npmjs.org/:_authToken=YOUR_TOKEN_HERE
   ```

3. **验证配置**：
   ```bash
   npm whoami
   ```
   如果显示你的用户名，说明配置成功。

## 使用

配置完成后，发布时不再需要输入 2FA 密码：

```bash
pnpm release
```

## 安全提示

- ✅ `.npmrc.local` 文件已被添加到 `.gitignore`，不会被提交
- ⚠️ 如果直接在 `.npmrc` 中添加 token，请确保不要提交到 git
- 🔒 如果 token 泄露，立即在 [npm 网站](https://www.npmjs.com/settings/[你的用户名]/tokens) 删除该 token

## 查看和管理 Token

```bash
# 列出所有 token
npm token list

# 删除指定 token
npm token revoke <token-id>
```

