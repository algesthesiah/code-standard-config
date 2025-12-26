# 创建 NPM Automation Token

## 方式 1：通过 npm 网站创建（推荐）

### 直接访问 URL

根据你的 npm 用户名，直接访问：

**https://www.npmjs.com/settings/algesthesiahunter/tokens**

或者：

1. 访问 npm 官网：https://www.npmjs.com/
2. 登录你的账户
3. 点击右上角的头像
4. 选择 **"Access Tokens"**（访问令牌）
5. 点击 **"Generate New Token"**（生成新令牌）

### 如果看到 "Granular Access Token" 选项：

6. 选择 **"Granular Access Token"**（精细访问令牌）
7. 配置权限：
   - **Token name**：给 token 起个名字（如 "CI/CD Release Token"）
   - **Expiration**：设置有效期（建议至少 90 天）
   - **Packages**：选择 "All packages"（所有包）或指定特定包
   - **Permissions**：选择 "Read and Publish"（读取和发布）
8. 点击 **"Generate Token"**
9. **立即复制 token**（关闭页面后无法再次查看）

### 如果看到 "Automation" 选项：

6. 选择 **"Automation"** 类型
7. 配置权限：
   - **权限级别**：选择 "Read and Write"（读写权限）
   - **包和范围**：选择 "All packages"（所有包）或指定特定包
   - **到期日期**：设置有效期（建议至少 90 天）
8. 点击 **"Generate Token"**
9. **立即复制 token**（关闭页面后无法再次查看）

### 如果只有 "Classic Token" 选项：

6. 选择 **"Classic Token"** 类型
7. 选择 **"Automation"** 或 **"Publish"** 权限
8. 点击 **"Generate Token"**
9. **立即复制 token**（关闭页面后无法再次查看）

### 配置 Token

将生成的 token 更新到 `.npmrc.local`：

```bash
echo "//registry.npmjs.org/:_authToken=你的automation_token" > .npmrc.local
```

## 方式 2：通过命令行创建

如果网站没有 Automation 选项，可以通过命令行创建：

```bash
npm token create --read-only=false
```

这会提示你输入：
1. npm 密码
2. 2FA 一次性密码（如果启用了 2FA）

**注意**：命令行创建的 token 默认是 "Publish" 类型，可能仍然需要浏览器认证。如果网站有 "Granular Access Token" 选项，建议使用网站创建。

## 验证 Token

```bash
npm whoami
```

如果显示你的用户名，说明 token 配置成功。

## 注意事项

- ✅ Automation token 不需要浏览器认证，适合自动化发布
- ⚠️ 生成后立即复制保存，关闭页面后无法再次查看
- 🔒 定期轮换 token（建议每 90 天）
- 🚫 不要将 token 提交到 git

