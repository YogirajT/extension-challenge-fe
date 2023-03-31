module.exports = {
  extends: 'stylelint-config-sass-guidelines',
  rules: {
    'selector-class-pattern': null,
    'no-descending-specificity': null,
    'declaration-property-value-disallowed-list': null,
    'block-closing-brace-empty-line-before': 'never',
    'selector-max-id': null,
    'max-nesting-depth': 2,
  },
  'stylelint.autoFixOnSave': true,
};
