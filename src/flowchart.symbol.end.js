var Symbol = require('./flowchart.symbol');
var inherits = require('./flowchart.helpers').inherits;

function End(chart, options) {
  options = options || {};
  options.text = options.text || 'End';
  Symbol.call(this, chart, options);
  this.initPath.call(this, chart, options);
}
inherits(End, Symbol);

module.exports = End;
