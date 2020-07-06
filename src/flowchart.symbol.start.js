var Symbol = require('./flowchart.symbol');
var inherits = require('./flowchart.helpers').inherits;

function Start(chart, options) {
  var symbol = chart.paper.rect(0, 0, 0, 0, 20);
  options = options || {};
  options.text = options.text || 'Start';
  Symbol.call(this, chart, options, symbol);
}
inherits(Start, Symbol);

module.exports = Start;
