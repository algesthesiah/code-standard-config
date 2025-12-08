# ESLint 规则检测场景对比

## 规则说明
当文本节点与其他元素/表达式**混合**时，需要包裹文本节点，防止翻译工具破坏 DOM 结构。

---

## 场景 1: 直接文本节点与元素混合

### ❌ 错误（会被检测）
```jsx
<p>
  Hello <span>World</span>
</p>
```

### ✅ 正确（自动修复后）
```jsx
<p>
  <span>Hello </span><span>World</span>
</p>
```

---

## 场景 2: 直接文本节点与表达式混合

### ❌ 错误（会被检测）
```jsx
<p>
  Hello {name}
</p>
```

### ✅ 正确（自动修复后）
```jsx
<p>
  <span>Hello </span>{name}
</p>
```

**说明：**
- 只包裹文本节点 `Hello`，标识符 `{name}` 不会被包裹（因为无法静态分析其返回类型）
- **⚠️ 风险提示**：如果 `{name}` 是动态字符串且会更新，谷歌翻译后可能导致 React diff 算法不匹配
- **💡 建议**：如果确定 `{name}` 是字符串类型，建议手动包裹：`<span>Hello </span><span>{name}</span>`

---

## 场景 3: 三元表达式返回文本（有兄弟节点）

### ❌ 错误（会被检测）
```jsx
<p>
  {val ? 'foo' : 'bar'} <span>hello world</span>
</p>
```

### ✅ 正确（自动修复后）
```jsx
<p>
  {val ? <span>{'foo'}</span> : <span>{'bar'}</span>} <span>hello world</span>
</p>
```

---

## 场景 4: 逻辑表达式 && 返回文本（有兄弟节点）

### ❌ 错误（会被检测）
```jsx
<p>
  {isLoading && '加载中'} <span>请稍候</span>
</p>
```

### ✅ 正确（自动修复后）
```jsx
<p>
  {isLoading && <span>{'加载中'}</span>} <span>请稍候</span>
</p>
```

---

## 场景 5: 逻辑表达式 || 返回文本（有兄弟节点）

### ❌ 错误（会被检测）
```jsx
<p>
  {val || 'default'} <span>text</span>
</p>
```

### ✅ 正确（自动修复后）
```jsx
<p>
  {val || <span>{'default'}</span>} <span>text</span>
</p>
```

---

## 场景 6: 嵌套的三元表达式

### ❌ 错误（会被检测）
```jsx
<p>
  {val ? (isLoading ? 'loading' : 'ready') : 'idle'} <span>status</span>
</p>
```

### ✅ 正确（自动修复后）
```jsx
<p>
  {val ? (isLoading ? <span>{'loading'}</span> : <span>{'ready'}</span>) : <span>{'idle'}</span>} <span>status</span>
</p>
```

---

## 场景 7: 三元表达式一个分支是 JSX，另一个是文本

### ❌ 错误（会被检测）
```jsx
<p>
  {val ? <span>foo</span> : 'bar'} <span>test</span>
</p>
```

### ✅ 正确（自动修复后）
```jsx
<p>
  {val ? <span>foo</span> : <span>{'bar'}</span>} <span>test</span>
</p>
```

---

## 场景 8: 函数调用返回文本（有兄弟节点）

### ❌ 错误（会被检测）
```jsx
<p>
  {val ? val.toLocaleString() : <span>bar</span>} <span>hello world</span>
</p>
```

### ✅ 正确（自动修复后）
```jsx
<p>
  {val ? <span>{val.toLocaleString()}</span> : <span>bar</span>} <span>hello world</span>
</p>
```

---

## 场景 9: 对象属性返回文本（有兄弟节点）

### ❌ 错误（会被检测）
```jsx
<p>
  {val ? obj.a : <span>bar</span>} <span>hello</span>
</p>
```

### ✅ 正确（自动修复后）
```jsx
<p>
  {val ? <span>{obj.a}</span> : <span>bar</span>} <span>hello</span>
</p>
```

---

## 场景 10: 模板字符串（有兄弟节点）

### ❌ 错误（会被检测）
```jsx
<p>
  {`Hello ${name}`} <span>world</span>
</p>
```

### ✅ 正确（自动修复后）
```jsx
<p>
  <span>{`Hello ${name}`}</span> <span>world</span>
</p>
```

---

## ✅ 不会检测的场景（这些是正确的）

### 1. 单独的文本节点（无兄弟节点）
```jsx
<p>Hello World</p>  ✅ 正确，不会报错
<Link href="/">Welcome</Link>  ✅ 正确，不会报错
<a href="/">Click me</a>  ✅ 正确，不会报错
<button>Submit</button>  ✅ 正确，不会报错
```

### 2. 单独的表达式（无兄弟节点）
```jsx
<p>{name}</p>  ✅ 正确，不会报错
<p>{val ? 'foo' : 'bar'}</p>  ✅ 正确，不会报错
<p>{val || 'bar'}</p>  ✅ 正确，不会报错
```

### 3. 表达式返回 JSX 元素
```jsx
<p>
  {val ? <span>foo</span> : <span>bar</span>}
</p>  ✅ 正确，不会报错

<p>
  hello world {val ? <span>foo</span> : <span>bar</span>}
</p>  ✅ 正确，不会报错（文本在表达式之前，且表达式返回 JSX）
```

### 4. 允许的标签（title, script, style, textarea, option）
```jsx
<title>Page Title</title>  ✅ 正确，不会报错
<script>console.log('hello')</script>  ✅ 正确，不会报错
<style>body { color: red; }</style>  ✅ 正确，不会报错
```

---

## 总结

**核心规则：**
- ❌ **错误**：文本节点与其他元素/表达式**混合**时，需要包裹
- ✅ **正确**：单独的文本节点或表达式，不需要包裹

**检测条件：**
1. 文本节点与 JSX 元素混合 → 需要包裹文本
2. 文本节点与表达式混合 → 需要包裹文本
3. 表达式返回文本 + 有兄弟节点 → 需要包裹表达式中的文本
4. 单独的文本或表达式（无兄弟节点）→ 不需要包裹

