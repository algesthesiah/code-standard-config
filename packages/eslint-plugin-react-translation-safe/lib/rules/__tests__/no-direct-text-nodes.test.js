import parser from '@babel/eslint-parser'
import { RuleTester } from 'eslint'

import rule from '../no-direct-text-nodes.js'

const ruleTester = new RuleTester({
  languageOptions: {
    parser,
    parserOptions: {
      requireConfigFile: false,
      ecmaVersion: 2020,
      sourceType: 'module',
      ecmaFeatures: {
        jsx: true,
      },
      babelOptions: {
        presets: ['@babel/preset-react'],
      },
    },
  },
})

ruleTester.run('no-direct-text-nodes', rule, {
  valid: [
    {
      code: `
        const val = true;
        const obj = { a: 'foo' };
        <div>
          {/* ✅ all text nodes are wrapped */}
          <p>
            {val ? <span>foo</span> : <span>bar</span>}
            <span>hello world</span>
          </p>
          <p>
            {/* ✅ val.toLocaleString() is wrapped */}
            {val ? <span>{val.toLocaleString()}</span> : <span>bar</span>}
            <span>hello world</span>
          </p>
          <p>
            {/* ✅ object properties rendering a text node are wrapped */}
            {val ? <span>{obj.a}</span> : <span>bar</span>} <span>hello</span>
          </p>
          <p>
            {/* ✅ 'foo' is wrapped (expression has a sibling) */}
            {val && <span>foo</span>} <span>hello world</span>
          </p>
          {/* ✅ conditionally rendered text, but no siblings */}
          <p>{val || 'bar'}</p>
          {/* ✅ conditionally rendered text, but no siblings */}
          <p>{val ? 'foo' : 'bar'}</p>
        </div>
      `,
      languageOptions: {
        parser,
        parserOptions: {
          requireConfigFile: false,
          ecmaVersion: 2020,
          sourceType: 'module',
          ecmaFeatures: {
            jsx: true,
          },
          babelOptions: {
            presets: ['@babel/preset-react'],
          },
        },
      },
    },
    {
      code: `
        const val = true;
        <div>
          {/* ✅ conditionally rendered text nodes with no siblings won't throw */}
          <p>{val || 'bar'}</p>
          {/* ✅ conditionally rendered text nodes with no siblings won't throw */}
          <p>{val ? 'foo' : 'bar'}</p>
          {/* ✅ conditional expression follows the static text node and won't throw */}
          <p>hello world {val ? <span>foo</span> : <span>bar</span>}</p>
        </div>
      `,
      languageOptions: {
        parser,
        parserOptions: {
          requireConfigFile: false,
          ecmaVersion: 2020,
          sourceType: 'module',
          ecmaFeatures: {
            jsx: true,
          },
          babelOptions: {
            presets: ['@babel/preset-react'],
          },
        },
      },
    },
    {
      code: `
        <div>
          {/* ✅ single text node, no siblings */}
          <p>Hello World</p>
          {/* ✅ single expression, no siblings */}
          <p>{name}</p>
        </div>
      `,
      languageOptions: {
        parser,
        parserOptions: {
          requireConfigFile: false,
          ecmaVersion: 2020,
          sourceType: 'module',
          ecmaFeatures: {
            jsx: true,
          },
          babelOptions: {
            presets: ['@babel/preset-react'],
          },
        },
      },
    },
    {
      code: `
        <div>
          {/* ✅ single text node in Link, no siblings */}
          <Link href="/">Welcome</Link>
          {/* ✅ single text node in button, no siblings */}
          <button>Click me</button>
          {/* ✅ single text node in anchor, no siblings */}
          <a href="/">Home</a>
        </div>
      `,
      languageOptions: {
        parser,
        parserOptions: {
          requireConfigFile: false,
          ecmaVersion: 2020,
          sourceType: 'module',
          ecmaFeatures: {
            jsx: true,
          },
          babelOptions: {
            presets: ['@babel/preset-react'],
          },
        },
      },
    },
  ],
  invalid: [
    {
      code: `
        const val = true;
        const obj = { a: 'foo' };
        <div>
          <p>
            {/* ❌ foo & bar must be wrapped */}
            {val ? 'foo' : 'bar'} <span>hello world</span>
          </p>
          <p>
            {/* ❌ static text nodes must be wrapped when they are preceded by a conditional expression */}
            {val ? <span>foo</span> : <span>bar</span>} hello world
          </p>
          {/* ❌ all text must be wrapped in spans ('foo', 'bar' & 'hello world') */}
          <p>{val ? 'foo' : 'bar'} hello world</p>
          <p>
            {/* ❌ val.toLocaleString() returns a text node and should be wrapped */}
            {val ? val.toLocaleString() : <span>bar</span>} <span>hello world</span>
          </p>
          <p>
            {/* ❌ object properties rendering a text node should be wrapped */}
            {val ? obj.a : <span>bar</span>} <span>hello</span>
          </p>
          <p>
            {/* ❌ 'foo' needs to be wrapped in a span (expression has a sibling) */}
            {val && 'foo'}
            <span>hello world</span>
          </p>
        </div>
      `,
      output: `
        const val = true;
        const obj = { a: 'foo' };
        <div>
          <p>
            {/* ❌ foo & bar must be wrapped */}
            {val ? <span>{'foo'}</span> : <span>{'bar'}</span>} <span>hello world</span>
          </p>
          <p>
            {/* ❌ static text nodes must be wrapped when they are preceded by a conditional expression */}
            {val ? <span>foo</span> : <span>bar</span>}<span> hello world
          </span></p>
          {/* ❌ all text must be wrapped in spans ('foo', 'bar' & 'hello world') */}
          <p>{val ? <span>{'foo'}</span> : <span>{'bar'}</span>} hello world</p>
          <p>
            {/* ❌ val.toLocaleString() returns a text node and should be wrapped */}
            {val ? <span>{val.toLocaleString()}</span> : <span>bar</span>} <span>hello world</span>
          </p>
          <p>
            {/* ❌ object properties rendering a text node should be wrapped */}
            {val ? <span>{obj.a}</span> : <span>bar</span>} <span>hello</span>
          </p>
          <p>
            {/* ❌ 'foo' needs to be wrapped in a span (expression has a sibling) */}
            {val && <span>{'foo'}</span>}
            <span>hello world</span>
          </p>
        </div>
      `,
      languageOptions: {
        parser,
        parserOptions: {
          requireConfigFile: false,
          ecmaVersion: 2020,
          sourceType: 'module',
          ecmaFeatures: {
            jsx: true,
          },
          babelOptions: {
            presets: ['@babel/preset-react'],
          },
        },
      },
      errors: [
        { message: /表达式中的文本节点可能被翻译工具修改/ },
        { message: /直接文本节点/ },
        { message: /表达式中的文本节点可能被翻译工具修改/ },
        { message: /直接文本节点/ },
        { message: /表达式中的文本节点可能被翻译工具修改/ },
        { message: /表达式中的文本节点可能被翻译工具修改/ },
        { message: /表达式中的文本节点可能被翻译工具修改/ },
      ],
    },
    {
      code: `
        <div>
          <p>
            {/* ❌ text node mixed with element */}
            Hello <span>World</span>
          </p>
          <p>
            {/* ❌ text node mixed with expression */}
            Hello {name}
          </p>
        </div>
      `,
      output: `
        <div>
          <p>
            {/* ❌ text node mixed with element */}<span>
            Hello </span><span>World</span>
          </p>
          <p>
            {/* ❌ text node mixed with expression */}<span>
            Hello </span>{name}
          </p>
        </div>
      `,
      languageOptions: {
        parser,
        parserOptions: {
          requireConfigFile: false,
          ecmaVersion: 2020,
          sourceType: 'module',
          ecmaFeatures: {
            jsx: true,
          },
          babelOptions: {
            presets: ['@babel/preset-react'],
          },
        },
      },
      errors: [{ message: /直接文本节点/ }, { message: /直接文本节点/ }],
    },
    {
      code: `
        const isLoading = true;
        <div>
          <p>
            {/* ❌ logical expression with text, mixed with sibling */}
            {isLoading && '加载中'} <span>请稍候</span>
          </p>
        </div>
      `,
      output: `
        const isLoading = true;
        <div>
          <p>
            {/* ❌ logical expression with text, mixed with sibling */}
            {isLoading && <span>{'加载中'}</span>} <span>请稍候</span>
          </p>
        </div>
      `,
      languageOptions: {
        parser,
        parserOptions: {
          requireConfigFile: false,
          ecmaVersion: 2020,
          sourceType: 'module',
          ecmaFeatures: {
            jsx: true,
          },
          babelOptions: {
            presets: ['@babel/preset-react'],
          },
        },
      },
      errors: [{ message: /表达式中的文本节点可能被翻译工具修改/ }],
    },
    {
      code: `
        const val = false;
        <div>
          <p>
            {/* ❌ logical OR expression with text, mixed with sibling */}
            {val || 'default'} <span>text</span>
          </p>
        </div>
      `,
      output: `
        const val = false;
        <div>
          <p>
            {/* ❌ logical OR expression with text, mixed with sibling */}
            {val || <span>{'default'}</span>} <span>text</span>
          </p>
        </div>
      `,
      languageOptions: {
        parser,
        parserOptions: {
          requireConfigFile: false,
          ecmaVersion: 2020,
          sourceType: 'module',
          ecmaFeatures: {
            jsx: true,
          },
          babelOptions: {
            presets: ['@babel/preset-react'],
          },
        },
      },
      errors: [{ message: /表达式中的文本节点可能被翻译工具修改/ }],
    },
    {
      code: `
        const val = true;
        const isLoading = false;
        <div>
          <p>
            {/* ❌ nested ternary expression with text */}
            {val ? (isLoading ? 'loading' : 'ready') : 'idle'} <span>status</span>
          </p>
        </div>
      `,
      output: `
        const val = true;
        const isLoading = false;
        <div>
          <p>
            {/* ❌ nested ternary expression with text */}
            {val ? (isLoading ? <span>{'loading'}</span> : <span>{'ready'}</span>) : <span>{'idle'}</span>} <span>status</span>
          </p>
        </div>
      `,
      languageOptions: {
        parser,
        parserOptions: {
          requireConfigFile: false,
          ecmaVersion: 2020,
          sourceType: 'module',
          ecmaFeatures: {
            jsx: true,
          },
          babelOptions: {
            presets: ['@babel/preset-react'],
          },
        },
      },
      errors: [{ message: /表达式中的文本节点可能被翻译工具修改/ }],
    },
    {
      code: `
        const val = true;
        <div>
          <p>
            {/* ❌ ternary with one branch JSX, other text */}
            {val ? <span>foo</span> : 'bar'} <span>test</span>
          </p>
        </div>
      `,
      output: `
        const val = true;
        <div>
          <p>
            {/* ❌ ternary with one branch JSX, other text */}
            {val ? <span>foo</span> : <span>{'bar'}</span>} <span>test</span>
          </p>
        </div>
      `,
      languageOptions: {
        parser,
        parserOptions: {
          requireConfigFile: false,
          ecmaVersion: 2020,
          sourceType: 'module',
          ecmaFeatures: {
            jsx: true,
          },
          babelOptions: {
            presets: ['@babel/preset-react'],
          },
        },
      },
      errors: [{ message: /表达式中的文本节点可能被翻译工具修改/ }],
    },
    {
      code: `
        const name = 'John';
        <div>
          <p>
            {/* ❌ template literal with sibling */}
            {\`Hello \${name}\`} <span>world</span>
          </p>
        </div>
      `,
      output: `
        const name = 'John';
        <div>
          <p>
            {/* ❌ template literal with sibling */}
            <span>{\`Hello \${name}\`}</span> <span>world</span>
          </p>
        </div>
      `,
      languageOptions: {
        parser,
        parserOptions: {
          requireConfigFile: false,
          ecmaVersion: 2020,
          sourceType: 'module',
          ecmaFeatures: {
            jsx: true,
          },
          babelOptions: {
            presets: ['@babel/preset-react'],
          },
        },
      },
      errors: [{ message: /表达式中的文本节点可能被翻译工具修改/ }],
    },
  ],
})
