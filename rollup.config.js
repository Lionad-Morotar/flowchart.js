export default {
  input: 'index.js',
  plugins: [require('rollup-plugin-node-resolve')(), require('rollup-plugin-commonjs')()],
  external: ['raphael'],
  output: {
    name: 'flowchart',
    file: './release/flowchart.js',
    format: 'umd',
    globals: {
      raphael: 'Raphael',
    },
  },
  watch: {
    include: './src/**',
  },
};
