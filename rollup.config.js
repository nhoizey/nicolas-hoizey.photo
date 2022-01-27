import dotenv from 'dotenv';
dotenv.config();

import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import replace from '@rollup/plugin-replace';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import path from 'path';
import entrypointHashmanifest from 'rollup-plugin-entrypoint-hashmanifest';

const JS_SRC = 'assets/js';
const JS_DIST = '_site/ui/js';
const HASH = 'src/_data';

const JS_NAME =
  process.env.NODE_ENV === 'production'
    ? '[name]-[format].[hash].js'
    : '[name]-[format].js';

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
      }),
      commonjs(),
      nodeResolve({ browser: true }),
      babel({
        exclude: 'node_modules/**',
      }),
      process.env.NODE_ENV === 'production' && terser(),
    ],
  },
  {
    input: path.join(JS_SRC, 'photo.js'),
    output: {
      dir: JS_DIST,
      entryFileNames: JS_NAME,
      format: 'es',
      sourcemap: true,
      globals: {
        // events: 'events',
      },
    },
    plugins: [
      replace({
        MAPBOX_ACCESS_TOKEN: JSON.stringify(process.env.MAPBOX_ACCESS_TOKEN),
      }),
      nodeResolve({ browser: true, preferBuiltins: false }),
      commonjs(),
      babel({
        exclude: 'node_modules/**',
        presets: [
          [
            '@babel/preset-env',
            {
              targets: { esmodules: true },
              bugfixes: true,
              loose: true,
            },
          ],
        ],
      }),
      process.env.NODE_ENV === 'production' && terser(),
      process.env.NODE_ENV === 'production' &&
        entrypointHashmanifest({
          manifestName: path.join(HASH, 'hashes_photo.json'),
        }),
      // visualizer(),
    ],
  },
  {
    input: path.join(JS_SRC, 'map.js'),
    output: {
      dir: JS_DIST,
      entryFileNames: JS_NAME,
      format: 'es',
      sourcemap: true,
      globals: {
        // events: 'events',
      },
    },
    plugins: [
      replace({
        MAPBOX_ACCESS_TOKEN: JSON.stringify(process.env.MAPBOX_ACCESS_TOKEN),
        MAP_BBOX: JSON.stringify(process.env.MAP_BBOX),
      }),
      nodeResolve({ browser: true, preferBuiltins: false }),
      commonjs(),
      babel({
        exclude: 'node_modules/**',
        presets: [
          [
            '@babel/preset-env',
            {
              targets: { esmodules: true },
              bugfixes: true,
              loose: true,
            },
          ],
        ],
      }),
      process.env.NODE_ENV === 'production' && terser(),
      process.env.NODE_ENV === 'production' &&
        entrypointHashmanifest({
          manifestName: path.join(HASH, 'hashes_map.json'),
        }),
      // visualizer(),
    ],
  },
  {
    input: path.join(JS_SRC, 'tagscloud.js'),
    output: {
      dir: JS_DIST,
      entryFileNames: JS_NAME,
      format: 'es',
      sourcemap: true,
      globals: {
        // events: 'events',
      },
    },
    plugins: [
      nodeResolve({ browser: true, preferBuiltins: false }),
      commonjs(),
      babel({
        exclude: 'node_modules/**',
        presets: [
          [
            '@babel/preset-env',
            {
              targets: { esmodules: true },
              bugfixes: true,
              loose: true,
            },
          ],
        ],
      }),
      process.env.NODE_ENV === 'production' && terser(),
      process.env.NODE_ENV === 'production' &&
        entrypointHashmanifest({
          manifestName: path.join(HASH, 'hashes_map.json'),
        }),
      // visualizer(),
    ],
  },
];
