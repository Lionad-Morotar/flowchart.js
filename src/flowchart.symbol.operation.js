var Symbol = require('./flowchart.symbol');
var inherits = require('./flowchart.helpers').inherits;

function Operation(chart, options) {
  options = options || {};
  Symbol.call(this, chart, options);
}
inherits(Operation, Symbol);

module.exports = Operation;
