var Symbol = require('./flowchart.symbol');
var inherits = require('./flowchart.helpers').inherits;

function Operation(chart, options) {
  var symbol = chart.paper.rect(0, 0, 0, 0);
  options = options || {};
  Symbol.call(this, chart, options, symbol);
  // this.initPath.call(this, chart, options);
}
inherits(Operation, Symbol);

module.exports = Operation;
