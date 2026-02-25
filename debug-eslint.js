const { createRequire } = require('module');
const { FlatCompat } = require('@eslint/eslintrc');
const compat = new FlatCompat({ baseDirectory: process.cwd() });
const origStringify = JSON.stringify;

JSON.stringify = function(obj, replacer, space) {
  try {
    return origStringify(obj, replacer, space);
  } catch (e) {
    if (e.message.includes('circular')) {
      console.log('Caught circular stringify. Obj:', require('util').inspect(obj, {depth: 2}));
      return '"[Circular structure removed]"';
    }
    throw e;
  }
};
try {
  compat.extends('next/core-web-vitals', 'next/typescript');
  console.log('Success extends');
} catch (e) {
  console.log('Caught extending error:', e.message);
}
