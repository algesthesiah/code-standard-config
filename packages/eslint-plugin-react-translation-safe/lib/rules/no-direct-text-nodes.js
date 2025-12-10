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
    const allowedTags = options.allowedTags || ['title', 'script', 'style', 'textarea', 'option']
    const wrapperElement = options.wrapperElement || 'span'
    const sourceCode = context.getSourceCode()

    /**
     * 检测是否为可翻译的文本
     */
    function isTranslatableText(text) {
      if (!text || typeof text !== 'string') return false
      const trimmed = text.trim()
      if (!trimmed) return false
      // 中文检测
      const chineseRegex = /[\u4E00-\u9FA5]/
      // 英文单词检测（3 个字母以上）
      const englishWordRegex = /\b[a-z]{3,}\b/i
      return chineseRegex.test(trimmed) || englishWordRegex.test(trimmed)
    }

    /**
     * 判断节点是否为 JSX 元素
     */
    function isJSXElement(node) {
      return node && node.type === 'JSXElement'
    }

    /**
     * 检查是否为数组方法调用（通常返回 JSX 元素数组）
     */
    function isArrayMethodCall(node) {
      if (!node || node.type !== 'CallExpression') return false
      const callee = node.callee
      // 检查是否是 array.map()、array.filter() 等
      if (callee.type === 'MemberExpression') {
        const property = callee.property
        if (property && property.type === 'Identifier') {
          // 常见的数组方法，通常返回 JSX 元素数组
          const arrayMethods = ['map', 'filter', 'flatMap', 'reduce', 'reduceRight', 'flat']
          return arrayMethods.includes(property.name)
        }
      }
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

      // 如果是数组方法调用，不应该被当作文本表达式（它们返回 JSX 元素数组）
      if (isArrayMethodCall(node)) {
        return false
      }

      // 标识符、成员表达式、函数调用（可能返回字符串）
      if (node.type === 'Identifier' || node.type === 'MemberExpression' || node.type === 'CallExpression') {
        return true
      }

      return false
    }

    /**
     * 检查表达式是否返回 JSX 元素
     */
    function expressionReturnsJSX(expression) {
      if (!expression) return false
      if (isJSXElement(expression)) return true
      // 数组方法调用通常返回 JSX 元素数组，应该被当作返回 JSX 处理
      if (isArrayMethodCall(expression)) return true
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
     * 如果有混合内容，则需要包裹文本节点
     * 但如果表达式返回的是 JSX 元素，则不算混合内容
     */
    function hasMixedContent(children) {
      if (!children || children.length === 0) return false

      // 过滤掉空白文本节点和注释节点，只保留有意义的节点
      const meaningfulChildren = children.filter(child => {
        // 保留所有非文本节点
        if (child.type !== 'JSXText') return true
        // 对于文本节点，只保留可翻译的文本
        return isTranslatableText(child.value)
      })

      // 如果过滤后只有一个节点，不是混合内容
      if (meaningfulChildren.length <= 1) return false

      let hasTextNode = false
      let hasElement = false
      let hasTextExpression = false

      for (const child of meaningfulChildren) {
        switch (child.type) {
          case 'JSXElement': {
            hasElement = true

            break
          }
          case 'JSXExpressionContainer': {
            const expression = child.expression
            // 如果表达式返回 JSX，不算文本表达式
            if (!expressionReturnsJSX(expression)) {
              hasTextExpression = true
            }

            break
          }
          case 'JSXText': {
            if (isTranslatableText(child.value)) {
              hasTextNode = true
            }

            break
          }
          // No default
        }
      }

      // 如果有文本节点，且同时有其他类型的节点（元素或可能返回文本的表达式），则为混合内容
      return hasTextNode && (hasElement || hasTextExpression)
    }

    /**
     * 检查表达式容器中的表达式是否需要包裹
     */
    function shouldWrapExpression(expression, siblings) {
      if (!expression) return false

      // 如果表达式返回 JSX 元素，不需要包裹
      if (expressionReturnsJSX(expression)) return false

      // 如果没有兄弟节点，不需要包裹
      if (!siblings || siblings.length === 0) return false

      // 对于逻辑表达式，检查右侧是否可能返回文本
      if (expression.type === 'LogicalExpression') {
        const right = expression.right
        return isTextLikeExpression(right) && !isJSXElement(right)
      }

      // 对于三元表达式，检查两个分支是否可能返回文本
      if (expression.type === 'ConditionalExpression') {
        const consequent = expression.consequent
        const alternate = expression.alternate
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
      if (!node) return ''
      return sourceCode.getText(node)
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

      // 如果是 JSX 元素，不需要包裹
      if (isJSXElement(expr)) {
        return getExpressionText(expr)
      }

      // 如果是数组方法调用，不需要包裹（它们返回 JSX 元素数组）
      if (isArrayMethodCall(expr)) {
        return getExpressionText(expr)
      }

      // 如果是三元表达式，递归处理两个分支
      if (expr.type === 'ConditionalExpression') {
        const test = getExpressionText(expr.test)
        const consequent = wrapExpressionIfNeeded(expr.consequent, true)
        const alternate = wrapExpressionIfNeeded(expr.alternate, true)
        const result = `${test} ? ${consequent} : ${alternate}`
        // 如果需要括号（嵌套表达式），添加括号
        return needsParens ? `(${result})` : result
      }

      // 如果是逻辑表达式，递归处理右侧
      if (expr.type === 'LogicalExpression') {
        const left = getExpressionText(expr.left)
        const operator = expr.operator
        const right = wrapExpressionIfNeeded(expr.right, true)
        const result = `${left} ${operator} ${right}`
        // 如果需要括号（嵌套表达式），添加括号
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

    return {
      JSXElement(node) {
        const elementName = node.openingElement.name.name

        // 跳过允许的标签
        if (allowedTags.includes(elementName)) return

        const children = node.children || []
        const hasMixed = hasMixedContent(children)

        // 处理每个子节点
        children.forEach((child, index) => {
          // 处理直接文本节点
          if (child.type === 'JSXText') {
            const text = child.value
            if (
              isTranslatableText(text) && // 如果有混合内容，或者文本节点前后有其他节点，需要包裹
              hasMixed
            ) {
              context.report({
                node: child,
                messageId: 'directTextNode',
                data: {
                  text: text.trim().slice(0, 20),
                  tagName: elementName,
                  wrapperElement,
                },
                fix(fixer) {
                  // 保留原始文本的空白字符
                  return fixer.replaceText(child, wrapInElement(text))
                },
              })
            }
          }
          // 处理表达式容器
          else if (child.type === 'JSXExpressionContainer') {
            const expression = child.expression
            if (!expression) return

            // 如果表达式返回 JSX（包括数组方法调用），不需要包裹，直接跳过
            if (expressionReturnsJSX(expression)) return

            const siblings = children.filter((c, i) => i !== index && c.type !== 'JSXComment')
            const shouldWrap = shouldWrapExpression(expression, siblings)

            if (shouldWrap) {
              // 处理逻辑表达式：isLoading && '加载中' 或 val || 'default'（支持嵌套）
              if (expression.type === 'LogicalExpression') {
                const operator = expression.operator // '&&' 或 '||'
                const left = getExpressionText(expression.left)
                const rightWrapped = wrapExpressionIfNeeded(expression.right)

                // 检查右侧是否需要包裹
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
                  return // 已处理，不需要继续
                }
              }
              // 处理三元表达式：condition ? 'foo' : 'bar'（支持嵌套）
              else if (expression.type === 'ConditionalExpression') {
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
                }
              }
              // 处理其他表达式（字符串字面量、标识符等）
              // 但标识符单独出现时，不应该报告（因为无法确定它返回什么）
              else if (isTextLikeExpression(expression)) {
                // 如果是标识符，不报告（因为无法确定它返回什么，可能是数字、对象等）
                if (expression.type === 'Identifier') {
                  return
                }

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
        })
      },
    }
  },
}
