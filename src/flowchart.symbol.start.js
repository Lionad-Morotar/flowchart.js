var Symbol = require('./flowchart.symbol');
var inherits = require('./flowchart.helpers').inherits;

function Start(chart, options) {
  options = options || {};
  options.text = options.text || 'Start';
  Symbol.call(this, chart, options);
  this.initPath.call(this, chart, options);
}
inherits(Start, Symbol);

module.exports = Start;
