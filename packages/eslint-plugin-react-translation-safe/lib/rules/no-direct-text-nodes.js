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
    },
  },

  create(context) {
    const options = context.options[0] || {}
    const allowedTags = options.allowedTags || ['title', 'script', 'style', 'textarea', 'option']
    const wrapperElement = options.wrapperElement || 'span'

    // 检测是否为可翻译的文本
    function isTranslatableText(text) {
      const trimmed = text.trim()
      if (!trimmed) return false

      // 中文检测
      const chineseRegex = /[\u4E00-\u9FA5]/
      // 英文单词检测（3 个字母以上）
      const englishWordRegex = /\b[a-z]{3,}\b/i

      return chineseRegex.test(trimmed) || englishWordRegex.test(trimmed)
    }

    return {
      JSXElement(node) {
        const elementName = node.openingElement.name.name
        if (allowedTags.includes(elementName)) return

        node.children.forEach(child => {
          // 递归处理嵌套 JSXElement
          if (child.type === 'JSXElement') {
            // 递归调用处理嵌套元素
            child.children.forEach(grandChild => {
              if (grandChild.type === 'JSXText') {
                const text = grandChild.value
                if (isTranslatableText(text) && child.openingElement.name.name !== wrapperElement) {
                  context.report({
                    node: grandChild,
                    messageId: 'directTextNode',
                    data: {
                      text: text.trim().slice(0, 20),
                      tagName: child.openingElement.name.name,
                      wrapperElement,
                    },
                    fix(fixer) {
                      return fixer.replaceText(grandChild, `<${wrapperElement}>${text}</${wrapperElement}>`)
                    },
                  })
                }
              } else if (grandChild.type === 'JSXExpressionContainer') {
                const expr = grandChild.expression
                if (
                  expr &&
                  (expr.type === 'Literal' || expr.type === 'Identifier' || expr.type === 'MemberExpression') &&
                  child.openingElement.name.name !== wrapperElement
                ) {
                  context.report({
                    node: grandChild,
                    message: `表达式建议用元素包裹以保证结构稳定`,
                    fix(fixer) {
                      return fixer.replaceText(
                        grandChild,
                        `<${wrapperElement}>{${context.getSourceCode().getText(expr)}}</${wrapperElement}>`
                      )
                    },
                  })
                }
              }
            })
          }
          if (child.type === 'JSXText') {
            const text = child.value
            // 只对未被 wrapperElement 包裹的文本报错和修复
            if (isTranslatableText(text) && elementName !== wrapperElement) {
              context.report({
                node: child,
                messageId: 'directTextNode',
                data: {
                  text: text.trim().slice(0, 20),
                  tagName: elementName,
                  wrapperElement,
                },
                fix(fixer) {
                  return fixer.replaceText(child, `<${wrapperElement}>${text}</${wrapperElement}>`)
                },
              })
            }
          } else if (child.type === 'JSXExpressionContainer') {
            const expr = child.expression
            // 递归处理逻辑表达式和条件表达式
            function wrapIfNeeded(e, source) {
              if (e.type === 'Literal' && typeof e.value === 'string' && isTranslatableText(e.value)) {
                return `<${wrapperElement}>{${source}}</${wrapperElement}>`
              }
              return null
            }
            let fixCode = null
            if (
              expr &&
              (expr.type === 'Literal' || expr.type === 'Identifier' || expr.type === 'MemberExpression') &&
              elementName !== wrapperElement
            ) {
              fixCode = `<${wrapperElement}>{${context.getSourceCode().getText(expr)}}</${wrapperElement}>`
            } else if (expr && expr.type === 'LogicalExpression') {
              // 处理 isLoading && '加载中...'
              const left = context.getSourceCode().getText(expr.left)
              const right = wrapIfNeeded(expr.right, context.getSourceCode().getText(expr.right))
              if (right) {
                fixCode = `{${left} && ${right}}`
              }
            } else if (expr && expr.type === 'ConditionalExpression') {
              // 处理三元表达式
              const test = context.getSourceCode().getText(expr.test)
              let consequent = context.getSourceCode().getText(expr.consequent)
              let alternate = context.getSourceCode().getText(expr.alternate)
              // 只要不是 JSX 元素都包裹一层
              if (expr.consequent.type !== 'JSXElement') {
                consequent = `<${wrapperElement}>{${consequent}}</${wrapperElement}>`
              }
              if (expr.alternate.type !== 'JSXElement') {
                alternate = `<${wrapperElement}>{${alternate}}</${wrapperElement}>`
              }
              fixCode = `{${test} ? ${consequent} : ${alternate}}`
            }
            if (fixCode) {
              context.report({
                node: child,
                message: `表达式建议用元素包裹以保证结构稳定`,
                fix(fixer) {
                  return fixer.replaceText(child, fixCode)
                },
              })
            }
          }
        })
      },
    }
  },
}
