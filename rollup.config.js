// rollup.config.js
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
    input: 'src/index.js',
    output: {
        file: 'dist/snapshot.js',
        format: 'iife',
        name: 'snapshot'
    },
    plugins: [resolve(), commonjs()]
};