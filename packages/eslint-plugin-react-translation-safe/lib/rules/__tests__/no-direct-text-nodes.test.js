import parser from '@babel/eslint-parser'
import { RuleTester } from 'eslint'

import rule from '../no-direct-text-nodes.js'

const parserOptions = {
  requireConfigFile: false,
  ecmaVersion: 2020,
  sourceType: 'module',
  ecmaFeatures: {
    jsx: true,
  },
  babelOptions: {
    presets: ['@babel/preset-react'],
  },
}

const ruleTester = new RuleTester({
  languageOptions: {
    parser,
    parserOptions,
  },
})

// 基础场景测试
ruleTester.run('no-direct-text-nodes - basic scenarios', rule, {
  valid: [
    {
      code: `
        <div>
          {/* ✅ single text node, no siblings */}
          <p>Hello World</p>
          {/* ✅ single expression, no siblings */}
          <p>{name}</p>
        </div>
      `,
      languageOptions: { parser, parserOptions },
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
      languageOptions: { parser, parserOptions },
    },
    {
      code: `
        <div>
          {/* ✅ empty text nodes should be ignored */}
          <p>{' '}</p>
          <p>{'   '}</p>
        </div>
      `,
      languageOptions: { parser, parserOptions },
    },
  ],
  invalid: [
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
      languageOptions: { parser, parserOptions },
      errors: [{ message: /直接文本节点/ }, { message: /直接文本节点/ }],
    },
    {
      code: `
        <div>
          {/* ❌ multiple text nodes mixed with elements */}
          <p>
            First <span>Middle</span> Second <span>End</span> Third
          </p>
        </div>
      `,
      output: `
        <div>
          {/* ❌ multiple text nodes mixed with elements */}
          <p><span>
            First </span><span>Middle</span><span> Second </span><span>End</span><span> Third
          </span></p>
        </div>
      `,
      languageOptions: { parser, parserOptions },
      errors: [{ message: /直接文本节点/ }, { message: /直接文本节点/ }, { message: /直接文本节点/ }],
    },
  ],
})

// 条件表达式测试
ruleTester.run('no-direct-text-nodes - conditional expressions', rule, {
  valid: [
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
      languageOptions: { parser, parserOptions },
    },
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
        </div>
      `,
      languageOptions: { parser, parserOptions },
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
            {/* ❌ 'foo' needs to be wrapped in a span (expression has a sibling) */}
            {val && <span>{'foo'}</span>}
            <span>hello world</span>
          </p>
        </div>
      `,
      languageOptions: { parser, parserOptions },
      errors: [
        { message: /表达式中的文本节点可能被翻译工具修改/ },
        { message: /直接文本节点/ },
        { message: /表达式中的文本节点可能被翻译工具修改/ },
        { message: /直接文本节点/ },
        { message: /表达式中的文本节点可能被翻译工具修改/ },
      ],
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
      languageOptions: { parser, parserOptions },
      errors: [{ message: /表达式中的文本节点可能被翻译工具修改/ }],
    },
    {
      code: `
        const val = true;
        const isLoading = false;
        <div>
          {/* ❌ complex nested ternary with text and siblings */}
          <p>
            {val ? (isLoading ? 'loading' : 'ready') : 'idle'} <span>status</span>
            <span>extra</span>
          </p>
        </div>
      `,
      output: `
        const val = true;
        const isLoading = false;
        <div>
          {/* ❌ complex nested ternary with text and siblings */}
          <p>
            {val ? (isLoading ? <span>{'loading'}</span> : <span>{'ready'}</span>) : <span>{'idle'}</span>} <span>status</span>
            <span>extra</span>
          </p>
        </div>
      `,
      languageOptions: { parser, parserOptions },
      errors: [{ message: /表达式中的文本节点可能被翻译工具修改/ }],
    },
  ],
})

