module.exports = {
  extends: ['stylelint-config-standard', 'stylelint-config-css-modules', 'stylelint-config-rational-order'],
  ignoreFiles: ['**/*.js', '**/*.jsx', '**/*.tsx', '**/*.ts'],
  plugins: ['stylelint-no-unsupported-browser-features', 'stylelint-declaration-block-no-ignored-properties'],
  rules: {
    'plugin/no-unsupported-browser-features': [
      true,
      {
        browsers: [
          'Chrome >= 52', // Chrome 52 及以上版本
          'Firefox >= 57', // Firefox 57 及以上版本
          'Safari >= 10', // Safari 10 及以上版本
          'iOS >= 10', // iOS 10 及以上版本
          'Android >= 6', // Android 6 及以上版本
          'not dead', // 不包括已停止支持的浏览器
        ],
        ignore: ['rem'],
        ignorePartialSupport: true,
      },
    ],
    'selector-pseudo-class-no-unknown': [
      true,
      {
        ignorePseudoClasses: ['global', 'local', 'fist-child'],
      },
    ],
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: [
          'extend',
          'at-root',
          'debug',
          'warn',
          'error',
          'if',
          'else',
          'for',
          'each',
          'while',
          'mixin',
          'include',
          'content',
          'return',
          'function',
          'tailwind',
          'apply',
          'variants',
          'responsive',
          'screen',
          'layer',
        ],
      },
    ],
    'font-family-no-missing-generic-family-keyword': null,
    'indentation': 2,
    'block-no-empty': null,
    'declaration-colon-space-after': 'always-single-line',
    'declaration-colon-space-before': 'never',
    'no-invalid-double-slash-comments': true,
    'plugin/declaration-block-no-ignored-properties': true,
    'block-opening-brace-space-before': 'always',
    'function-comma-space-after': 'always',
    'function-whitespace-after': 'always',
    'value-list-comma-space-after': 'always',
    'declaration-block-semicolon-space-after': 'always-single-line',
    'selector-attribute-operator-space-after': 'always',
    'selector-combinator-space-after': 'always',
    'selector-list-comma-space-after': 'always-single-line',
    'selector-descendant-combinator-no-non-space': true,
    'selector-pseudo-class-parentheses-space-inside': 'never',
    'comment-whitespace-inside': 'always',
    'at-rule-name-space-after': 'always',
    'media-query-list-comma-space-after': 'always',
    'function-url-quotes': 'always',
    'unit-no-unknown': [true, { ignoreUnits: ['rpx'] }],
    'color-hex-length': 'long',
    'declaration-block-trailing-semicolon': null,
    'no-descending-specificity': null,
    'no-duplicate-selectors': null,
    'custom-property-pattern': null,
    'selector-class-pattern': null,
    'string-quotes': 'single',
  },
}
