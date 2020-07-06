var Symbol = require('./flowchart.symbol');
var inherits = require('./flowchart.helpers').inherits;

function Subroutine(chart, options) {
  options = options || {};
  Symbol.call(this, chart, options, () => {
    this.textMargin = this.getAttr('text-margin');
    const width = this.text.getBBox().width + 2 * this.textMargin;
    const height = this.text.getBBox().height + 2 * this.textMargin;

    var symbol = chart.paper.rect(0, 0, 0, 0);

    symbol.attr({
      fill: this.getAttr('fill'),
      stroke: this.getAttr('element-color'),
      'stroke-width': this.getAttr('line-width'),
      width,
      height,
    });

    symbol.node.setAttribute('class', this.getAttr('class'));
    if (options.link) {
      symbol.attr('href', options.link);
    }
    if (options.target) {
      symbol.attr('target', options.target);
    }
    if (options.function) {
      symbol.node.addEventListener(
        'click',
        function (evt) {
          window[options.function](evt, options);
        },
        false
      );
      symbol.attr({ cursor: 'pointer' });
    }
    if (options.key) {
      symbol.node.id = options.key;
    }
    this.symbol = symbol;
    this.group.push(symbol);
    symbol.insertBefore(this.text);

    this.text.attr({
      x: 2 * this.getAttr('text-margin'),
      y: symbol.getBBox().height / 2,
    });

    var innerWrap = chart.paper.rect(0, 0, 0, 0);
    innerWrap.attr({
      x: this.getAttr('text-margin'),
      stroke: this.getAttr('element-color'),
      'stroke-width': this.getAttr('line-width'),
      width: this.text.getBBox().width + 2 * this.getAttr('text-margin'),
      height: this.text.getBBox().height + 2 * this.getAttr('text-margin'),
      fill: this.getAttr('fill'),
    });
    if (options.key) {
      innerWrap.node.id = options.key + 'i';
    }

    var font = this.getAttr('font');
    var fontF = this.getAttr('font-family');
    var fontW = this.getAttr('font-weight');

    if (font) innerWrap.attr({ font: font });
    if (fontF) innerWrap.attr({ 'font-family': fontF });
    if (fontW) innerWrap.attr({ 'font-weight': fontW });

    if (options.link) {
      innerWrap.attr('href', options.link);
    }
    if (options.target) {
      innerWrap.attr('target', options.target);
    }
    this.group.push(innerWrap);
    innerWrap.insertBefore(this.text);

    this.initialize();
  });
}
inherits(Subroutine, Symbol);

module.exports = Subroutine;
