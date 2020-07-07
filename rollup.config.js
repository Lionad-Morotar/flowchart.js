const copy = require('rollup-plugin-copy');
function copyCSS() {
  return copy({
    targets: [{ src: ['src/styles/**/*'], dest: 'release' }],
  });
}

export default {
  input: 'index.js',
  plugins: [copyCSS(), require('rollup-plugin-commonjs')(), require('rollup-plugin-node-resolve')()],
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
