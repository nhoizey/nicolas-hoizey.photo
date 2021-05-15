import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import replace from '@rollup/plugin-replace';
import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import path from 'path';
const config = require('./pack11ty.config.js');

const SRC_DIR = config.dir.src;
const ASSETS_DIR = config.dir.assets;
const DIST_DIR = config.dir.dist;

const JS_SRC = path.join(ASSETS_DIR, 'js');
const JS_DIST = path.join(DIST_DIR, 'ui/js');
const HASH = path.join(SRC_DIR, '_data');

const plugins_critical = [
  commonjs(),
  resolve(),
  replace({
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
  }),
  babel({
    exclude: 'node_modules/**',
  }),
  process.env.NODE_ENV === 'production' && terser(),
];

export default [
  {
    input: path.join(JS_SRC, 'critical.js'),
    output: {
      dir: JS_DIST,
      entryFileNames: '[name].js',
      format: 'iife',
      name: 'critical',
      sourcemap: true,
    },
    plugins: plugins_critical,
  },
];
