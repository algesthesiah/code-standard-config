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

    // 判断表达式是否已经被 JSX 元素包裹
    function isJSXElement(node) {
      return node && node.type === 'JSXElement'
    }

    // 判断表达式类型是否可能为字符串（静态分析，常见场景）
    function isStringLikeExpression(node) {
      if (!node) return false
      if (node.type === 'Literal' && typeof node.value === 'string') return true
      if (node.type === 'TemplateLiteral') return true
      if (node.type === 'Identifier' || node.type === 'MemberExpression' || node.type === 'CallExpression') return true
      return false
    }

    return {
      JSXElement(node) {
        const elementName = node.openingElement.name.name
        if (allowedTags.includes(elementName)) return

        node.children.forEach(child => {
          if (child.type === 'JSXText') {
            const text = child.value
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
            // 优化：只处理未被元素包裹的文本表达式
            let fixCode = null
            if (
              expr &&
              (expr.type === 'Literal' || expr.type === 'Identifier' || expr.type === 'MemberExpression') &&
              elementName !== wrapperElement
            ) {
              // 只包裹字符串文本
              if (expr.type === 'Literal' && typeof expr.value === 'string' && isTranslatableText(expr.value)) {
                fixCode = `<${wrapperElement}>{${context.getSourceCode().getText(expr)}}</${wrapperElement}>`
              }
            } else if (expr && expr.type === 'LogicalExpression') {
              // 处理 isLoading && '加载中...'
              const left = context.getSourceCode().getText(expr.left)
              const rightExpr = expr.right
              let right = context.getSourceCode().getText(rightExpr)
              if (
                !isJSXElement(rightExpr) &&
                rightExpr.type === 'Literal' &&
                typeof rightExpr.value === 'string' &&
                isTranslatableText(rightExpr.value)
              ) {
                right = `<${wrapperElement}>{${right}}</${wrapperElement}>`
                fixCode = `{${left} && ${right}}`
              }
            } else if (expr && expr.type === 'ConditionalExpression') {
              // 处理三元表达式，只有分支不是 JSX 元素且为可翻译文本才包裹
              const test = context.getSourceCode().getText(expr.test)
              const consequentExpr = expr.consequent
              const alternateExpr = expr.alternate
              let consequent = context.getSourceCode().getText(consequentExpr)
              let alternate = context.getSourceCode().getText(alternateExpr)
              if (!isJSXElement(consequentExpr) && isStringLikeExpression(consequentExpr)) {
                consequent = `<${wrapperElement}>{${context.getSourceCode().getText(consequentExpr)}}</${wrapperElement}>`
              }
              if (!isJSXElement(alternateExpr) && isStringLikeExpression(alternateExpr)) {
                alternate = `<${wrapperElement}>{${context.getSourceCode().getText(alternateExpr)}}</${wrapperElement}>`
              }
              // 只有有分支需要包裹时才报错
              if (
                consequent !== context.getSourceCode().getText(consequentExpr) ||
                alternate !== context.getSourceCode().getText(alternateExpr)
              ) {
                fixCode = `{${test} ? ${consequent} : ${alternate}}`
              }
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
