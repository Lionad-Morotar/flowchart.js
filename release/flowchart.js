(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('raphael')) :
  typeof define === 'function' && define.amd ? define(['raphael'], factory) :
  (global = global || self, global.flowchart = factory(global.Raphael));
}(this, (function (raphael) { 'use strict';

  raphael = raphael && Object.prototype.hasOwnProperty.call(raphael, 'default') ? raphael['default'] : raphael;

  // add indexOf to non ECMA-262 standard compliant browsers
  if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (searchElement /*, fromIndex */ ) {
      if (this === null) {
        throw new TypeError();
      }
      var t = Object(this);
      var len = t.length >>> 0;
      if (len === 0) {
        return -1;
      }
      var n = 0;
      if (arguments.length > 0) {
        n = Number(arguments[1]);
        if (n != n) { // shortcut for verifying if it's NaN
          n = 0;
        } else if (n !== 0 && n != Infinity && n != -Infinity) {
          n = (n > 0 || -1) * Math.floor(Math.abs(n));
        }
      }
      if (n >= len) {
        return -1;
      }
      var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
      for (; k < len; k++) {
        if (k in t && t[k] === searchElement) {
          return k;
        }
      }
      return -1;
    };
  }

  // add lastIndexOf to non ECMA-262 standard compliant browsers
  if (!Array.prototype.lastIndexOf) {
    Array.prototype.lastIndexOf = function(searchElement /*, fromIndex*/) {
      if (this === null) {
        throw new TypeError();
      }
      var t = Object(this);
      var len = t.length >>> 0;
      if (len === 0) {
        return -1;
      }
      var n = len;
      if (arguments.length > 1) {
        n = Number(arguments[1]);
        if (n != n) {
          n = 0;
        } else if (n !== 0 && n != (1 / 0) && n != -(1 / 0)) {
          n = (n > 0 || -1) * Math.floor(Math.abs(n));
        }
      }
      var k = n >= 0 ? Math.min(n, len - 1) : len - Math.abs(n);
      for (; k >= 0; k--) {
        if (k in t && t[k] === searchElement) {
          return k;
        }
      }
      return -1;
    };
  }

  if (!String.prototype.trim) {
    String.prototype.trim = function() {
      return this.replace(/^\s+|\s+$/g, '');
    };
  }

  function _defaults(options, defaultOptions) {
    if (!options || typeof options === 'function') {
      return defaultOptions;
    }

    var merged = {};
    for (var attrname in defaultOptions) {
      merged[attrname] = defaultOptions[attrname];
    }

    for (attrname in options) {
      if (options[attrname]) {
        if (typeof merged[attrname] === 'object') {
          merged[attrname] = _defaults(merged[attrname], options[attrname]);
        } else {
          merged[attrname] = options[attrname];
        }
      }
    }
    return merged;
  }

  function _inherits(ctor, superCtor) {
    if (typeof(Object.create) === 'function') {
      // implementation from standard node.js 'util' module
      ctor.super_ = superCtor;
      ctor.prototype = Object.create(superCtor.prototype, {
        constructor: {
          value: ctor,
          enumerable: false,
          writable: true,
          configurable: true
        }
      });
    } else {
      // old school shim for old browsers
      ctor.super_ = superCtor;
      var TempCtor = function () {};
      TempCtor.prototype = superCtor.prototype;
      ctor.prototype = new TempCtor();
      ctor.prototype.constructor = ctor;
    }
  }

  // move dependent functions to a container so that
  // they can be overriden easier in no jquery environment (node.js)
  var flowchart_helpers = {
    defaults: _defaults,
    inherits: _inherits
  };

  // defaults
  var flowchart_defaults = {
    x: 0,
    y: 0,
    'line-width': 1,
    'line-length': 50,
    'text-margin': 10,
    'line-style': 'double',
    'font-size': 14,
    'font-color': 'black',
    // 'font': 'normal',
    // 'font-family': 'calibri',
    // 'font-weight': 'normal',
    'line-color': 'black',
    'element-color': 'black',
    fill: 'white',
    'yes-text': 'yes',
    'no-text': 'no',
    'arrow-end': 'block',
    class: 'flowchart',
    scale: 1,
    symbols: {
      start: {},
      end: {},
      condition: {},
      inputoutput: {},
      operation: {},
      subroutine: {},
      parallel: {},
    },
    // 'flowstate' : {
    //   'past' : { 'fill': '#CCCCCC', 'font-size': 12},
    //   'current' : {'fill': 'yellow', 'font-color': 'red', 'font-weight': 'bold'},
    //   'future' : { 'fill': '#FFFF99'},
    //   'invalid': {'fill': '#444444'}
    // }
  };

  const baseRatio = 1;
  const paths = {
    1: 'M0.0641499905847013 -0.015804485883563757 C0.2424007847905159 -0.06936944252811374, 0.5955324650742114 -0.056038556760177015, 1.0092416285537182 -0.09734808346256614 M-0.019663748843595386 0.011179570807144046 C0.259725610120222 -0.013403038419783115, 0.4593260458204895 -0.023059275485575202, 1.0217802860308438 -0.04381300513632596 M1.0686826466582715 -0.019963158573955295 C0.9490461017657071 0.30267627257853746, 1.0702910121250897 0.6206023591570556, 1.083006366994232 1.0003411785699428 M1.029932663636282 -0.02039361302740872 C0.9782374534569681 0.390025649825111, 1.0431556124053896 0.7235069987829775, 1.0397002630401402 0.9713972106110305 M1.0495068638585507 0.945825316105038 C0.6043268961831928 1.0926049056183547, 0.40743479700759055 0.9373160632979125, -0.08125923285260797 0.9355709717608989 M1.0245902352500706 0.9952457561623305 C0.761517841508612 1.0431499176658692, 0.5320018614176661 0.9834544845856728, -0.03349261204712093 0.9781238734256477 M0.06752046933397651 1.0805752203799783 C0.054638560032472014 0.6786474615335464, 0.01803530297242105 0.2678376569412648, 0.028026249911636103 0.05510948458686471 M-0.019826471013948323 0.9564176857005805 C0.044625881947576995 0.7466487661469727, 0.02391581747680903 0.4611962051596492, -0.028369323117658496 -0.015596212493255733',
    10: 'M0.641499905847013 -0.15804485883563757 C2.424007847905159 -0.6936944252811372, 5.955324650742114 -0.5603855676017702, 10.092416285537183 -0.9734808346256614 M-0.19663748843595386 0.11179570807144046 C2.5972561012022197 -0.13403038419783117, 4.593260458204895 -0.230592754855752, 10.217802860308439 -0.43813005136325955 M10.686826466582716 -0.19963158573955297 C9.490461017657072 3.0267627257853746, 10.702910121250898 6.206023591570556, 10.83006366994232 10.003411785699427 M10.29932663636282 -0.2039361302740872 C9.78237453456968 3.9002564982511103, 10.431556124053895 7.235069987829775, 10.397002630401403 9.713972106110305 M10.495068638585508 9.45825316105038 C6.043268961831927 10.926049056183547, 4.074347970075905 9.373160632979125, -0.8125923285260797 9.355709717608988 M10.245902352500707 9.952457561623305 C7.61517841508612 10.43149917665869, 5.320018614176661 9.834544845856726, -0.3349261204712093 9.781238734256476 M0.6752046933397651 10.805752203799784 C0.5463856003247202 6.7864746153354645, 0.18035302972421052 2.6783765694126487, 0.28026249911636114 0.5510948458686471 M-0.1982647101394832 9.564176857005805 C0.44625881947577 7.466487661469728, 0.23915817476809026 4.611962051596492, -0.28369323117658496 -0.15596212493255734',
  };
  const pathsXChange = {
    1: 'M0.1282999811694026 -0.031608971767127514 C0.4848015695810318 -0.13873888505622747, 1.1910649301484229 -0.11207711352035403, 2.0184832571074365 -0.19469616692513228 M-0.03932749768719077 0.02235914161428809 C0.519451220240444 -0.02680607683956623, 0.918652091640979 -0.046118550971150404, 2.0435605720616876 -0.08762601027265192 M2.0686826466582717 -0.019963158573955295 C1.949046101765707 0.30267627257853746, 2.07029101212509 0.6206023591570556, 2.083006366994232 1.0003411785699428 M2.029932663636282 -0.02039361302740872 C1.978237453456968 0.390025649825111, 2.0431556124053896 0.7235069987829775, 2.03970026304014 0.9713972106110305 M2.0990137277171015 0.8916506322100759 C1.2086537923663856 1.1852098112367093, 0.8148695940151811 0.8746321265958249, -0.16251846570521594 0.8711419435217976 M2.0491804705001413 0.990491512324661 C1.523035683017224 1.086299835331738, 1.0640037228353323 0.9669089691713452, -0.06698522409424186 0.9562477468512952 M0.06752046933397651 1.0805752203799783 C0.054638560032472014 0.6786474615335464, 0.01803530297242105 0.2678376569412648, 0.028026249911636103 0.05510948458686471 M-0.019826471013948323 0.9564176857005805 C0.044625881947576995 0.7466487661469727, 0.02391581747680903 0.4611962051596492, -0.028369323117658496 -0.015596212493255733',
    10: 'M1.282999811694026 -0.31608971767127514 C4.848015695810318 -1.3873888505622745, 11.910649301484227 -1.1207711352035403, 20.184832571074367 -1.9469616692513227 M-0.3932749768719077 0.22359141614288092 C5.1945122024044394 -0.26806076839566234, 9.18652091640979 -0.461185509711504, 20.435605720616877 -0.8762601027265191 M20.686826466582716 -0.19963158573955297 C19.490461017657072 3.0267627257853746, 20.7029101212509 6.206023591570556, 20.83006366994232 10.003411785699427 M20.29932663636282 -0.2039361302740872 C19.78237453456968 3.9002564982511103, 20.431556124053895 7.235069987829775, 20.397002630401403 9.713972106110305 M20.990137277171016 8.916506322100759 C12.086537923663855 11.852098112367093, 8.14869594015181 8.74632126595825, -1.6251846570521593 8.711419435217977 M20.491804705001414 9.90491512324661 C15.23035683017224 10.86299835331738, 10.640037228353322 9.669089691713452, -0.6698522409424186 9.562477468512952 M0.6752046933397651 10.805752203799784 C0.5463856003247202 6.7864746153354645, 0.18035302972421052 2.6783765694126487, 0.28026249911636114 0.5510948458686471 M-0.1982647101394832 9.564176857005805 C0.44625881947577 7.466487661469728, 0.23915817476809026 4.611962051596492, -0.28369323117658496 -0.15596212493255734',
  };
  const pathsYChange = {
    1: 'M0.0641499905847013 -0.015804485883563757 C0.2424007847905159 -0.06936944252811374, 0.5955324650742114 -0.056038556760177015, 1.0092416285537182 -0.09734808346256614 M-0.019663748843595386 0.011179570807144046 C0.259725610120222 -0.013403038419783115, 0.4593260458204895 -0.023059275485575202, 1.0217802860308438 -0.04381300513632596 M1.137365293316543 -0.03992631714791059 C0.8980922035314143 0.6053525451570749, 1.1405820242501794 1.2412047183141113, 1.1660127339884638 2.0006823571398855 M1.0598653272725642 -0.04078722605481744 C0.9564749069139362 0.780051299650222, 1.0863112248107791 1.447013997565955, 1.0794005260802806 1.942794421222061 M1.0495068638585507 1.9458253161050378 C0.6043268961831928 2.0926049056183547, 0.40743479700759055 1.9373160632979125, -0.08125923285260797 1.9355709717608989 M1.0245902352500706 1.9952457561623305 C0.761517841508612 2.043149917665869, 0.5320018614176661 1.9834544845856728, -0.03349261204712093 1.9781238734256477 M0.13504093866795303 2.1611504407599567 C0.10927712006494403 1.3572949230670928, 0.0360706059448421 0.5356753138825296, 0.056052499823272206 0.11021896917372942 M-0.03965294202789665 1.912835371401161 C0.08925176389515399 1.4932975322939455, 0.04783163495361806 0.9223924103192984, -0.05673864623531699 -0.031192424986511466',
    10: 'M0.641499905847013 -0.15804485883563757 C2.424007847905159 -0.6936944252811372, 5.955324650742114 -0.5603855676017702, 10.092416285537183 -0.9734808346256614 M-0.19663748843595386 0.11179570807144046 C2.5972561012022197 -0.13403038419783117, 4.593260458204895 -0.230592754855752, 10.217802860308439 -0.43813005136325955 M11.373652933165431 -0.39926317147910595 C8.980922035314142 6.053525451570749, 11.405820242501795 12.412047183141112, 11.660127339884639 20.006823571398854 M10.598653272725642 -0.4078722605481744 C9.564749069139362 7.800512996502221, 10.863112248107791 14.47013997565955, 10.794005260802805 19.42794421222061 M10.495068638585508 19.45825316105038 C6.043268961831927 20.926049056183547, 4.074347970075905 19.373160632979125, -0.8125923285260797 19.35570971760899 M10.245902352500707 19.952457561623305 C7.61517841508612 20.43149917665869, 5.320018614176661 19.834544845856726, -0.3349261204712093 19.781238734256476 M1.3504093866795301 21.61150440759957 C1.0927712006494403 13.572949230670929, 0.36070605944842105 5.356753138825297, 0.5605249982327223 1.1021896917372942 M-0.3965294202789664 19.12835371401161 C0.89251763895154 14.932975322939456, 0.4783163495361805 9.223924103192983, -0.5673864623531699 -0.3119242498651147',
  };

  const data = {
    baseRatio,
    path: paths[baseRatio],
    init({ calcBaseRatio }) {
      const ref = (data.ratioBase = {});
      ref.x = calcBaseRatio(data.path, pathsXChange[baseRatio]);
      ref.y = calcBaseRatio(data.path, pathsYChange[baseRatio]);
      return data;
    },
  };

  var rectangle = data;

  const baseRatio$1 = 10;
  const paths$1 = {
    10: 'M6.510043594949674 0.1680424374037116 C8.053727408900238 1.9716394703403708, 9.256016431315658 5.001377242320958, 9.405074706379878 5.855950478685565 M5.702722715027039 0.22225341685624006 C6.708035571513988 1.2516488076941916, 8.165498860428135 2.479548464144401, 10.231666696258277 5.805259104176369 M9.771017171974293 6.2631118792395 C8.67217760985496 6.713957511317894, 6.988745923517895 8.08243827420021, 5.741054505323196 9.827176134345669 M10.26534354064359 6.148658706115972 C8.772018149891945 7.578107990994328, 6.921647280470154 9.107660286429159, 6.2332614775682735 9.796400083567692 M5.745025567489277 10.039002198742766 C4.28792687711917 7.773367901354947, 1.3910694896176747 7.4813071974988095, 0.5578082281051563 5.704053698926727 M5.83242817868229 9.834344548730186 C4.559167542419283 8.9440601620854, 2.805076977270545 8.336016737506554, -0.018665631289848272 5.658020618638497 M-0.8082275068507091 5.676719283514197 C1.0909808560685166 5.048022691174767, 2.665634974807723 1.8797394500043438, 6.3868019936148395 0.30589790736199296 M-0.41019068360700767 6.089598391835018 C1.7596188451358428 4.131073520211086, 3.315255966134413 2.560759180687082, 5.744513850423759 -0.06397687639548699',
  };
  const pathsXChange$1 = {
    10: 'M11.76506539242451 0.25206365610556736 C15.294864776122388 1.7762087597609457, 18.284476740846657 5.1346369866306825, 19.107612059569817 5.783925718028348 M10.554084072540558 0.33338012528436023 C12.740745254756387 1.1489141248273473, 15.631673058996947 2.286030738633323, 20.347500044387417 5.707888656264554 M19.601329782806285 6.458090551798417 C17.024336135562038 6.313440682522664, 13.451319345287406 7.761143695574717, 10.549163325939245 9.69910526195032 M20.46197598261584 6.258822022445883 C17.101515058339235 7.668548242930303, 13.144010359366568 9.260052678361088, 11.406119553710074 9.645522663841072 M10.58613829211734 10.063306412426984 C7.7110639740267874 7.355568066462459, 2.5205679486720314 7.846968657755701, 0.9054063330247462 5.519634810448733 M10.728005825993403 9.731116381719119 C8.380405067888368 8.881220554418467, 5.230078284245453 8.493508292410324, -0.030297116335378904 5.444916223806188 M-1.1934856591812149 5.522620925735329 C2.238005868639561 5.4318608188831945, 5.186988621332819 1.5869592329633084, 11.571179065806389 0.45171039406051605 M-0.6057164526882783 6.132307295698791 C3.2340359698754857 4.051934469164202, 6.1508070733544375 2.561186924680089, 10.622731157930025 -0.09447276150590955',
  };
  const pathsYChange$1 = {
    10: 'M6.827877176632624 0.2727580544286141 C8.336141138206202 3.694802048158655, 9.302080508662765 9.111150676980333, 9.034347108234623 10.76618604334627 M5.5174744241524865 0.3607505967446818 C6.574655690776534 2.3476563994498876, 8.354798091069558 4.636967964718795, 10.376029759646396 10.683906347210804 M9.601329782806285 11.458090551798417 C8.638043752766674 12.87740636846767, 6.641995895947688 15.902078314975366, 5.5491633259392446 19.69910526195032 M10.46197598261584 11.258822022445884 C8.950432552774098 14.494393323264996, 6.800367409215452 17.8933373141098, 6.406119553710074 19.645522663841074 M5.6175383512339145 20.05850329811415 C4.619784306161891 15.487911429066092, 1.4364886739284242 13.887829924263109, 0.8367123421577345 10.55608054839009 M5.748642268023435 19.75151682309528 C4.533166545665187 17.704543474786888, 2.6232456716823607 16.071263364178336, -0.02799844693477238 10.487030927957745 M-1.1934856591812149 10.52262092573533 C0.7749794669595977 8.965147793927951, 2.2666160531687978 3.662900041524007, 6.571179065806389 0.45171039406051605 M-0.6057164526882783 11.13230729569879 C1.7582778780494936 7.642476845485011, 3.2273520079587543 4.704032327431207, 5.6227311579300245 -0.09447276150590955',
  };

  const data$1 = {
    baseRatio: baseRatio$1,
    path: paths$1[baseRatio$1],
    init({ calcBaseRatio }) {
      const ref = (data$1.ratioBase = {});
      ref.x = calcBaseRatio(data$1.path, pathsXChange$1[baseRatio$1]);
      ref.y = calcBaseRatio(data$1.path, pathsYChange$1[baseRatio$1]);
      return data$1;
    },
  };

  var diamond = data$1;

  const rectData = rectangle.init({ calcBaseRatio });
  const diamondData = diamond.init({ calcBaseRatio });

  const typeDataMap = {
    start: rectData,
    end: rectData,
    operation: rectData,
    parallel: rectData,
    subroutine: rectData,
    condition: diamondData,
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

  var util_excalibur = { splitNum, calcBaseRatio, calcPath };
  var util_excalibur_1 = util_excalibur.splitNum;
  var util_excalibur_2 = util_excalibur.calcBaseRatio;
  var util_excalibur_3 = util_excalibur.calcPath;

  var util_excalibur$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    'default': util_excalibur,
    __moduleExports: util_excalibur,
    splitNum: util_excalibur_1,
    calcBaseRatio: util_excalibur_2,
    calcPath: util_excalibur_3
  });

  function drawPath(chart, location, points) {
    var i, len;
    var path = 'M{0},{1}';
    for (i = 2, len = 2 * points.length + 2; i < len; i += 2) {
      path += ' L{' + i + '},{' + (i + 1) + '}';
    }
    var pathValues = [location.x, location.y];
    for (i = 0, len = points.length; i < len; i++) {
      pathValues.push(points[i].x);
      pathValues.push(points[i].y);
    }
    var symbol = chart.paper.path(path, pathValues);
    symbol.attr('stroke', chart.options['element-color']);
    symbol.attr('stroke-width', chart.options['line-width']);

    var font = chart.options.font;
    var fontF = chart.options['font-family'];
    var fontW = chart.options['font-weight'];

    if (font) symbol.attr({ font: font });
    if (fontF) symbol.attr({ 'font-family': fontF });
    if (fontW) symbol.attr({ 'font-weight': fontW });

    return symbol;
  }

  function safe(num) {
    return Number((+num).toFixed(1));
  }

  function calcDirection(from, to) {
    const threshold = 1;
    const equal = (a, b) => Math.abs(a - b) < threshold;
    if (equal(from.x, to.x)) {
      if (from.y > to.y) {
        return 'top';
      } else {
        return 'bottom';
      }
    }
    if (equal(from.y, to.y)) {
      if (from.x > to.x) {
        return 'left';
      } else {
        return 'right';
      }
    }
    return 'no';
  }
  function handScriptLine(from, to) {
    const half = (a, b) => (+a + b) / 2;
    const randomOffset = () => Math.random() * 8 * (Math.random() < 0.5 ? 1 : -1);
    const direction = calcDirection(from, to);
    let curvDot = {
      x: half(from.x, to.x),
      y: half(from.y, to.y),
    };
    const move = `M${from.x},${from.y}`;
    if (direction === 'left' || direction === 'right') {
      curvDot.y += randomOffset();
    } else if (direction === 'top' || direction === 'bottom') {
      curvDot.x += randomOffset();
    } else {
      curvDot.y += randomOffset();
      curvDot.x += randomOffset();
    }
    from.x = safe(from.x);
    from.y = safe(from.y);
    to.x = safe(to.x);
    to.y = safe(to.y);
    curvDot.x = safe(curvDot.x);
    curvDot.y = safe(curvDot.y);
    const line = `C${from.x},${from.y},${curvDot.x},${curvDot.y},${to.x},${to.y}`;
    return [move, line].join(' ');
  }

  // TODO seed
  function handScriptPath({ chart, points, type }) {
    const pathValues = [];
    points.map((dot, i) => {
      if (i !== points.length - 1) {
        let line = null;
        switch (type) {
          case 'double':
            line = handScriptLine(dot, points[i + 1]) + ' ' + handScriptLine(dot, points[i + 1]);
            break;
          default:
            line = handScriptLine(dot, points[i + 1]);
        }
        pathValues.push(line);
      }
    });
    const path = pathValues.join(' ');
    var symbol = chart.paper.path(path);
    symbol.attr('stroke', chart.options['element-color']);
    symbol.attr('stroke-width', chart.options['line-width']);

    var font = chart.options.font;
    var fontF = chart.options['font-family'];
    var fontW = chart.options['font-weight'];

    if (font) symbol.attr({ font: font });
    if (fontF) symbol.attr({ 'font-family': fontF });
    if (fontW) symbol.attr({ 'font-weight': fontW });

    return symbol;
  }

  function drawLine(chart, from, to, text) {
    var i, len;

    if (Object.prototype.toString.call(to) !== '[object Array]') {
      to = [to];
    }

    var path = 'M{0},{1}';
    for (i = 2, len = 2 * to.length + 2; i < len; i += 2) {
      path += ' L{' + i + '},{' + (i + 1) + '}';
    }
    var pathValues = [from.x, from.y];
    for (i = 0, len = to.length; i < len; i++) {
      pathValues.push(to[i].x);
      pathValues.push(to[i].y);
    }

    var line = chart.paper.path(path, pathValues);
    line.attr({
      stroke: chart.options['line-color'],
      'stroke-width': chart.options['line-width'],
      'arrow-end': chart.options['arrow-end'],
    });

    var font = chart.options.font;
    var fontF = chart.options['font-family'];
    var fontW = chart.options['font-weight'];

    if (font) line.attr({ font: font });
    if (fontF) line.attr({ 'font-family': fontF });
    if (fontW) line.attr({ 'font-weight': fontW });

    if (text) {
      var centerText = false;

      var textPath = chart.paper.text(0, 0, text);

      var isHorizontal = false;
      var firstTo = to[0];

      if (from.y === firstTo.y) {
        isHorizontal = true;
      }

      var x = 0,
        y = 0;

      if (centerText) {
        if (from.x > firstTo.x) {
          x = from.x - (from.x - firstTo.x) / 2;
        } else {
          x = firstTo.x - (firstTo.x - from.x) / 2;
        }

        if (from.y > firstTo.y) {
          y = from.y - (from.y - firstTo.y) / 2;
        } else {
          y = firstTo.y - (firstTo.y - from.y) / 2;
        }

        if (isHorizontal) {
          x -= textPath.getBBox().width / 2;
          y -= chart.options['text-margin'];
        } else {
          x += chart.options['text-margin'];
          y -= textPath.getBBox().height / 2;
        }
      } else {
        x = from.x;
        y = from.y;

        if (isHorizontal) {
          x += chart.options['text-margin'] / 2;
          y -= chart.options['text-margin'];
        } else {
          x += chart.options['text-margin'] / 2;
          y += chart.options['text-margin'];
          if (from.y > firstTo.y) {
            y -= chart.options['text-margin'] * 2;
          }
        }
      }

      textPath.attr({
        'text-anchor': 'start',
        'font-size': chart.options['font-size'],
        fill: chart.options['font-color'],
        x: x,
        y: y,
      });

      if (font) textPath.attr({ font: font });
      if (fontF) textPath.attr({ 'font-family': fontF });
      if (fontW) textPath.attr({ 'font-weight': fontW });
    }

    return line;
  }

  function checkLineIntersection(
    line1StartX,
    line1StartY,
    line1EndX,
    line1EndY,
    line2StartX,
    line2StartY,
    line2EndX,
    line2EndY
  ) {
    // if the lines intersect, the result contains the x and y of the intersection (treating the lines as infinite) and booleans for whether line segment 1 or line segment 2 contain the point
    var denominator,
      a,
      b,
      numerator1,
      numerator2,
      result = {
        x: null,
        y: null,
        onLine1: false,
        onLine2: false,
      };
    denominator =
      (line2EndY - line2StartY) * (line1EndX - line1StartX) - (line2EndX - line2StartX) * (line1EndY - line1StartY);
    if (denominator === 0) {
      return result;
    }
    a = line1StartY - line2StartY;
    b = line1StartX - line2StartX;
    numerator1 = (line2EndX - line2StartX) * a - (line2EndY - line2StartY) * b;
    numerator2 = (line1EndX - line1StartX) * a - (line1EndY - line1StartY) * b;
    a = numerator1 / denominator;
    b = numerator2 / denominator;

    // if we cast these lines infinitely in both directions, they intersect here:
    result.x = line1StartX + a * (line1EndX - line1StartX);
    result.y = line1StartY + a * (line1EndY - line1StartY);
    /*
    // it is worth noting that this should be the same as:
    x = line2StartX + (b * (line2EndX - line2StartX));
    y = line2StartX + (b * (line2EndY - line2StartY));
    */
    // if line1 is a segment and line2 is infinite, they intersect if:
    if (a > 0 && a < 1) {
      result.onLine1 = true;
    }
    // if line2 is a segment and line1 is infinite, they intersect if:
    if (b > 0 && b < 1) {
      result.onLine2 = true;
    }
    // if line1 and line2 are segments, they intersect if both of the above are true
    return result;
  }

  var flowchart_functions = {
    drawPath,
    handScriptPath,
    drawLine,
    checkLineIntersection,
  };

  var drawLine$1 = flowchart_functions.drawLine;
  var checkLineIntersection$1 = flowchart_functions.checkLineIntersection;

  function Symbol(chart, options, symbolFn) {
    this.chart = chart;
    this.group = this.chart.paper.set();
    this.connectedTo = [];
    this.symbolType = options.symbolType;
    this.flowstate = options.flowstate || 'future';
    this.lineStyle = options.lineStyle || {};
    this.key = options.key || '';
    this.leftLines = [];
    this.rightLines = [];
    this.topLines = [];
    this.bottomLines = [];

    this.next_direction = options.next && options['direction_next'] ? options['direction_next'] : undefined;

    this.initText(chart, options);
    // console.log(this.symbolType);
    symbolFn ? symbolFn() : this.initSymbol(chart, options);
  }

  /* Gets the attribute based on Flowstate, Symbol-Name and default, first found wins */
  Symbol.prototype.getAttr = function (attName) {
    if (!this.chart) {
      return undefined;
    }
    var opt3 = this.chart.options ? this.chart.options[attName] : undefined;
    var opt2 = this.chart.options.symbols ? this.chart.options.symbols[this.symbolType][attName] : undefined;
    var opt1;
    if (this.chart.options.flowstate && this.chart.options.flowstate[this.flowstate]) {
      opt1 = this.chart.options.flowstate[this.flowstate][attName];
    }
    return opt1 || opt2 || opt3;
  };

  Symbol.prototype.initialize = function () {
    this.group.transform('t' + this.getAttr('line-width') + ',' + this.getAttr('line-width'));

    this.width = this.group.getBBox().width;
    this.height = this.group.getBBox().height;
  };

  Symbol.prototype.getCenter = function () {
    return { x: this.getX() + this.width / 2, y: this.getY() + this.height / 2 };
  };

  Symbol.prototype.getX = function () {
    return this.group.getBBox().x;
  };

  Symbol.prototype.getY = function () {
    return this.group.getBBox().y;
  };

  Symbol.prototype.shiftX = function (x) {
    this.group.transform('t' + (this.getX() + x) + ',' + this.getY());
  };

  Symbol.prototype.setX = function (x) {
    this.group.transform('t' + x + ',' + this.getY());
  };

  Symbol.prototype.shiftY = function (y) {
    this.group.transform('t' + this.getX() + ',' + (this.getY() + y));
  };

  Symbol.prototype.setY = function (y) {
    this.group.transform('t' + this.getX() + ',' + y);
  };

  Symbol.prototype.getTop = function () {
    var y = this.getY();
    var x = this.getX() + this.width / 2;
    return { x: x, y: y };
  };

  Symbol.prototype.getBottom = function () {
    var y = this.getY() + this.height;
    var x = this.getX() + this.width / 2;
    return { x: x, y: y };
  };

  Symbol.prototype.getLeft = function () {
    var y = this.getY() + this.group.getBBox().height / 2;
    var x = this.getX();
    return { x: x, y: y };
  };

  Symbol.prototype.getRight = function () {
    var y = this.getY() + this.group.getBBox().height / 2;
    var x = this.getX() + this.group.getBBox().width;
    return { x: x, y: y };
  };

  Symbol.prototype.render = function () {
    if (this.next) {
      var self = this;
      var lineLength = this.getAttr('line-length');

      if (this.next_direction === 'right') {
        var rightPoint = this.getRight();

        if (!this.next.isPositioned) {
          this.next.setY(rightPoint.y + this.next.height / 2);
          this.next.shiftX(this.group.getBBox().x + this.width + lineLength);

          (function shift() {
            var hasSymbolUnder = false;
            var symb;
            for (var i = 0, len = self.chart.symbols.length; i < len; i++) {
              symb = self.chart.symbols[i];

              var diff = Math.abs(symb.getCenter().x - self.next.getCenter().x);
              if (symb.getCenter().y > self.next.getCenter().y && diff <= self.next.width / 2) {
                hasSymbolUnder = true;
                break;
              }
            }

            if (hasSymbolUnder) {
              if (self.next.symbolType === 'end') return;
              self.next.setX(symb.getX() + symb.width + lineLength);
              shift();
            }
          })();

          this.next.isPositioned = true;

          this.next.render();
        }
      } else if (this.next_direction === 'left') {
        var leftPoint = this.getLeft();

        if (!this.next.isPositioned) {
          this.next.setY(leftPoint.y + this.next.height / 2);
          this.next.shiftX(-(this.group.getBBox().x + this.width + lineLength));

          (function shift() {
            var hasSymbolUnder = false;
            var symb;
            for (var i = 0, len = self.chart.symbols.length; i < len; i++) {
              symb = self.chart.symbols[i];

              var diff = Math.abs(symb.getCenter().x - self.next.getCenter().x);
              if (symb.getCenter().y > self.next.getCenter().y && diff <= self.next.width / 2) {
                hasSymbolUnder = true;
                break;
              }
            }

            if (hasSymbolUnder) {
              if (self.next.symbolType === 'end') return;
              self.next.setX(symb.getX() + symb.width + lineLength);
              shift();
            }
          })();

          this.next.isPositioned = true;

          this.next.render();
        }
      } else {
        var bottomPoint = this.getBottom();

        if (!this.next.isPositioned) {
          this.next.shiftY(this.getY() + this.height + lineLength);
          this.next.setX(bottomPoint.x - this.next.width / 2);
          this.next.isPositioned = true;

          this.next.render();
        }
      }
    }
  };

  Symbol.prototype.renderLines = function () {
    if (this.next) {
      if (this.next_direction) {
        this.drawLineTo(this.next, this.getAttr('arrow-text') || '', this.next_direction);
      } else {
        this.drawLineTo(this.next, this.getAttr('arrow-text') || '');
      }
    }
  };

  Symbol.prototype.drawLineTo = function (symbol, text, origin) {
    if (this.connectedTo.indexOf(symbol) < 0) {
      this.connectedTo.push(symbol);
    }

    var x = this.getCenter().x,
      y = this.getCenter().y,
      right = this.getRight(),
      bottom = this.getBottom(),
      top = this.getTop(),
      left = this.getLeft();

    var symbolX = symbol.getCenter().x,
      symbolY = symbol.getCenter().y,
      symbolTop = symbol.getTop(),
      symbolRight = symbol.getRight(),
      symbolLeft = symbol.getLeft();

    var isOnSameColumn = x === symbolX,
      isOnSameLine = y === symbolY,
      isUnder = y < symbolY,
      isUpper = y > symbolY || this === symbol,
      isLeft = x > symbolX,
      isRight = x < symbolX;

    var maxX = 0,
      line,
      yOffset,
      lineLength = this.getAttr('line-length'),
      lineWith = this.getAttr('line-width');

    if ((!origin || origin === 'bottom') && isOnSameColumn && isUnder) {
      if (symbol.topLines.length === 0 && this.bottomLines.length === 0) {
        line = drawLine$1(this.chart, bottom, symbolTop, text);
      } else {
        yOffset = Math.max(symbol.topLines.length, this.bottomLines.length) * 10;
        line = drawLine$1(
          this.chart,
          bottom,
          [
            { x: symbolTop.x, y: symbolTop.y - yOffset },
            { x: symbolTop.x, y: symbolTop.y },
          ],
          text
        );
      }
      this.bottomLines.push(line);
      symbol.topLines.push(line);
      this.bottomStart = true;
      symbol.topEnd = true;
      maxX = bottom.x;
    } else if ((!origin || origin === 'right') && isOnSameLine && isRight) {
      if (symbol.leftLines.length === 0 && this.rightLines.length === 0) {
        line = drawLine$1(this.chart, right, symbolLeft, text);
      } else {
        yOffset = Math.max(symbol.leftLines.length, this.rightLines.length) * 10;
        line = drawLine$1(
          this.chart,
          right,
          [
            { x: right.x, y: right.y - yOffset },
            { x: right.x, y: symbolLeft.y - yOffset },
            { x: symbolLeft.x, y: symbolLeft.y - yOffset },
            { x: symbolLeft.x, y: symbolLeft.y },
          ],
          text
        );
      }
      this.rightLines.push(line);
      symbol.leftLines.push(line);
      this.rightStart = true;
      symbol.leftEnd = true;
      maxX = symbolLeft.x;
    } else if ((!origin || origin === 'left') && isOnSameLine && isLeft) {
      if (symbol.rightLines.length === 0 && this.leftLines.length === 0) {
        line = drawLine$1(this.chart, left, symbolRight, text);
      } else {
        yOffset = Math.max(symbol.rightLines.length, this.leftLines.length) * 10;
        line = drawLine$1(
          this.chart,
          right,
          [
            { x: right.x, y: right.y - yOffset },
            { x: right.x, y: symbolRight.y - yOffset },
            { x: symbolRight.x, y: symbolRight.y - yOffset },
            { x: symbolRight.x, y: symbolRight.y },
          ],
          text
        );
      }
      this.leftLines.push(line);
      symbol.rightLines.push(line);
      this.leftStart = true;
      symbol.rightEnd = true;
      maxX = symbolRight.x;
    } else if ((!origin || origin === 'right') && isOnSameColumn && isUpper) {
      yOffset = Math.max(symbol.topLines.length, this.rightLines.length) * 10;
      line = drawLine$1(
        this.chart,
        right,
        [
          { x: right.x + lineLength / 2, y: right.y - yOffset },
          { x: right.x + lineLength / 2, y: symbolTop.y - lineLength / 2 - yOffset },
          { x: symbolTop.x, y: symbolTop.y - lineLength / 2 - yOffset },
          { x: symbolTop.x, y: symbolTop.y },
        ],
        text
      );
      this.rightLines.push(line);
      symbol.topLines.push(line);
      this.rightStart = true;
      symbol.topEnd = true;
      maxX = right.x + lineLength / 2;
    } else if ((!origin || origin === 'right') && isOnSameColumn && isUnder) {
      yOffset = Math.max(symbol.topLines.length, this.rightLines.length) * 10;
      line = drawLine$1(
        this.chart,
        right,
        [
          { x: right.x + lineLength / 2, y: right.y - yOffset },
          { x: right.x + lineLength / 2, y: symbolTop.y - lineLength / 2 - yOffset },
          { x: symbolTop.x, y: symbolTop.y - lineLength / 2 - yOffset },
          { x: symbolTop.x, y: symbolTop.y },
        ],
        text
      );
      this.rightLines.push(line);
      symbol.topLines.push(line);
      this.rightStart = true;
      symbol.topEnd = true;
      maxX = right.x + lineLength / 2;
    } else if ((!origin || origin === 'bottom') && isLeft) {
      yOffset = Math.max(symbol.topLines.length, this.bottomLines.length) * 10;
      if (this.leftEnd && isUpper) {
        line = drawLine$1(
          this.chart,
          bottom,
          [
            { x: bottom.x, y: bottom.y + lineLength / 2 - yOffset },
            { x: bottom.x + (bottom.x - symbolTop.x) / 2, y: bottom.y + lineLength / 2 - yOffset },
            { x: bottom.x + (bottom.x - symbolTop.x) / 2, y: symbolTop.y - lineLength / 2 - yOffset },
            { x: symbolTop.x, y: symbolTop.y - lineLength / 2 - yOffset },
            { x: symbolTop.x, y: symbolTop.y },
          ],
          text
        );
      } else {
        line = drawLine$1(
          this.chart,
          bottom,
          [
            { x: bottom.x, y: symbolTop.y - lineLength / 2 - yOffset },
            { x: symbolTop.x, y: symbolTop.y - lineLength / 2 - yOffset },
            { x: symbolTop.x, y: symbolTop.y },
          ],
          text
        );
      }
      this.bottomLines.push(line);
      symbol.topLines.push(line);
      this.bottomStart = true;
      symbol.topEnd = true;
      maxX = bottom.x + (bottom.x - symbolTop.x) / 2;
    } else if ((!origin || origin === 'bottom') && isRight && isUnder) {
      yOffset = Math.max(symbol.topLines.length, this.bottomLines.length) * 10;
      line = drawLine$1(
        this.chart,
        bottom,
        [
          { x: bottom.x, y: symbolTop.y - lineLength / 2 - yOffset },
          { x: symbolTop.x, y: symbolTop.y - lineLength / 2 - yOffset },
          { x: symbolTop.x, y: symbolTop.y },
        ],
        text
      );
      this.bottomLines.push(line);
      symbol.topLines.push(line);
      this.bottomStart = true;
      symbol.topEnd = true;
      maxX = bottom.x;
      if (symbolTop.x > maxX) maxX = symbolTop.x;
    } else if ((!origin || origin === 'bottom') && isRight) {
      yOffset = Math.max(symbol.topLines.length, this.bottomLines.length) * 10;
      line = drawLine$1(
        this.chart,
        bottom,
        [
          { x: bottom.x, y: bottom.y + lineLength / 2 - yOffset },
          { x: bottom.x + (bottom.x - symbolTop.x) / 2, y: bottom.y + lineLength / 2 - yOffset },
          { x: bottom.x + (bottom.x - symbolTop.x) / 2, y: symbolTop.y - lineLength / 2 - yOffset },
          { x: symbolTop.x, y: symbolTop.y - lineLength / 2 - yOffset },
          { x: symbolTop.x, y: symbolTop.y },
        ],
        text
      );
      this.bottomLines.push(line);
      symbol.topLines.push(line);
      this.bottomStart = true;
      symbol.topEnd = true;
      maxX = bottom.x + (bottom.x - symbolTop.x) / 2;
    } else if (origin && origin === 'right' && isLeft) {
      yOffset = Math.max(symbol.topLines.length, this.rightLines.length) * 10;
      line = drawLine$1(
        this.chart,
        right,
        [
          { x: right.x + lineLength / 2, y: right.y },
          { x: right.x + lineLength / 2, y: symbolTop.y - lineLength / 2 - yOffset },
          { x: symbolTop.x, y: symbolTop.y - lineLength / 2 - yOffset },
          { x: symbolTop.x, y: symbolTop.y },
        ],
        text
      );
      this.rightLines.push(line);
      symbol.topLines.push(line);
      this.rightStart = true;
      symbol.topEnd = true;
      maxX = right.x + lineLength / 2;
    } else if (origin && origin === 'right' && isRight) {
      yOffset = Math.max(symbol.topLines.length, this.rightLines.length) * 10;
      line = drawLine$1(
        this.chart,
        right,
        [
          { x: symbolTop.x, y: right.y - yOffset },
          { x: symbolTop.x, y: symbolTop.y - yOffset },
        ],
        text
      );
      this.rightLines.push(line);
      symbol.topLines.push(line);
      this.rightStart = true;
      symbol.topEnd = true;
      maxX = right.x + lineLength / 2;
    } else if (origin && origin === 'bottom' && isOnSameColumn && isUpper) {
      yOffset = Math.max(symbol.topLines.length, this.bottomLines.length) * 10;
      line = drawLine$1(
        this.chart,
        bottom,
        [
          { x: bottom.x, y: bottom.y + lineLength / 2 - yOffset },
          { x: right.x + lineLength / 2, y: bottom.y + lineLength / 2 - yOffset },
          { x: right.x + lineLength / 2, y: symbolTop.y - lineLength / 2 - yOffset },
          { x: symbolTop.x, y: symbolTop.y - lineLength / 2 - yOffset },
          { x: symbolTop.x, y: symbolTop.y },
        ],
        text
      );
      this.bottomLines.push(line);
      symbol.topLines.push(line);
      this.bottomStart = true;
      symbol.topEnd = true;
      maxX = bottom.x + lineLength / 2;
    } else if (origin === 'left' && isOnSameColumn && isUpper) {
      var diffX = left.x - lineLength / 2;
      if (symbolLeft.x < left.x) {
        diffX = symbolLeft.x - lineLength / 2;
      }
      yOffset = Math.max(symbol.topLines.length, this.leftLines.length) * 10;
      line = drawLine$1(
        this.chart,
        left,
        [
          { x: diffX, y: left.y - yOffset },
          { x: diffX, y: symbolTop.y - lineLength / 2 - yOffset },
          { x: symbolTop.x, y: symbolTop.y - lineLength / 2 - yOffset },
          { x: symbolTop.x, y: symbolTop.y },
        ],
        text
      );
      this.leftLines.push(line);
      symbol.topLines.push(line);
      this.leftStart = true;
      symbol.topEnd = true;
      maxX = left.x;
    } else if (origin === 'left') {
      yOffset = Math.max(symbol.topLines.length, this.leftLines.length) * 10;
      line = drawLine$1(
        this.chart,
        left,
        [
          { x: symbolTop.x + (left.x - symbolTop.x) / 2, y: left.y },
          { x: symbolTop.x + (left.x - symbolTop.x) / 2, y: symbolTop.y - lineLength / 2 - yOffset },
          { x: symbolTop.x, y: symbolTop.y - lineLength / 2 - yOffset },
          { x: symbolTop.x, y: symbolTop.y },
        ],
        text
      );
      this.leftLines.push(line);
      symbol.topLines.push(line);
      this.leftStart = true;
      symbol.topEnd = true;
      maxX = left.x;
    } else if (origin === 'top') {
      yOffset = Math.max(symbol.topLines.length, this.topLines.length) * 10;
      line = drawLine$1(
        this.chart,
        top,
        [
          { x: top.x, y: symbolTop.y - lineLength / 2 - yOffset },
          { x: symbolTop.x, y: symbolTop.y - lineLength / 2 - yOffset },
          { x: symbolTop.x, y: symbolTop.y },
        ],
        text
      );
      this.topLines.push(line);
      symbol.topLines.push(line);
      this.topStart = true;
      symbol.topEnd = true;
      maxX = top.x;
    }

    //update line style
    if (this.lineStyle[symbol.key] && line) {
      line.attr(this.lineStyle[symbol.key]);
    }

    if (line) {
      for (var l = 0, llen = this.chart.lines.length; l < llen; l++) {
        var otherLine = this.chart.lines[l];

        var ePath = otherLine.attr('path'),
          lPath = line.attr('path');

        for (var iP = 0, lenP = ePath.length - 1; iP < lenP; iP++) {
          var newPath = [];
          newPath.push(['M', ePath[iP][1], ePath[iP][2]]);
          newPath.push(['L', ePath[iP + 1][1], ePath[iP + 1][2]]);

          var line1_from_x = newPath[0][1];
          var line1_from_y = newPath[0][2];
          var line1_to_x = newPath[1][1];
          var line1_to_y = newPath[1][2];

          for (var lP = 0, lenlP = lPath.length - 1; lP < lenlP; lP++) {
            var newLinePath = [];
            newLinePath.push(['M', lPath[lP][1], lPath[lP][2]]);
            newLinePath.push(['L', lPath[lP + 1][1], lPath[lP + 1][2]]);

            var line2_from_x = newLinePath[0][1];
            var line2_from_y = newLinePath[0][2];
            var line2_to_x = newLinePath[1][1];
            var line2_to_y = newLinePath[1][2];

            var res = checkLineIntersection$1(
              line1_from_x,
              line1_from_y,
              line1_to_x,
              line1_to_y,
              line2_from_x,
              line2_from_y,
              line2_to_x,
              line2_to_y
            );
            if (res.onLine1 && res.onLine2) {
              var newSegment;
              if (line2_from_y === line2_to_y) {
                if (line2_from_x > line2_to_x) {
                  newSegment = ['L', res.x + lineWith * 2, line2_from_y];
                  lPath.splice(lP + 1, 0, newSegment);
                  newSegment = [
                    'C',
                    res.x + lineWith * 2,
                    line2_from_y,
                    res.x,
                    line2_from_y - lineWith * 4,
                    res.x - lineWith * 2,
                    line2_from_y,
                  ];
                  lPath.splice(lP + 2, 0, newSegment);
                  line.attr('path', lPath);
                } else {
                  newSegment = ['L', res.x - lineWith * 2, line2_from_y];
                  lPath.splice(lP + 1, 0, newSegment);
                  newSegment = [
                    'C',
                    res.x - lineWith * 2,
                    line2_from_y,
                    res.x,
                    line2_from_y - lineWith * 4,
                    res.x + lineWith * 2,
                    line2_from_y,
                  ];
                  lPath.splice(lP + 2, 0, newSegment);
                  line.attr('path', lPath);
                }
              } else {
                if (line2_from_y > line2_to_y) {
                  newSegment = ['L', line2_from_x, res.y + lineWith * 2];
                  lPath.splice(lP + 1, 0, newSegment);
                  newSegment = [
                    'C',
                    line2_from_x,
                    res.y + lineWith * 2,
                    line2_from_x + lineWith * 4,
                    res.y,
                    line2_from_x,
                    res.y - lineWith * 2,
                  ];
                  lPath.splice(lP + 2, 0, newSegment);
                  line.attr('path', lPath);
                } else {
                  newSegment = ['L', line2_from_x, res.y - lineWith * 2];
                  lPath.splice(lP + 1, 0, newSegment);
                  newSegment = [
                    'C',
                    line2_from_x,
                    res.y - lineWith * 2,
                    line2_from_x + lineWith * 4,
                    res.y,
                    line2_from_x,
                    res.y + lineWith * 2,
                  ];
                  lPath.splice(lP + 2, 0, newSegment);
                  line.attr('path', lPath);
                }
              }

              lP += 2;
            }
          }
        }
      }

      this.chart.lines.push(line);
      if (this.chart.minXFromSymbols === undefined || this.chart.minXFromSymbols > left.x) {
        this.chart.minXFromSymbols = left.x;
      }
    }

    if (!this.chart.maxXFromLine || (this.chart.maxXFromLine && maxX > this.chart.maxXFromLine)) {
      this.chart.maxXFromLine = maxX;
    }
  };

  Symbol.prototype.initText = function (chart, options) {
    this.text = this.chart.paper.text(0, 0, options.text);
    //Raphael does not support the svg group tag so setting the text node id to the symbol node id plus t
    if (options.key) {
      this.text.node.id = options.key + 't';
    }
    this.text.node.setAttribute('class', this.getAttr('class') + 't');

    this.text.attr({
      'text-anchor': 'start',
      x: this.getAttr('text-margin'),
      fill: this.getAttr('font-color'),
      'font-size': this.getAttr('font-size'),
    });

    var font = this.getAttr('font');
    var fontF = this.getAttr('font-family');
    var fontW = this.getAttr('font-weight');

    if (font) this.text.attr({ font: font });
    if (fontF) this.text.attr({ 'font-family': fontF });
    if (fontW) this.text.attr({ 'font-weight': fontW });

    if (options.link) {
      this.text.attr('href', options.link);
    }

    //ndrqu Add click function with event and options params
    if (options.function) {
      this.text.attr({ cursor: 'pointer' });

      this.text.node.addEventListener(
        'click',
        function (evt) {
          window[options.function](evt, options);
        },
        false
      );
    }

    if (options.target) {
      this.text.attr('target', options.target);
    }

    var maxWidth = this.getAttr('maxWidth');
    if (maxWidth) {
      // using this approach: http://stackoverflow.com/a/3153457/22466
      var words = options.text.split(' ');
      var tempText = '';
      for (var i = 0, ii = words.length; i < ii; i++) {
        var word = words[i];
        this.text.attr('text', tempText + ' ' + word);
        if (this.text.getBBox().width > maxWidth) {
          tempText += '\n' + word;
        } else {
          tempText += ' ' + word;
        }
      }
      this.text.attr('text', tempText.substring(1));
    }

    this.group.push(this.text);
  };

  Symbol.prototype.initSymbol = function (chart, options, calced = {}) {
    this.textMargin = this.getAttr('text-margin');
    const width = calced.width || this.text.getBBox().width + 2 * this.textMargin;
    const height = calced.height || this.text.getBBox().height + 2 * this.textMargin;
    const pathVal = util_excalibur$1.calcPath({
      type: this.symbolType,
      width,
      height,
    });
    const symbol = chart.paper.path(pathVal);

    symbol.attr({
      fill: this.getAttr('fill'),
      stroke: this.getAttr('element-color'),
      'stroke-width': this.getAttr('line-width'),
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
      y: symbol.getBBox().height / 2,
    });

    this.initialize();

    return this.symbol;
  };

  var flowchart_symbol = Symbol;

  var inherits = flowchart_helpers.inherits;

  function Condition(chart, options) {
    options = options || {};
    flowchart_symbol.call(this, chart, options, () => {
      this.yes_direction = 'bottom';
      this.no_direction = 'right';
      this.params = options.params;
      if (options.yes && options.direction_yes && options.no && !options.direction_no) {
        if (options.direction_yes === 'right') {
          this.no_direction = 'bottom';
          this.yes_direction = 'right';
        } else if (options.direction_yes === 'top') {
          this.no_direction = 'right';
          this.yes_direction = 'top';
        } else {
          this.no_direction = 'right';
          this.yes_direction = 'bottom';
        }
      } else if (options.yes && !options.direction_yes && options.no && options.direction_no) {
        if (options.direction_no === 'right') {
          this.yes_direction = 'bottom';
          this.no_direction = 'right';
        } else {
          this.yes_direction = 'right';
          this.no_direction = 'bottom';
        }
      } else if (
        options.yes &&
        options.direction_yes &&
        options.no &&
        options.direction_no &&
        options.direction_no !== options.direction_yes
      ) {
        if (options.direction_yes === 'right') {
          this.no_direction = 'bottom';
          this.yes_direction = 'right';
        } else if (options.direction_yes === 'top') {
          this.no_direction = 'right';
          this.yes_direction = 'top';
        } else {
          this.no_direction = 'right';
          this.yes_direction = 'bottom';
        }
      } else {
        this.yes_direction = 'bottom';
        this.no_direction = 'right';
      }

      this.yes_direction = this.yes_direction || 'bottom';
      this.no_direction = this.no_direction || 'right';

      this.textMargin = this.getAttr('text-margin');

      var width = this.text.getBBox().width + 6 * this.textMargin;
      var height = this.text.getBBox().height + 3 * this.textMargin;

      var startX = width / 4;

      this.text.attr({
        x: startX + this.textMargin / 2,
      });

      this.initSymbol(chart, options, {
        width,
        height,
      });
    });
  }
  inherits(Condition, flowchart_symbol);

  Condition.prototype.render = function () {
    if (this.yes_direction) {
      this[this.yes_direction + '_symbol'] = this.yes_symbol;
    }

    if (this.no_direction) {
      this[this.no_direction + '_symbol'] = this.no_symbol;
    }

    var lineLength = this.getAttr('line-length');

    if (this.bottom_symbol) {
      var bottomPoint = this.getBottom();

      if (!this.bottom_symbol.isPositioned) {
        this.bottom_symbol.shiftY(this.getY() + this.height + lineLength);
        this.bottom_symbol.setX(bottomPoint.x - this.bottom_symbol.width / 2);
        this.bottom_symbol.isPositioned = true;

        this.bottom_symbol.render();
      }
    }

    if (this.right_symbol) {
      var rightPoint = this.getRight();

      if (!this.right_symbol.isPositioned) {
        this.right_symbol.setY(rightPoint.y + this.right_symbol.height / 2);
        this.right_symbol.shiftX(this.group.getBBox().x + this.width + lineLength);

        var self = this;
        (function shift() {
          var hasSymbolUnder = false;
          var symb;
          for (var i = 0, len = self.chart.symbols.length; i < len; i++) {
            symb = self.chart.symbols[i];

            if (!self.params['align-next'] || self.params['align-next'] !== 'no') {
              var diff = Math.abs(symb.getCenter().x - self.right_symbol.getCenter().x);
              if (symb.getCenter().y > self.right_symbol.getCenter().y && diff <= self.right_symbol.width / 2) {
                hasSymbolUnder = true;
                break;
              }
            }
          }

          if (hasSymbolUnder) {
            if (self.right_symbol.symbolType === 'end') return;
            self.right_symbol.setX(symb.getX() + symb.width + lineLength);
            shift();
          }
        })();

        this.right_symbol.isPositioned = true;

        this.right_symbol.render();
      }
    }
  };

  Condition.prototype.renderLines = function () {
    if (this.yes_symbol) {
      this.drawLineTo(this.yes_symbol, this.getAttr('yes-text'), this.yes_direction);
    }

    if (this.no_symbol) {
      this.drawLineTo(this.no_symbol, this.getAttr('no-text'), this.no_direction);
    }
  };

  var flowchart_symbol_condition = Condition;

  var inherits$1 = flowchart_helpers.inherits;

  function Parallel(chart, options) {
    options = options || {};
    flowchart_symbol.call(this, chart, options, () => {
      this.path1_direction = 'bottom';
      this.path2_direction = 'right';
      this.path3_direction = 'top';
      this.params = options.params;
      if (options.direction_next === 'path1' && !options[options.direction_next] && options.next) {
        options[options.direction_next] = options.next;
      }
      if (options.direction_next === 'path2' && !options[options.direction_next] && options.next) {
        options[options.direction_next] = options.next;
      }
      if (options.direction_next === 'path3' && !options[options.direction_next] && options.next) {
        options[options.direction_next] = options.next;
      }

      if (
        options.path1 &&
        options.direction_path1 &&
        options.path2 &&
        !options.direction_path2 &&
        options.path3 &&
        !options.direction_path3
      ) {
        if (options.direction_path1 === 'right') {
          this.path2_direction = 'bottom';
          this.path1_direction = 'right';
          this.path3_direction = 'top';
        } else if (options.direction_path1 === 'top') {
          this.path2_direction = 'right';
          this.path1_direction = 'top';
          this.path3_direction = 'bottom';
        } else if (options.direction_path1 === 'left') {
          this.path2_direction = 'right';
          this.path1_direction = 'left';
          this.path3_direction = 'bottom';
        } else {
          this.path2_direction = 'right';
          this.path1_direction = 'bottom';
          this.path3_direction = 'top';
        }
      } else if (
        options.path1 &&
        !options.direction_path1 &&
        options.path2 &&
        options.direction_path2 &&
        options.path3 &&
        !options.direction_path3
      ) {
        if (options.direction_path2 === 'right') {
          this.path1_direction = 'bottom';
          this.path2_direction = 'right';
          this.path3_direction = 'top';
        } else if (options.direction_path2 === 'left') {
          this.path1_direction = 'bottom';
          this.path2_direction = 'left';
          this.path3_direction = 'right';
        } else {
          this.path1_direction = 'right';
          this.path2_direction = 'bottom';
          this.path3_direction = 'top';
        }
      } else if (
        options.path1 &&
        !options.direction_path1 &&
        options.path2 &&
        !options.direction_path2 &&
        options.path3 &&
        options.direction_path3
      ) {
        if (options.direction_path2 === 'right') {
          this.path1_direction = 'bottom';
          this.path2_direction = 'top';
          this.path3_direction = 'right';
        } else if (options.direction_path2 === 'left') {
          this.path1_direction = 'bottom';
          this.path2_direction = 'right';
          this.path3_direction = 'left';
        } else {
          this.path1_direction = 'right';
          this.path2_direction = 'bottom';
          this.path3_direction = 'top';
        }
      } else {
        this.path1_direction = options.direction_path1;
        this.path2_direction = options.direction_path2;
        this.path3_direction = options.direction_path3;
      }

      this.path1_direction = this.path1_direction || 'bottom';
      this.path2_direction = this.path2_direction || 'right';
      this.path3_direction = this.path3_direction || 'top';

      this.initSymbol(chart, options);
    });
  }
  inherits$1(Parallel, flowchart_symbol);

  Parallel.prototype.render = function () {
    if (this.path1_direction) {
      this[this.path1_direction + '_symbol'] = this.path1_symbol;
    }

    if (this.path2_direction) {
      this[this.path2_direction + '_symbol'] = this.path2_symbol;
    }

    if (this.path3_direction) {
      this[this.path3_direction + '_symbol'] = this.path3_symbol;
    }

    var lineLength = this.getAttr('line-length');

    if (this.bottom_symbol) {
      var bottomPoint = this.getBottom();

      if (!this.bottom_symbol.isPositioned) {
        this.bottom_symbol.shiftY(this.getY() + this.height + lineLength);
        this.bottom_symbol.setX(bottomPoint.x - this.bottom_symbol.width / 2);
        this.bottom_symbol.isPositioned = true;

        this.bottom_symbol.render();
      }
    }

    if (this.top_symbol) {
      var topPoint = this.getTop();

      if (!this.top_symbol.isPositioned) {
        this.top_symbol.shiftY(this.getY() - this.top_symbol.height - lineLength);
        this.top_symbol.setX(topPoint.x + this.top_symbol.width);
        this.top_symbol.isPositioned = true;

        this.top_symbol.render();
      }
    }

    var self = this;

    if (this.left_symbol) {
      var leftPoint = this.getLeft();

      if (!this.left_symbol.isPositioned) {
        this.left_symbol.setY(leftPoint.y - this.left_symbol.height / 2);
        this.left_symbol.shiftX(-(this.group.getBBox().x + this.width + lineLength));
        (function shift() {
          var hasSymbolUnder = false;
          var symb;
          for (var i = 0, len = self.chart.symbols.length; i < len; i++) {
            symb = self.chart.symbols[i];

            if (!self.params['align-next'] || self.params['align-next'] !== 'no') {
              var diff = Math.abs(symb.getCenter().x - self.left_symbol.getCenter().x);
              if (symb.getCenter().y > self.left_symbol.getCenter().y && diff <= self.left_symbol.width / 2) {
                hasSymbolUnder = true;
                break;
              }
            }
          }

          if (hasSymbolUnder) {
            if (self.left_symbol.symbolType === 'end') return;
            self.left_symbol.setX(symb.getX() + symb.width + lineLength);
            shift();
          }
        })();

        this.left_symbol.isPositioned = true;

        this.left_symbol.render();
      }
    }

    if (this.right_symbol) {
      var rightPoint = this.getRight();

      if (!this.right_symbol.isPositioned) {
        this.right_symbol.setY(rightPoint.y + this.right_symbol.height / 2);
        this.right_symbol.shiftX(this.group.getBBox().x + this.width + lineLength);
        (function shift() {
          var hasSymbolUnder = false;
          var symb;
          for (var i = 0, len = self.chart.symbols.length; i < len; i++) {
            symb = self.chart.symbols[i];

            if (!self.params['align-next'] || self.params['align-next'] !== 'no') {
              var diff = Math.abs(symb.getCenter().x - self.right_symbol.getCenter().x);
              if (symb.getCenter().y > self.right_symbol.getCenter().y && diff <= self.right_symbol.width / 2) {
                hasSymbolUnder = true;
                break;
              }
            }
          }

          if (hasSymbolUnder) {
            if (self.right_symbol.symbolType === 'end') return;
            self.right_symbol.setX(symb.getX() + symb.width + lineLength);
            shift();
          }
        })();

        this.right_symbol.isPositioned = true;

        this.right_symbol.render();
      }
    }
  };

  Parallel.prototype.renderLines = function () {
    if (this.path1_symbol) {
      this.drawLineTo(this.path1_symbol, '', this.path1_direction);
    }

    if (this.path2_symbol) {
      this.drawLineTo(this.path2_symbol, '', this.path2_direction);
    }

    if (this.path3_symbol) {
      this.drawLineTo(this.path3_symbol, '', this.path3_direction);
    }
  };

  var flowchart_symbol_parallel = Parallel;

  var defaults = flowchart_helpers.defaults;




  function FlowChart(container, options) {
    options = options || {};

    this.paper = new raphael(container);

    this.options = defaults(options, flowchart_defaults);

    this.symbols = [];
    this.lines = [];
    this.start = null;
  }

  FlowChart.prototype.handle = function (symbol) {
    if (this.symbols.indexOf(symbol) <= -1) {
      this.symbols.push(symbol);
    }

    var flowChart = this;

    if (symbol instanceof flowchart_symbol_condition) {
      symbol.yes = function (nextSymbol) {
        symbol.yes_symbol = nextSymbol;
        if (symbol.no_symbol) {
          symbol.pathOk = true;
        }
        return flowChart.handle(nextSymbol);
      };
      symbol.no = function (nextSymbol) {
        symbol.no_symbol = nextSymbol;
        if (symbol.yes_symbol) {
          symbol.pathOk = true;
        }
        return flowChart.handle(nextSymbol);
      };
    } else if (symbol instanceof flowchart_symbol_parallel) {
      symbol.path1 = function (nextSymbol) {
        symbol.path1_symbol = nextSymbol;
        if (symbol.path2_symbol) {
          symbol.pathOk = true;
        }
        return flowChart.handle(nextSymbol);
      };
      symbol.path2 = function (nextSymbol) {
        symbol.path2_symbol = nextSymbol;
        if (symbol.path3_symbol) {
          symbol.pathOk = true;
        }
        return flowChart.handle(nextSymbol);
      };
      symbol.path3 = function (nextSymbol) {
        symbol.path3_symbol = nextSymbol;
        if (symbol.path1_symbol) {
          symbol.pathOk = true;
        }
        return flowChart.handle(nextSymbol);
      };
    } else {
      symbol.then = function (nextSymbol) {
        symbol.next = nextSymbol;
        symbol.pathOk = true;
        return flowChart.handle(nextSymbol);
      };
    }

    return symbol;
  };

  FlowChart.prototype.startWith = function (symbol) {
    this.start = symbol;
    return this.handle(symbol);
  };

  FlowChart.prototype.render = function () {
    var maxWidth = 0,
      maxHeight = 0,
      i = 0,
      len = 0,
      maxX = 0,
      maxY = 0,
      minX = 0,
      minY = 0,
      symbol,
      line;

    for (i = 0, len = this.symbols.length; i < len; i++) {
      symbol = this.symbols[i];
      if (symbol.width > maxWidth) {
        maxWidth = symbol.width;
      }
      if (symbol.height > maxHeight) {
        maxHeight = symbol.height;
      }
    }

    for (i = 0, len = this.symbols.length; i < len; i++) {
      symbol = this.symbols[i];
      symbol.shiftX(this.options.x + (maxWidth - symbol.width) / 2 + this.options['line-width']);
      symbol.shiftY(this.options.y + (maxHeight - symbol.height) / 2 + this.options['line-width']);
    }

    this.start.render();
    // for (i = 0, len = this.symbols.length; i < len; i++) {
    //   symbol = this.symbols[i];
    //   symbol.render();
    // }

    for (i = 0, len = this.symbols.length; i < len; i++) {
      symbol = this.symbols[i];
      symbol.renderLines();
    }

    maxX = this.maxXFromLine;

    var x;
    var y;

    for (i = 0, len = this.symbols.length; i < len; i++) {
      symbol = this.symbols[i];
      x = symbol.getX() + symbol.width;
      y = symbol.getY() + symbol.height;
      if (x > maxX) {
        maxX = x;
      }
      if (y > maxY) {
        maxY = y;
      }
    }

    for (i = 0, len = this.lines.length; i < len; i++) {
      line = this.lines[i].getBBox();
      x = line.x;
      y = line.y;
      var x2 = line.x2;
      var y2 = line.y2;
      if (x < minX) {
        minX = x;
      }
      if (y < minY) {
        minY = y;
      }
      if (x2 > maxX) {
        maxX = x2;
      }
      if (y2 > maxY) {
        maxY = y2;
      }
    }

    var scale = this.options['scale'];
    var lineWidth = this.options['line-width'];

    if (this.minXFromSymbols < minX) minX = this.minXFromSymbols;

    if (minX < 0) minX -= lineWidth;
    if (minY < 0) minY -= lineWidth;

    var width = maxX + lineWidth - minX;
    var height = maxY + lineWidth - minY;

    this.paper.setSize(width * scale, height * scale);
    this.paper.setViewBox(minX, minY, width, height, true);
  };

  FlowChart.prototype.clean = function () {
    if (this.paper) {
      var paperDom = this.paper.canvas;
      paperDom.parentNode && paperDom.parentNode.removeChild(paperDom);
    }
  };

  var flowchart_chart = FlowChart;

  var inherits$2 = flowchart_helpers.inherits;

  function Start(chart, options) {
    options = options || {};
    options.text = options.text || 'Start';
    flowchart_symbol.call(this, chart, options);
  }
  inherits$2(Start, flowchart_symbol);

  var flowchart_symbol_start = Start;

  var inherits$3 = flowchart_helpers.inherits;

  function End(chart, options) {
    options = options || {};
    options.text = options.text || 'End';
    flowchart_symbol.call(this, chart, options);
  }
  inherits$3(End, flowchart_symbol);

  var flowchart_symbol_end = End;

  var inherits$4 = flowchart_helpers.inherits;

  function Operation(chart, options) {
    options = options || {};
    flowchart_symbol.call(this, chart, options);
  }
  inherits$4(Operation, flowchart_symbol);

  var flowchart_symbol_operation = Operation;

  var inherits$5 = flowchart_helpers.inherits;

  var handScriptPath$1 = flowchart_functions.handScriptPath;

  function InputOutput(chart, options) {
    options = options || {};
    flowchart_symbol.call(this, chart, options, () => {
      this.textMargin = this.getAttr('text-margin');

      this.text.attr({
        x: this.textMargin * 3,
      });

      var width = this.text.getBBox().width + 4 * this.textMargin;
      var height = this.text.getBBox().height + 2 * this.textMargin;
      var startX = this.textMargin;
      var startY = height / 2;

      var points = [
        { x: startX, y: startY },
        { x: startX - this.textMargin, y: height },
        { x: startX - this.textMargin + width, y: height },
        { x: startX - this.textMargin + width + 2 * this.textMargin, y: 0 },
        { x: startX - this.textMargin + 2 * this.textMargin, y: 0 },
        { x: startX, y: startY },
      ];

      var symbol = handScriptPath$1({
        type: this.getAttr('line-style'),
        chart,
        points,
      });

      symbol.attr({
        stroke: this.getAttr('element-color'),
        'stroke-width': this.getAttr('line-width'),
        fill: this.getAttr('fill'),
      });
      if (options.link) {
        symbol.attr('href', options.link);
      }
      if (options.target) {
        symbol.attr('target', options.target);
      }
      if (options.key) {
        symbol.node.id = options.key;
      }
      symbol.node.setAttribute('class', this.getAttr('class'));

      this.text.attr({
        y: symbol.getBBox().height / 2,
      });

      this.group.push(symbol);
      symbol.insertBefore(this.text);

      this.initialize();
    });
  }
  inherits$5(InputOutput, flowchart_symbol);

  InputOutput.prototype.getLeft = function () {
    var y = this.getY() + this.group.getBBox().height / 2;
    var x = this.getX() + this.textMargin;
    return { x: x, y: y };
  };

  InputOutput.prototype.getRight = function () {
    var y = this.getY() + this.group.getBBox().height / 2;
    var x = this.getX() + this.group.getBBox().width - this.textMargin;
    return { x: x, y: y };
  };

  var flowchart_symbol_inputoutput = InputOutput;

  var inherits$6 = flowchart_helpers.inherits;

  function Subroutine(chart, options) {
    options = options || {};
    flowchart_symbol.call(this, chart, options);
  }
  inherits$6(Subroutine, flowchart_symbol);

  var flowchart_symbol_subroutine = Subroutine;

  function parse(input) {
    input = input || '';
    input = input.trim();

    var chart = {
      symbols: {},
      start: null,
      drawSVG: function (container, options) {
        var self = this;

        if (this.diagram) {
          this.diagram.clean();
        }

        var diagram = new flowchart_chart(container, options);
        this.diagram = diagram;
        var dispSymbols = {};

        function getDisplaySymbol(s) {
          if (dispSymbols[s.key]) {
            return dispSymbols[s.key];
          }

          switch (s.symbolType) {
            case 'start':
              dispSymbols[s.key] = new flowchart_symbol_start(diagram, s);
              break;
            case 'end':
              dispSymbols[s.key] = new flowchart_symbol_end(diagram, s);
              break;
            case 'operation':
              dispSymbols[s.key] = new flowchart_symbol_operation(diagram, s);
              break;
            case 'inputoutput':
              dispSymbols[s.key] = new flowchart_symbol_inputoutput(diagram, s);
              break;
            case 'subroutine':
              dispSymbols[s.key] = new flowchart_symbol_subroutine(diagram, s);
              break;
            case 'condition':
              dispSymbols[s.key] = new flowchart_symbol_condition(diagram, s);
              break;
            case 'parallel':
              dispSymbols[s.key] = new flowchart_symbol_parallel(diagram, s);
              break;
            default:
              return new Error('Wrong symbol type!');
          }

          return dispSymbols[s.key];
        }

        (function constructChart(s, prevDisp, prev) {
          var dispSymb = getDisplaySymbol(s);

          if (self.start === s) {
            diagram.startWith(dispSymb);
          } else if (prevDisp && prev && !prevDisp.pathOk) {
            if (prevDisp instanceof flowchart_symbol_condition) {
              if (prev.yes === s) {
                prevDisp.yes(dispSymb);
              }
              if (prev.no === s) {
                prevDisp.no(dispSymb);
              }
            } else if (prevDisp instanceof flowchart_symbol_parallel) {
              if (prev.path1 === s) {
                prevDisp.path1(dispSymb);
              }
              if (prev.path2 === s) {
                prevDisp.path2(dispSymb);
              }
              if (prev.path3 === s) {
                prevDisp.path3(dispSymb);
              }
            } else {
              prevDisp.then(dispSymb);
            }
          }

          if (dispSymb.pathOk) {
            return dispSymb;
          }

          if (dispSymb instanceof flowchart_symbol_condition) {
            if (s.yes) {
              constructChart(s.yes, dispSymb, s);
            }
            if (s.no) {
              constructChart(s.no, dispSymb, s);
            }
          } else if (dispSymb instanceof flowchart_symbol_parallel) {
            if (s.path1) {
              constructChart(s.path1, dispSymb, s);
            }
            if (s.path2) {
              constructChart(s.path2, dispSymb, s);
            }
            if (s.path3) {
              constructChart(s.path3, dispSymb, s);
            }
          } else if (s.next) {
            constructChart(s.next, dispSymb, s);
          }

          return dispSymb;
        })(this.start);

        diagram.render();
      },
      clean: function () {
        this.diagram.clean();
      },
      options: function () {
        return this.diagram.options;
      },
    };

    var lines = [];
    var prevBreak = 0;
    for (var i0 = 1, i0len = input.length; i0 < i0len; i0++) {
      if (input[i0] === '\n' && input[i0 - 1] !== '\\') {
        var line0 = input.substring(prevBreak, i0);
        prevBreak = i0 + 1;
        lines.push(line0.replace(/\\\n/g, '\n'));
      }
    }

    if (prevBreak < input.length) {
      lines.push(input.substr(prevBreak));
    }

    for (var l = 1, len = lines.length; l < len; ) {
      var currentLine = lines[l];

      if (currentLine.indexOf('->') < 0 && currentLine.indexOf('=>') < 0 && currentLine.indexOf('@>') < 0) {
        lines[l - 1] += '\n' + currentLine;
        lines.splice(l, 1);
        len--;
      } else {
        l++;
      }
    }

    function getStyle(s) {
      var startIndex = s.indexOf('(') + 1;
      var endIndex = s.indexOf(')');
      if (startIndex >= 0 && endIndex >= 0) {
        return s.substring(startIndex, endIndex);
      }
      return '{}';
    }

    function getSymbValue(s) {
      var startIndex = s.indexOf('(') + 1;
      var endIndex = s.indexOf(')');
      if (startIndex >= 0 && endIndex >= 0) {
        return s.substring(startIndex, endIndex);
      }
      return '';
    }

    function getSymbol(s) {
      var startIndex = s.indexOf('(') + 1;
      var endIndex = s.indexOf(')');
      if (startIndex >= 0 && endIndex >= 0) {
        return chart.symbols[s.substring(0, startIndex - 1)];
      }
      return chart.symbols[s];
    }

    function getNextPath(s) {
      var next = 'next';
      var startIndex = s.indexOf('(') + 1;
      var endIndex = s.indexOf(')');
      if (startIndex >= 0 && endIndex >= 0) {
        next = flowSymb.substring(startIndex, endIndex);
        if (next.indexOf(',') < 0) {
          if (next !== 'yes' && next !== 'no') {
            next = 'next, ' + next;
          }
        }
      }
      return next;
    }

    while (lines.length > 0) {
      var line = lines.splice(0, 1)[0].trim();

      if (line.indexOf('=>') >= 0) {
        // definition
        var parts = line.split('=>');
        var symbol = {
          key: parts[0].replace(/\(.*\)/, ''),
          symbolType: parts[1],
          text: null,
          link: null,
          target: null,
          flowstate: null,
          function: null,
          lineStyle: {},
          params: {},
        };

        //parse parameters
        var params = parts[0].match(/\((.*)\)/);
        if (params && params.length > 1) {
          var entries = params[1].split(',');
          for (var i = 0; i < entries.length; i++) {
            var entry = entries[i].split('=');
            if (entry.length == 2) {
              symbol.params[entry[0]] = entry[1];
            }
          }
        }

        var sub;

        if (symbol.symbolType.indexOf(': ') >= 0) {
          sub = symbol.symbolType.split(': ');
          symbol.symbolType = sub.shift();
          symbol.text = sub.join(': ');
        }

        if (symbol.text && symbol.text.indexOf(':$') >= 0) {
          sub = symbol.text.split(':$');
          symbol.text = sub.shift();
          symbol.function = sub.join(':$');
        } else if (symbol.symbolType.indexOf(':$') >= 0) {
          sub = symbol.symbolType.split(':$');
          symbol.symbolType = sub.shift();
          symbol.function = sub.join(':$');
        } else if (symbol.text && symbol.text.indexOf(':>') >= 0) {
          sub = symbol.text.split(':>');
          symbol.text = sub.shift();
          symbol.link = sub.join(':>');
        } else if (symbol.symbolType.indexOf(':>') >= 0) {
          sub = symbol.symbolType.split(':>');
          symbol.symbolType = sub.shift();
          symbol.link = sub.join(':>');
        }

        if (symbol.symbolType.indexOf('\n') >= 0) {
          symbol.symbolType = symbol.symbolType.split('\n')[0];
        }

        /* adding support for links */
        if (symbol.link) {
          var startIndex = symbol.link.indexOf('[') + 1;
          var endIndex = symbol.link.indexOf(']');
          if (startIndex >= 0 && endIndex >= 0) {
            symbol.target = symbol.link.substring(startIndex, endIndex);
            symbol.link = symbol.link.substring(0, startIndex - 1);
          }
        }
        /* end of link support */

        /* adding support for flowstates */
        if (symbol.text) {
          if (symbol.text.indexOf('|') >= 0) {
            var txtAndState = symbol.text.split('|');
            symbol.flowstate = txtAndState.pop().trim();
            symbol.text = txtAndState.join('|');
          }
        }
        /* end of flowstate support */

        chart.symbols[symbol.key] = symbol;
      } else if (line.indexOf('->') >= 0) {
        // flow
        var flowSymbols = line.split('->');
        for (var iS = 0, lenS = flowSymbols.length; iS < lenS; iS++) {
          var flowSymb = flowSymbols[iS];
          var symbVal = getSymbValue(flowSymb);

          if (symbVal === 'true' || symbVal === 'false') {
            // map true or false to yes or no respectively
            flowSymb = flowSymb.replace('true', 'yes');
            flowSymb = flowSymb.replace('false', 'no');
          }

          var realSymb = getSymbol(flowSymb);
          var next = getNextPath(flowSymb);

          var direction = null;
          if (next.indexOf(',') >= 0) {
            var condOpt = next.split(',');
            next = condOpt[0];
            direction = condOpt[1].trim();
          }

          if (!chart.start) {
            chart.start = realSymb;
          }

          if (iS + 1 < lenS) {
            var nextSymb = flowSymbols[iS + 1];
            realSymb[next] = getSymbol(nextSymb);
            realSymb['direction_' + next] = direction;
            direction = null;
          }
        }
      } else if (line.indexOf('@>') >= 0) {
        // line style
        var lineStyleSymbols = line.split('@>');
        for (var iSS = 0, lenSS = lineStyleSymbols.length; iSS < lenSS; iSS++) {
          if (iSS + 1 !== lenSS) {
            var curSymb = getSymbol(lineStyleSymbols[iSS]);
            var nextSymbol = getSymbol(lineStyleSymbols[iSS + 1]);

            curSymb['lineStyle'][nextSymbol.key] = JSON.parse(getStyle(lineStyleSymbols[iSS + 1]));
          }
        }
      }
    }
    return chart;
  }

  var flowchart_parse = parse;

  if (typeof jQuery != 'undefined') {
  	var parse$1 = flowchart_parse;

  	(function( $ ) {
  		function paramFit(needle, haystack) {
  			return needle == haystack ||
  			( Array.isArray(haystack) && (haystack.includes(needle) || haystack.includes(Number(needle)) ))
  		}
  		var methods = {
  			init : function(options) {
  				return this.each(function() {
  					var $this = $(this);
  					this.chart = parse$1($this.text());
  					$this.html('');
  					this.chart.drawSVG(this, options);
  				});
  			},
  			setFlowStateByParam : function(param, paramValue, newFlowState) {
  				return this.each(function() {
  					var chart = this.chart;

  					// @todo this should be part of Symbol API
  					var nextSymbolKeys = ['next', 'yes', 'no', 'path1', 'path2', 'path3'];

  					for (var property in chart.symbols) {
  						if (chart.symbols.hasOwnProperty(property)) {
  							var symbol = chart.symbols[property];
  							var val = symbol.params[param];
  							if (paramFit(val, paramValue)) {
  								symbol.flowstate = newFlowState;
  								for (var nski = 0; nski < nextSymbolKeys.length; nski++) {
  									var nextSymbolKey = nextSymbolKeys[nski];
  									if (
  										symbol[nextSymbolKey] &&
  										symbol[nextSymbolKey]['params'] &&
  										symbol[nextSymbolKey]['params'][param] &&
  										paramFit(symbol[nextSymbolKey]['params'][param], paramValue)
  									) {
  										symbol.lineStyle[symbol[nextSymbolKey]['key']] = {stroke: chart.options()['flowstate'][newFlowState]['fill']};
  									}
  								}
  							}
  						}
  					}

  					chart.clean();
  					chart.drawSVG(this);
  				});

  			},
  			clearFlowState: function () {
  				return this.each(function() {
  					var chart = this.chart;

  					for (var property in chart.symbols) {
  						if (chart.symbols.hasOwnProperty(property)) {
  							var node = chart.symbols[property];
  							node.flowstate = '';
  						}
  					}

  					chart.clean();
  					chart.drawSVG(this);
  				});
  			}
  		};

  		$.fn.flowChart = function(methodOrOptions) {
  			if ( methods[methodOrOptions] ) {
  				return methods[ methodOrOptions ].apply( this, Array.prototype.slice.call( arguments, 1 ));
  			} else if ( typeof methodOrOptions === 'object' || ! methodOrOptions ) {
  				// Default to "init"
  				return methods.init.apply( this, arguments );
  			} else {
  				$.error( 'Method ' +  methodOrOptions + ' does not exist on jQuery.flowChart' );
  			}
  		};

  	})(jQuery); // eslint-disable-line
  }

  var FlowChart$1 = {
  	parse: flowchart_parse
  };

  if (typeof window !== 'undefined') {
  	window.flowchart = FlowChart$1;
  }

  var flowchart_js = FlowChart$1;

  return flowchart_js;

})));
