babel-plugin-fail-explicit
==========================
[![Build Status](https://travis-ci.org/amilajack/babel-plugin-fail-explicit.svg?branch=master&maxAge=2592)](https://travis-ci.org/amilajack/babel-plugin-fail-explicit)
[![NPM version](https://badge.fury.io/js/babel-plugin-fail-explicit.svg?maxAge=2592)](http://badge.fury.io/js/babel-plugin-fail-explicit)
[![Dependency Status](https://img.shields.io/david/amilajack/babel-plugin-fail-explicit.svg?maxAge=2592)](https://david-dm.org/amilajack/babel-plugin-fail-explicit)
[![npm](https://img.shields.io/npm/dm/babel-plugin-fail-explicit.svg?maxAge=2592)](https://npm-stat.com/charts.html?package=babel-plugin-fail-explicit)

**A babel plugin that prevents coercion and silent failure in JavaScript**

**⚠️ Experimental ⚠️**

## Roadmap
- [x] Fail on unsafe coercion
- [ ] Fail on unsafe property access
- [ ] Allow for configuration of strictness

## Installation
```bash
npm install --save-dev babel-plugin-fail-explicit
npm install --save-dev babel-plugin-add-module-exports
```

## Setup
```js
// .babelrc
{
  "plugins": [
    "fail-explicit",
    "add-module-exports"
  ]
}
```
