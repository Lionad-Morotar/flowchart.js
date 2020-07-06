export default {
  input: 'index.js',
  plugins: [require('rollup-plugin-commonjs')(), require('rollup-plugin-node-resolve')()],
  external: ['raphael', /node_modules/],
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
