module.exports = [
  {
    ignores: [
      "node_modules/**"
    ]
  },
  {
    files: [
      "**/*.js"
    ],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "commonjs",
      globals: {
        console: "readonly",
        exports: "readonly",
        module: "readonly",
        process: "readonly",
        require: "readonly"
      }
    },
    rules: {
      "no-unused-vars": "error",
      "no-undef": "error",
      "quotes": [
        "error",
        "double",
        {
          allowTemplateLiterals: true
        }
      ],
      "semi": [
        "error",
        "always"
      ]
    }
  }
];