const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');

esbuild.buildSync({
  entryPoints: ['src/index.js'],
  bundle: true,
  outfile: '../dist/mods.js',
  format: 'iife',
  target: ['es6'],
  minify: false,
});

console.log('✅ mods/index.js -> dist/mods.js compilé avec succès');
