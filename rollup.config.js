import dotenv from 'dotenv';
dotenv.config();

import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import replace from '@rollup/plugin-replace';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import path from 'path';

const JS_SRC = 'assets/js';
const JS_DIST = '_site/ui/js';

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
    plugins: [
      commonjs(),
      nodeResolve(),
      replace({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      }),
      babel({
        exclude: 'node_modules/**',
      }),
      process.env.NODE_ENV === 'production' && terser(),
    ],
  },
  {
    input: path.join(JS_SRC, 'additional.js'),
    output: {
      dir: JS_DIST,
      entryFileNames: '[name].js',
      format: 'iife',
      name: 'additional',
      sourcemap: true,
    },
    plugins: [
      replace({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
        MAPBOX_ACCESS_TOKEN: JSON.stringify(process.env.MAPBOX_ACCESS_TOKEN),
      }),
      commonjs(),
      nodeResolve({ browser: true }),
      babel({
        exclude: 'node_modules/**',
      }),
      process.env.NODE_ENV === 'production' && terser(),
    ],
  },
];
