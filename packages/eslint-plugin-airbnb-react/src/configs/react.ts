/*
 * @Owner: Luke
 */
import type { Linter } from 'eslint'

import reactTranslationSafe from '@ss/eslint-plugin-react-translation-safe'

import { interopDefault } from '../util'

export async function react(): Promise<Linter.Config[]> {
  const [reactPlugin, reactHooks, jsxA11y, globals, tseslint, rtlFriendly] = await Promise.all([
    interopDefault(import('eslint-plugin-react')),
    interopDefault(import('eslint-plugin-react-hooks')),
    interopDefault(import('eslint-plugin-jsx-a11y')),
    interopDefault(import('globals')),
    interopDefault(import('typescript-eslint')),
    interopDefault(import('eslint-plugin-rtl-friendly')),
  ] as const)
  return [
    reactPlugin.configs.flat.recommended ?? {},
    reactHooks.configs.flat.recommended ?? {},
    ...tseslint.configs.recommended,
    rtlFriendly.configs.recommended,
    {
      files: ['**/*.{js,jsx,mjs,cjs,ts,tsx}'],
      settings: {
        react: {
          version: 'detect',
        },
      },
      languageOptions: {
        ...reactPlugin.configs.flat.recommended?.languageOptions,
        parser: tseslint.parser,
        globals: {
          ...globals.serviceworker,
          ...globals.browser,
        },
      },
      plugins: {
        'react': reactPlugin,
        'react-hooks': reactHooks as any,
        'jsx-a11y': jsxA11y,
        '@typescript-eslint': tseslint.plugin,
        'react-translation-safe': reactTranslationSafe,
      },
      rules: {
        ...reactTranslationSafe.configs.recommended.rules,
        // 推荐关闭的规则
        'react/destructuring-assignment': 'off',
        'react/no-danger': 'warn', // 使用时警告
        'react/jsx-curly-brace-presence': 'off',
        'react/jsx-props-no-spreading': 'off', // 允许 props 展开
        'react/jsx-pascal-case': 'error', // 强制组件 PascalCase
        'react/jsx-no-undef': ['error', { allowGlobals: true }],
        'react/no-direct-mutation-state': 'error',
        'react/self-closing-comp': [
          'error',
          {
            component: true,
            html: false,
          },
        ],
        // hooks 最佳实践
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'warn',
        // 文件扩展名
        'react/jsx-filename-extension': ['error', { extensions: ['.tsx', '.jsx'] }],
        // 类型校验（TypeScript 项目可关闭 prop-types）
        'react/prop-types': 'off',
        'react/display-name': 'off',
        'react/jsx-no-target-blank': 'error',
        'react/no-array-index-key': 'warn',
        'react/require-default-props': 'off',
        'react/no-unused-prop-types': 'off',
        'react/jsx-no-bind': 'warn',
        'jsx-a11y/aria-role': 'off',
        'jsx-a11y/anchor-is-valid': 'off',
        'jsx-a11y/click-events-have-key-events': 'off',
        'jsx-a11y/no-static-element-interactions': 'off',
        'jsx-a11y/label-has-associated-control': 'off',
        'jsx-a11y/no-noninteractive-element-interactions': 'off',
        '@typescript-eslint/no-use-before-define': 'warn',
        '@typescript-eslint/no-shadow': ['warn'],
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/ban-ts-comment': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/no-empty-function': 'off',
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/no-unused-vars': 'warn',
        // 禁用旧的规则，启用新 JSX 转换后不再需要导入 React
        'react/react-in-jsx-scope': 'off',
        'rtl-friendly/no-physical-properties': 'error',
        'quotes': ['error', 'single', { avoidEscape: true }],
        '@typescript-eslint/quotes': ['error', 'single', { avoidEscape: true }],
      },
    },
  ]
}