// 逻辑表达式测试
ruleTester.run('no-direct-text-nodes - logical expressions', rule, {
  valid: [
    {
      code: `
        const val = true;
        <div>
          {/* ✅ conditionally rendered text, but no siblings */}
          <p>{val || 'bar'}</p>
          {/* ✅ conditionally rendered text, but no siblings */}
          <p>{val ? 'foo' : 'bar'}</p>
        </div>
      `,
      languageOptions: { parser, parserOptions },
    },
  ],
  invalid: [
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
      languageOptions: { parser, parserOptions },
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
      languageOptions: { parser, parserOptions },
      errors: [{ message: /表达式中的文本节点可能被翻译工具修改/ }],
    },
    {
      code: `
        const val = true;
        <div>
          {/* ❌ logical AND with text and multiple siblings */}
          <p>
            {val && 'text'} <span>middle</span> {val && 'text'}
          </p>
        </div>
      `,
      output: `
        const val = true;
        <div>
          {/* ❌ logical AND with text and multiple siblings */}
          <p>
            {val && <span>{'text'}</span>} <span>middle</span> {val && <span>{'text'}</span>}
          </p>
        </div>
      `,
      languageOptions: { parser, parserOptions },
      errors: [
        { message: /表达式中的文本节点可能被翻译工具修改/ },
        { message: /表达式中的文本节点可能被翻译工具修改/ },
      ],
    },
    {
      code: `
        const val = true;
        <div>
          {/* ❌ logical OR with text fallback and sibling */}
          <p>
            {val || 'default'} <span>text</span>
          </p>
        </div>
      `,
      output: `
        const val = true;
        <div>
          {/* ❌ logical OR with text fallback and sibling */}
          <p>
            {val || <span>{'default'}</span>} <span>text</span>
          </p>
        </div>
      `,
      languageOptions: { parser, parserOptions },
      errors: [{ message: /表达式中的文本节点可能被翻译工具修改/ }],
    },
  ],
})

// 函数调用测试（应该被忽略）
ruleTester.run('no-direct-text-nodes - function calls (ignored)', rule, {
  valid: [
    {
      code: `
        const t = (config) => config.id;
        <div>
          {/* ✅ function call should be ignored */}
          <span className={styles.amount}>
            {t({
              id: "header.noticeCountTipNew",
              values: { num: 5 },
            })}
          </span>
        </div>
      `,
      languageOptions: { parser, parserOptions },
    },
    {
      code: `
        const sb = () => 'some text';
        <div>
          {/* ✅ function call should be ignored */}
          <span className={styles.amount}>
            {sb()}
          </span>
        </div>
      `,
      languageOptions: { parser, parserOptions },
    },
    {
      code: `
        const i18n = { t: (id) => id };
        <div>
          {/* ✅ member function call should be ignored */}
          <span>{i18n.t('hello')}</span>
        </div>
      `,
      languageOptions: { parser, parserOptions },
    },
    {
      code: `
        const getText = () => 'text';
        const isLoading = true;
        <div>
          {/* ✅ function call in logical expression should be ignored */}
          {isLoading && getText()}
          {isLoading || getText()}
        </div>
      `,
      languageOptions: { parser, parserOptions },
    },
    {
      code: `
        const getText = () => 'text';
        const val = true;
        <div>
          {/* ✅ function call in ternary expression should be ignored */}
          {val ? getText() : 'fallback'}
          {val ? 'text' : getText()}
          {val ? getText() : getText()}
        </div>
      `,
      languageOptions: { parser, parserOptions },
    },
    {
      code: `
        const renderNumber = (num) => num.toString();
        const unreadNum = 5;
        <div>
          {/* ✅ nested function calls should be ignored */}
          <span className={styles.amount}>
            {t({
              id: "header.noticeCountTipNew",
              values: {
                num: renderNumber(unreadNum),
          },
            })}
          </span>
        </div>
      `,
      languageOptions: { parser, parserOptions },
    },
    {
      code: `
        const Component = () => {
          const handleClick = () => {};
          return (
            <div>
              {/* ✅ function call with member expression */}
              <span>{this.formatMessage('hello')}</span>
              <span>{obj.method()}</span>
              <span>{utils.format('text')}</span>
            </div>
          );
        };
      `,
      languageOptions: { parser, parserOptions },
    },
    {
      code: `
        const val = true;
        <div>
          {/* ❌ ternary with function call in one branch, text in other */}
          <p>
            {val ? formatText() : 'fallback'} <span>test</span>
          </p>
        </div>
      `,
      output: `
        const val = true;
        <div>
          {/* ❌ ternary with function call in one branch, text in other */}
          <p>
            {val ? formatText() : <span>{'fallback'}</span>} <span>test</span>
          </p>
        </div>
      `,
      languageOptions: { parser, parserOptions },
      errors: [{ message: /表达式中的文本节点可能被翻译工具修改/ }],
    },
  ],
  invalid: [],
})

