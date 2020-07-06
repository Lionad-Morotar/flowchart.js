const rectangle = require('../data/rectangle');
const rectData = rectangle.init({ calcBaseRatio });

const typeDataMap = {
  start: rectData,
  end: rectData,
  operation: rectData,
  parallel: rectData,
  subroutine: rectData,
};

function splitNum(str) {
  return str.split(/\s/g).map((x) => x.replace(/[a-zA-Z,]/g, ''));
}
function calcBaseRatio(p1, p2) {
  const n1 = splitNum(p1);
  const n2 = splitNum(p2);
  return n1.map((x, i) => {
    const res = n2[i] - x;
    if (res == 0) return 0;
    else return res / Math.abs(x);
  });
}
function calcRatio({ width, height, baseRatio }) {
  return { x: width / baseRatio, y: height / baseRatio };
}
function calcPath({ width, height, type }) {
  const dataRef = typeDataMap[type];
  const { x: rx, y: ry } = calcRatio({ width, height, baseRatio: dataRef.baseRatio });
  const ns = splitNum(dataRef.path);
  const offset = {
    x: ns.map((x, i) => +x * +dataRef.ratioBase.x[i] * +rx),
    y: ns.map((x, i) => +x * +dataRef.ratioBase.y[i] * +ry),
  };
  const dots = ns.map((x, i) => +x + offset.x[i] + offset.y[i]);
  let i = 0;
  return dataRef.path.replace(/[-\d.]+/g, () => dots[i++]);
}

module.exports = { splitNum, calcBaseRatio, calcPath };
