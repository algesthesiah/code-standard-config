import type { Linter } from 'eslint'

import {
  command,
  comments,
  disableds,
  ignores,
  importPluginConfig,
  javascript,
  jsdoc,
  jsonc,
  node,
  perfectionist,
  prettier,
  react,
  regexp,
  test,
  turbo,
  unicorn,
} from './configs'
import { customConfig } from './custom-config'

type FlatConfig = Linter.Config

type FlatConfigPromise = FlatConfig | FlatConfig[] | Promise<FlatConfig> | Promise<FlatConfig[]>

async function defineConfig(config: FlatConfig[] = []) {
  const configs: FlatConfigPromise[] = [
    react(),
    javascript(),
    ignores(),
    prettier(),
    jsonc(),
    disableds(),
    importPluginConfig(),
    node(),
    perfectionist(),
    comments(),
    jsdoc(),
    unicorn(),
    test(),
    regexp(),
    command(),
    turbo(),
    ...customConfig,
    {
      settings: {
        react: {
          version: 'detect',
        },
      },
    },
    ...config,
  ]

  const resolved = await Promise.all(configs)

  return resolved.flat()
}

export { defineConfig }
