babel-plugin-fail-explicit
==========================
[![Build Status](https://travis-ci.org/amilajack/babel-plugin-fail-explicit.svg?branch=master&maxAge=2592)](https://travis-ci.org/amilajack/babel-plugin-fail-explicit)
[![Coverage Status](https://coveralls.io/repos/github/amilajack/babel-plugin-fail-explicit/badge.svg?branch=master)](https://coveralls.io/github/amilajack/babel-plugin-fail-explicit?branch=master)
[![NPM version](https://badge.fury.io/js/babel-plugin-fail-explicit.svg?maxAge=2592)](http://badge.fury.io/js/babel-plugin-fail-explicit)
[![Dependency Status](https://img.shields.io/david/amilajack/babel-plugin-fail-explicit.svg?maxAge=2592)](https://david-dm.org/amilajack/babel-plugin-fail-explicit)
[![npm](https://img.shields.io/npm/dm/babel-plugin-fail-explicit.svg?maxAge=2592)](https://npm-stat.com/charts.html?package=babel-plugin-fail-explicit)

**A babel plugin that prevents coercion and silent failure in JavaScript**

**⚠️ Experimental ⚠️**

## Roadmap
- [x] Fail on unsafe coercion
- [x] Fail on unsafe property access
- [ ] Allow for configuration of strictness

**⚠️ This doesn't work as expected with `"transform-es2015-modules-umd"` at the moment ⚠️**

## Installation
```bash
npm install --save-dev babel-plugin-fail-explicit
```

## Setup
```js
// .babelrc
{
  "plugins": [
    ['fail-explicit, {
      commonJSImports: true
    }]
  ]
}
```
