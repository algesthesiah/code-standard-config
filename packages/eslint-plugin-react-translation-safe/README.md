# eslint-plugin-react-translation-safe

React 国际化安全相关 ESLint 插件，包含以下规则：
- 禁止直接文本节点（no-direct-text-nodes）
- 保护 key 稳定性（protect-key-stability）
- 安全属性检查（safe-attributes）
- 稳定 DOM 结构（stable-dom-structure）

## 用法
在 ESLint 配置中添加插件并启用相关规则。
```js
import reactTranslationSafe from 'eslint-plugin-react-translation-safe';

export default [
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      'react-translation-safe': reactTranslationSafe
    },
    rules: {
      ...reactTranslationSafe.configs.recommended.rules
    }
  }
];
```
