// rollup.config.js
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from 'rollup-plugin-babel';

export default {
    input: 'src/index.js',
    output: {
        file: 'dist/snapshot.js',
        format: 'iife',
        name: 'snapshot'
    },
    plugins: [babel(), resolve(), commonjs()]
};