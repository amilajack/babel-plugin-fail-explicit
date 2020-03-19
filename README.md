babel-plugin-fail-explicit
==========================
[![Build Status](https://travis-ci.org/amilajack/babel-plugin-fail-explicit.svg?branch=master&maxAge=2592)](https://travis-ci.org/amilajack/babel-plugin-fail-explicit)
[![NPM version](https://badge.fury.io/js/babel-plugin-fail-explicit.svg?maxAge=2592)](http://badge.fury.io/js/babel-plugin-fail-explicit)
[![Dependency Status](https://img.shields.io/david/amilajack/babel-plugin-fail-explicit.svg?maxAge=2592)](https://david-dm.org/amilajack/babel-plugin-fail-explicit)
[![npm](https://img.shields.io/npm/dm/babel-plugin-fail-explicit.svg?maxAge=2592)](https://npm-stat.com/charts.html?package=babel-plugin-fail-explicit)

**A babel plugin that prevents coercion and silent failure in JavaScript**

![demo](https://raw.githubusercontent.com/amilajack/babel-plugin-fail-explicit-demo/7ed9a29ec61d505f2b3ce6be18145c74eb3bc5f5/demo.gif)

## Roadmap
- [x] Fail on unsafe coercion
- [x] Fail on unsafe property access
- [x] Do not fail inside conditional expressions or default statements (`||`), on by default
- [ ] Allow unsafe access in if statement by default
- [ ] Allow for configuration of strictness

## Installation
```bash
npm install --save-dev babel-plugin-fail-explicit
```

## Setup
```json
// .babelrc
{
  "plugins": [
    "fail-explicit"
  ]
}
```

### Demo:
To experiment with `babel-plugin-fail-explicit`, see [this demo repo](https://github.com/amilajack/babel-plugin-fail-explicit-demo)

### Examples
```js
// ------------------------------------------------
// Coercion safeguard
// ------------------------------------------------
[] + {}
// TypeError: 'Unexpected coercion of type "Array" and
// type "Object" using "+" operator'

NaN + undefined
// TypeError: Unexpected coercion of type "NaN" and type
// "undefined" using "+" operator

1 + 'some'
// '1some'


// ------------------------------------------------
// Safe Comparison
// ------------------------------------------------
new String('12') > 12
// TypeError: Unexpected comparison of type "String" and type
// "number" using ">" operator

null > undefined
// TypeError: Unexpected comparison of type "null" and type
// "undefined" using ">" operator


// ------------------------------------------------
// Usage for better undefined propagation errors
// ------------------------------------------------
const obj = {
  foo: {
    bar: {}
  }
}

obj.foo.bar.baz;
// TypeError: Property "baz" does not exist in "Object.foo.bar"


// ------------------------------------------------
// Usage as out of bounds check
// ------------------------------------------------
const some = new Array(3)
some[10]
// TypeError: '"Array[10]" is out of bounds'

const bar = []
some[100]
// TypeError: '"Array[100]" is out of bounds'

// TypeError: '"woo[1]" is out of bounds'
const obj = {
  woo: ['']
}

obj.woo[1]
// TypeError: '"woo[1]" is out of bounds'
```
