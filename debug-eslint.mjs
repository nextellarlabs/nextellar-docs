import { createRequire } from 'module';
import { FlatCompat } from '@eslint/eslintrc';
import Module from 'module';

const origRequire = Module.prototype.require;
Module.prototype.require = function(id) {
  const exports = origRequire.apply(this, arguments);
  if (id === 'eslint-plugin-react' && exports && exports.configs && exports.configs.flat) {
    delete exports.configs.flat;
  }
  return exports;
};

const compat = new FlatCompat({ baseDirectory: process.cwd() });
try {
  const cfgs = compat.extends('next/core-web-vitals', 'next/typescript');
  console.log('Success extends, cfgs length:', cfgs.length);
} catch (e) {
  console.log('Caught extending error:', e.message);
}
