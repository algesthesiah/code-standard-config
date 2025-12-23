export default {
  meta: {
    type: 'problem',
    docs: {
      description: '禁止在 JSX 元素中直接使用文本节点，以防止翻译工具破坏 DOM 结构',
      category: 'Possible Errors',
      recommended: true,
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          allowedTags: {
            type: 'array',
            items: { type: 'string' },
            default: ['title', 'script', 'style', 'textarea', 'option'],
          },
          wrapperElement: {
            type: 'string',
            default: 'span',
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      directTextNode:
        '直接文本节点 "{{ text }}" 在 <{{ tagName }}> 中，可能被翻译工具修改。请使用 {{ wrapperElement }} 包裹。',
      expressionTextNode: '表达式中的文本节点可能被翻译工具修改。请使用 {{ wrapperElement }} 包裹。',
    },
  },

  create(context) {
    const options = context.options[0] || {}
    const allowedTags = new Set(options.allowedTags || ['title', 'script', 'style', 'textarea', 'option'])
    const wrapperElement = options.wrapperElement || 'span'
    const sourceCode = context.getSourceCode()

    // 预编译正则表达式
    const CHINESE_REGEX = /[\u4E00-\u9FA5]/
    const ENGLISH_WORD_REGEX = /\b[a-z]{3,}\b/i
    const ARRAY_METHODS = new Set(['filter', 'flat', 'flatMap', 'map', 'reduce', 'reduceRight'])

    /**
     * 检测是否为可翻译的文本
     */
    function isTranslatableText(text) {
      if (!text || typeof text !== 'string') return false
      const trimmed = text.trim()
      if (!trimmed) return false
      return CHINESE_REGEX.test(trimmed) || ENGLISH_WORD_REGEX.test(trimmed)
    }

    /**
     * 判断节点是否为 JSX 元素
     */
    function isJSXElement(node) {
      return node?.type === 'JSXElement'
    }

    /**
     * 检查是否为数组方法调用（通常返回 JSX 元素数组）
     */
    function isArrayMethodCall(node) {
      if (!node || node.type !== 'CallExpression') return false
      const callee = node.callee
      if (callee?.type === 'MemberExpression') {
        const property = callee.property
        return property?.type === 'Identifier' && ARRAY_METHODS.has(property.name)
      }
      return false
    }

    /**
     * 检查是否为函数调用（任何函数调用都应该被忽略，因为无法静态分析返回值）
     */
    function isFunctionCall(node) {
      return node?.type === 'CallExpression' && !isArrayMethodCall(node)
    }

    /**
     * 检查表达式是否应该被忽略（不需要包裹）
     */
    function shouldIgnoreExpression(expression) {
      if (!expression) return true
      // JSX 元素和数组方法调用返回 JSX，不需要包裹
      if (isJSXElement(expression) || isArrayMethodCall(expression)) return true
      // 函数调用无法静态分析，应该被忽略
      if (isFunctionCall(expression)) return true
      return false
    }

    /**
     * 判断表达式是否可能返回文本内容
     */
    function isTextLikeExpression(node) {
      if (!node) return false

      // 字符串字面量
      if (node.type === 'Literal' && typeof node.value === 'string') {
        return isTranslatableText(node.value)
      }

      // 模板字符串
      if (node.type === 'TemplateLiteral') {
        return true
      }

      // 数组方法调用和函数调用不应该被当作文本表达式
      if (isArrayMethodCall(node) || isFunctionCall(node)) {
        return false
      }

      // 标识符、成员表达式（可能返回字符串，但函数调用已排除）
      return node.type === 'Identifier' || node.type === 'MemberExpression'
    }

    /**
     * 检查表达式是否返回 JSX 元素
     */
    function expressionReturnsJSX(expression) {
      if (!expression) return false
      if (isJSXElement(expression)) return true
      if (isArrayMethodCall(expression)) return true
      if (isFunctionCall(expression)) return false

      // 对于三元表达式，检查两个分支是否都返回 JSX
      if (expression.type === 'ConditionalExpression') {
        return expressionReturnsJSX(expression.consequent) && expressionReturnsJSX(expression.alternate)
      }

      // 对于逻辑表达式，检查右侧是否返回 JSX
      if (expression.type === 'LogicalExpression') {
        return expressionReturnsJSX(expression.right)
      }

      return false
    }

    /**
     * 检查子节点列表中是否有多个非空白文本节点或混合内容
     * 优化：单次遍历，提前退出
     */
    function hasMixedContent(children) {
      if (!children || children.length === 0) return false

      let meaningfulCount = 0
      let hasTextNode = false
      let hasElement = false
      let hasTextExpression = false

      for (const child of children) {
        // 跳过空白文本节点和注释
        if (child.type === 'JSXText') {
          if (isTranslatableText(child.value)) {
            hasTextNode = true
            meaningfulCount++
          }
          continue
        }

        if (child.type === 'JSXComment') continue

        meaningfulCount++

        if (child.type === 'JSXElement') {
          hasElement = true
        } else if (child.type === 'JSXExpressionContainer') {
          const expression = child.expression
          // 如果表达式返回 JSX 或是函数调用，不算文本表达式
          if (!expressionReturnsJSX(expression) && !isFunctionCall(expression)) {
            hasTextExpression = true
          }
        }

        // 如果已经有混合内容的迹象，可以提前退出
        if (hasTextNode && (hasElement || hasTextExpression) && meaningfulCount > 1) {
          return true
        }
      }

      // 如果有文本节点，且同时有其他类型的节点（元素或可能返回文本的表达式），则为混合内容
      return hasTextNode && (hasElement || hasTextExpression) && meaningfulCount > 1
    }

    /**
     * 检查表达式容器中的表达式是否需要包裹
     */
    function shouldWrapExpression(expression, siblings) {
      if (!expression) return false

      // 如果应该被忽略，不需要包裹
      if (shouldIgnoreExpression(expression)) return false

      // 如果没有兄弟节点，不需要包裹
      if (!siblings || siblings.length === 0) return false

      // 对于逻辑表达式，检查右侧是否可能返回文本
      if (expression.type === 'LogicalExpression') {
        const right = expression.right
        if (shouldIgnoreExpression(right)) return false
        return isTextLikeExpression(right) && !isJSXElement(right)
      }

      // 对于三元表达式，检查两个分支是否可能返回文本
      if (expression.type === 'ConditionalExpression') {
        const consequent = expression.consequent
        const alternate = expression.alternate
        if (shouldIgnoreExpression(consequent) || shouldIgnoreExpression(alternate)) return false
        return (
          (isTextLikeExpression(consequent) && !isJSXElement(consequent)) ||
          (isTextLikeExpression(alternate) && !isJSXElement(alternate))
        )
      }

      // 对于其他表达式，检查是否可能返回文本
      return isTextLikeExpression(expression)
    }

    /**
     * 获取表达式的源代码文本
     */
    function getExpressionText(node) {
      return node ? sourceCode.getText(node) : ''
    }

    /**
     * 生成包裹后的代码
     */
    function wrapInElement(text) {
      return `<${wrapperElement}>${text}</${wrapperElement}>`
    }

    /**
     * 递归处理表达式，如果返回文本则包裹
     * @param {object} expr - 表达式节点
     * @param {boolean} needsParens - 是否需要括号（用于嵌套表达式）
     */
    function wrapExpressionIfNeeded(expr, needsParens = false) {
      if (!expr) return getExpressionText(expr)

      // 如果应该被忽略，直接返回源代码
      if (shouldIgnoreExpression(expr)) {
        return getExpressionText(expr)
      }

      // 如果是三元表达式，递归处理两个分支
      if (expr.type === 'ConditionalExpression') {
        const test = getExpressionText(expr.test)
        const consequent = wrapExpressionIfNeeded(expr.consequent, true)
        const alternate = wrapExpressionIfNeeded(expr.alternate, true)
        const result = `${test} ? ${consequent} : ${alternate}`
        return needsParens ? `(${result})` : result
      }

      // 如果是逻辑表达式，递归处理右侧
      if (expr.type === 'LogicalExpression') {
        const left = getExpressionText(expr.left)
        const operator = expr.operator
        const right = wrapExpressionIfNeeded(expr.right, true)
        const result = `${left} ${operator} ${right}`
        return needsParens ? `(${result})` : result
      }

      // 如果是文本表达式，需要包裹
      if (isTextLikeExpression(expr) && !isJSXElement(expr)) {
        const exprText = getExpressionText(expr)
        return wrapInElement(`{${exprText}}`)
      }

      // 其他情况，直接返回源代码
      return getExpressionText(expr)
    }

    /**
     * 处理逻辑表达式的修复
     */
    function handleLogicalExpression(expression, child) {
      const operator = expression.operator
      const left = getExpressionText(expression.left)
      const rightWrapped = wrapExpressionIfNeeded(expression.right)

      const originalRight = getExpressionText(expression.right)
      if (rightWrapped !== originalRight) {
        const fixCode = `{${left} ${operator} ${rightWrapped}}`
        context.report({
          node: child,
          messageId: 'expressionTextNode',
          data: { wrapperElement },
          fix(fixer) {
            return fixer.replaceText(child, fixCode)
          },
        })
        return true
      }
      return false
    }

    /**
     * 处理三元表达式的修复
     */
    function handleConditionalExpression(expression, child) {
      const test = getExpressionText(expression.test)
      const originalConsequent = getExpressionText(expression.consequent)
      const originalAlternate = getExpressionText(expression.alternate)

      // 检查原始代码是否有括号（用于嵌套表达式）
      const consequentHasParens = originalConsequent.startsWith('(') && originalConsequent.endsWith(')')
      const alternateHasParens = originalAlternate.startsWith('(') && originalAlternate.endsWith(')')

      const consequentWrapped = wrapExpressionIfNeeded(
        expression.consequent,
        expression.consequent.type === 'ConditionalExpression' && !consequentHasParens
      )
      const alternateWrapped = wrapExpressionIfNeeded(
        expression.alternate,
        expression.alternate.type === 'ConditionalExpression' && !alternateHasParens
      )

      // 检查是否有任何分支需要包裹
      const needsFix = consequentWrapped !== originalConsequent || alternateWrapped !== originalAlternate

      if (needsFix) {
        // 如果原始代码有括号，保留括号格式
        let finalConsequent = consequentWrapped
        let finalAlternate = alternateWrapped

        if (consequentHasParens && !finalConsequent.startsWith('(')) {
          finalConsequent = `(${finalConsequent})`
        }
        if (alternateHasParens && !finalAlternate.startsWith('(')) {
          finalAlternate = `(${finalAlternate})`
        }

        const fixCode = `{${test} ? ${finalConsequent} : ${finalAlternate}}`
        context.report({
          node: child,
          messageId: 'expressionTextNode',
          data: { wrapperElement },
          fix(fixer) {
            return fixer.replaceText(child, fixCode)
          },
        })
        return true
      }
      return false
    }

    return {
      JSXElement(node) {
        const elementName = node.openingElement?.name?.name

        // 跳过允许的标签（处理可能的 undefined）
        if (elementName && allowedTags.has(elementName)) return

        const children = node.children || []
        const hasMixed = hasMixedContent(children)

        // 预处理：过滤掉注释节点，避免在循环中重复过滤
        const validChildren = children.filter(c => c.type !== 'JSXComment')

        // 处理每个子节点
        for (const [index, child] of children.entries()) {
          // 处理直接文本节点
          if (child.type === 'JSXText') {
            const text = child.value
            if (isTranslatableText(text) && hasMixed) {
              context.report({
                node: child,
                messageId: 'directTextNode',
                data: {
                  text: text.trim().slice(0, 20),
                  tagName: elementName || 'unknown',
                  wrapperElement,
                },
                fix(fixer) {
                  return fixer.replaceText(child, wrapInElement(text))
                },
              })
            }
            continue
          }

          // 处理表达式容器
          if (child.type === 'JSXExpressionContainer') {
            const expression = child.expression
            if (!expression) continue

            // 如果应该被忽略，直接跳过
            if (shouldIgnoreExpression(expression)) continue

            // 计算兄弟节点（排除当前节点和注释）
            const siblings = validChildren.filter((c, i) => i !== index)
            const shouldWrap = shouldWrapExpression(expression, siblings)

            if (!shouldWrap) continue

            // 处理逻辑表达式
            if (expression.type === 'LogicalExpression') {
              if (handleLogicalExpression(expression, child)) continue
            }
            // 处理三元表达式
            else if (expression.type === 'ConditionalExpression') {
              if (handleConditionalExpression(expression, child)) continue
            }
            // 处理其他表达式（字符串字面量、模板字符串等）
            else if (isTextLikeExpression(expression) && expression.type !== 'Identifier') {
              const exprText = getExpressionText(expression)
              const fixCode = wrapInElement(`{${exprText}}`)
              context.report({
                node: child,
                messageId: 'expressionTextNode',
                data: { wrapperElement },
                fix(fixer) {
                  return fixer.replaceText(child, fixCode)
                },
              })
            }
          }
        }
      },
    }
  },
}