// 数字表达式测试（不应该报错）
ruleTester.run('no-direct-text-nodes - numeric expressions', rule, {
  valid: [
    {
      code: `
        <div className="space-y-4">
          {Array.from({ length: 50 }, (_, i) => (
            <p className="text-text_primary" key={i}>
              <span>这是第 </span>
              {i + 1}
              <span>
                <span>
                  段内容。当内容超出抽屉高度时，内容区域会出现滚动条。
                </span>
              </span>
            </p>
          ))}
        </div>
      `,
      languageOptions: { parser, parserOptions },
    },
    {
      code: `
        <div>
          <p>
            <span>Count: </span>
            {count}
            <span> items</span>
          </p>
        </div>
      `,
      languageOptions: { parser, parserOptions },
    },
    {
      code: `
        <div>
          <span>Price: </span>
          {price * quantity}
          <span> yuan</span>
        </div>
      `,
      languageOptions: { parser, parserOptions },
    },
  ],
  invalid: [],
})

// 数组方法测试
ruleTester.run('no-direct-text-nodes - array methods', rule, {
  valid: [
    {
      code: `
        const markKeys = ['key1', 'key2'];
        <div>
          {/* ✅ array method call (map) returns JSX elements array, should not be wrapped */}
          {markKeys.map((key, index) => {
            return <span key={index}>{key}</span>;
          })}
        </div>
      `,
      languageOptions: { parser, parserOptions },
    },
    {
      code: `
        const items = [1, 2, 3];
        <div>
          {/* ✅ array method call (filter) returns JSX elements array, should not be wrapped */}
          {items.filter(item => item > 1).map(item => <span key={item}>{item}</span>)}
        </div>
      `,
      languageOptions: { parser, parserOptions },
    },
    {
      code: `
        const markKeys = ['key1', 'key2'];
        <div>
          {/* ✅ array method call (map) inside span should not be wrapped */}
          <span>{markKeys.map((key, index) => {
            return <span key={index}>{key}</span>;
          })}</span>
        </div>
      `,
      languageOptions: { parser, parserOptions },
    },
    {
      code: `
        const items = [1, 2, 3];
        <div>
          {/* ✅ array methods: flatMap, reduce, reduceRight, flat */}
          {items.flatMap(x => [x, x * 2])}
          {items.reduce((acc, x) => acc + x, 0)}
          {items.reduceRight((acc, x) => acc + x, 0)}
          {items.flat()}
        </div>
      `,
      languageOptions: { parser, parserOptions },
    },
  ],
  invalid: [],
})

// 模板字符串和成员表达式测试
ruleTester.run('no-direct-text-nodes - template literals and member expressions', rule, {
  valid: [],
  invalid: [
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
      languageOptions: { parser, parserOptions },
      errors: [{ message: /表达式中的文本节点可能被翻译工具修改/ }],
    },
    {
      code: `
        const obj = { name: 'John' };
        <div>
          {/* ❌ member expression (property access) with sibling */}
          <p>{obj.name} <span>test</span></p>
        </div>
      `,
      output: `
        const obj = { name: 'John' };
        <div>
          {/* ❌ member expression (property access) with sibling */}
          <p><span>{obj.name}</span> <span>test</span></p>
        </div>
      `,
      languageOptions: { parser, parserOptions },
      errors: [{ message: /表达式中的文本节点可能被翻译工具修改/ }],
    },
  ],
})

// 允许的标签测试
ruleTester.run('no-direct-text-nodes - allowed tags', rule, {
  valid: [
    {
      code: `
        <div>
          {/* ✅ allowed tags should be ignored */}
          <title>Page Title</title>
          <script>console.log('test')</script>
          <style>{'.class { color: red; }'}</style>
          <textarea>Enter text</textarea>
          <option>Option 1</option>
        </div>
      `,
      languageOptions: { parser, parserOptions },
    },
  ],
  invalid: [],
})

// 配置选项测试
ruleTester.run('no-direct-text-nodes - configuration options', rule, {
  valid: [
    {
      code: `
        <div>
          {/* ✅ custom allowed tag */}
          <custom-tag>Text content</custom-tag>
        </div>
      `,
      options: [{ allowedTags: ['custom-tag'] }],
      languageOptions: { parser, parserOptions },
    },
  ],
  invalid: [
    {
      code: `
        <div>
          <p>Hello <span>World</span></p>
        </div>
      `,
      output: `
        <div>
          <p><div>Hello </div><span>World</span></p>
        </div>
      `,
      options: [{ wrapperElement: 'div' }],
      languageOptions: { parser, parserOptions },
      errors: [{ message: /直接文本节点/ }],
    },
    {
      code: `
        <div>
          <p>Hello <span>World</span></p>
        </div>
      `,
      output: `
        <div>
          <p><p>Hello </p><span>World</span></p>
        </div>
      `,
      options: [{ wrapperElement: 'p' }],
      languageOptions: { parser, parserOptions },
      errors: [{ message: /直接文本节点/ }],
    },
  ],
})
