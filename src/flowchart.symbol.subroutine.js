var Symbol = require('./flowchart.symbol');
var inherits = require('./flowchart.helpers').inherits;

function Subroutine(chart, options) {
  options = options || {};
  Symbol.call(this, chart, options);
}
inherits(Subroutine, Symbol);

module.exports = Subroutine;
