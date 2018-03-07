/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _array = __webpack_require__(1);

var _array2 = _interopRequireDefault(_array);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Sentence = function () {
  function Sentence(value) {
    _classCallCheck(this, Sentence);

    this.value = value;
    this.parent = null;
    this.children = [];
  }

  _createClass(Sentence, [{
    key: 'setParent',
    value: function setParent(parent) {
      if (this.parent === parent) {
        return;
      }

      if (this.parent) {
        var children = this.parent.children;
        children.remove(this);
      }

      this.parent = parent;

      if (this.parent) {
        this.parent.children.push(this);
      }
    }
  }, {
    key: 'addChild',
    value: function addChild(child) {
      child.setParent(this);
    }
  }, {
    key: 'removeChild',
    value: function removeChild(child) {
      if (this.children.includes(child)) child.setParent(null);
    }
  }, {
    key: 'atomic',
    value: function atomic() {
      var booleans = Object.keys(this.constructor.booleans);
      return this.children.length === 0 && booleans.includes(this.value);
    }
  }, {
    key: 'wff',
    value: function wff() {
      var connectives = Object.keys(this.constructor.connectives);
      if (!this.atomic() && !connectives.includes(this.value)) {
        return false;
      } else if (this.atomic()) {
        return true;
      } else if (this.value === 'N' && this.children.length === 1 && this.children[0].wff()) {
        return true;
      } else if (this.constructor.binaryConns.includes(this.value) && this.children.length === 2 && this.children[0].wff() && this.children[1].wff()) {
        return true;
      }

      return false;
    }
  }, {
    key: 'truthValue',
    value: function truthValue() {
      if (!this.wff()) {
        return null;
      } else if (this.atomic()) {
        return this.constructor.booleans[this.value];
      } else {
        var childOne = this.children[0].truthValue();
        var childTwo = void 0;
        if (this.children[1]) childTwo = this.children[1].truthValue();
        var connective = this.constructor.connectives[this.value];
        return connective(childOne, childTwo);
      }
    }
  }]);

  return Sentence;
}();

Sentence.testArrayOfStrings = function (array) {
  var parsed = array.map(function (str) {
    return [str, Sentence.parse(str.split(''))];
  });
  for (var i = 0; i < parsed.length; i++) {
    if (!parsed[i][1]) {
      return parsed[i][0];
    } else if (!parsed[i][1].truthValue()) {
      return parsed[i][0];
    }
  }
  return true;
};

Sentence.parse = function (array, ignoreIfs) {
  var _this = this;

  var translation = array.map(function (el) {
    return _this.dictionary[el];
  });
  var mainConnectiveIdx = translation.mainConnectiveIdx();
  if (!ignoreIfs && translation[0] === 'I' && translation[mainConnectiveIdx] !== 'T') {
    return;
  } else if (translation[0] === 'I' || ignoreIfs) {
    var purgedTranslation = translation.filter(function (el) {
      var elTranslation = _this.dictionary[el];
      if (elTranslation !== 'I') {
        return elTranslation;
      }
    });
    translation = purgedTranslation;
    mainConnectiveIdx = translation.mainConnectiveIdx();
  }

  var mainConnective = void 0;
  if (mainConnectiveIdx) {
    mainConnective = translation[mainConnectiveIdx];
  }
  var booleans = Object.keys(this.booleans);

  if (translation.length === 1 && booleans.includes(translation[0])) {
    return new Sentence(translation[0]);
  } else if (translation[0] === '(' && translation.length > 3 && translation.matchingClosingParensIdx(0) === translation.length - 1) {
    if (translation[1] === '(' && translation.matchingClosingParensIdx(1) === translation.length - 2) {
      return;
    } else {
      return this.parse(translation.slice(1, translation.length - 1));
    }
  } else if (mainConnectiveIdx === 0) {
    var prejacent = this.parse(translation.slice(1));
    var connective = new Sentence(translation[mainConnectiveIdx]);
    if (prejacent) {
      connective.addChild(prejacent);
      return connective;
    }
  } else if (mainConnectiveIdx) {
    var firstConjunct = this.parse(translation.slice(0, mainConnectiveIdx));
    var secondConjunct = this.parse(translation.slice(mainConnectiveIdx + 1));
    if (firstConjunct && secondConjunct) {
      var _connective = new Sentence(mainConnective);
      if (mainConnective) {
        _connective.addChild(firstConjunct);
        _connective.addChild(secondConjunct);
        return _connective;
      }
    }
  }
};

Sentence.dictionary = {
  // booleans
  t: 't',
  f: 'f',
  // connectives
  N: 'N',
  A: 'A',
  O: 'O',
  I: 'I',
  T: 'T',
  B: 'B',
  X: 'X',
  "it's false that": 'N',
  and: 'A',
  or: 'O',
  if: 'I',
  then: 'T',
  'if and only if': 'B',
  xor: 'X',
  // parentheses
  '(': '(',
  ')': ')',
  // English truths
  'snow is white': 't',
  'grass is green': 't',
  'humans landed on the Moon': 't',
  'humans have been to space': 't',
  'birds lay eggs': 't',
  'cats eat meat': 't',
  'fish can swim': 't',
  'lava is hot': 't',
  'humans are mammals': 't',
  'the T-rex is extinct': 't',
  'there is gravity on Mars': 't',
  'bananas are yellow': 't',
  'glass is brittle': 't',
  'apples have seeds': 't',
  'pears have seeds': 't',
  'Korea is in Asia': 't',
  'Japan is in Asia': 't',
  'Singapore is in Asia': 't',
  'Malaysia is in Asia': 't',
  'Canada is north of Mexico': 't',
  'Kenya is in Africa': 't',
  'Germany is in Europe': 't',
  'France is in Europe': 't',
  'Italy is in Europe': 't',
  'Mars is red': 't',
  'Saturn is a planet': 't',
  'the Sun is a star': 't',
  'the Milky Way is a galaxy': 't',
  // English falsehoods
  'the Earth is flat': 'f',
  'cats can fly': 'f',
  'rabbits can fly': 'f',
  'dogs can fly': 'f',
  'cows eat meat': 'f',
  'unicorns are real': 'f',
  'dragons are real': 'f',
  'ice is liquid': 'f',
  'humans are reptiles': 'f',
  'Jupiter is made of rocks': 'f',
  'Germany is in Asia': 'f',
  'France is in Asia': 'f',
  'Italy is in Asia': 'f',
  'bananas are blue': 'f',
  'Korea is in Europe': 'f',
  'Japan is in Europe': 'f',
  'Singapore is in Europe': 'f',
  'Malaysia is in Europe': 'f',
  'Mexico is north of Canada': 'f',
  'Kenya is in America': 'f',
  'cows lay eggs': 'f',
  'ice is hot': 'f',
  'lava is cold': 'f',
  'apples are vegetables': 'f',
  'humans landed on Venus': 'f',
  'humans landed on Mars': 'f',
  'Mars has rings': 'f',
  'the Moon is a planet': 'f',
  'the Sun is a planet': 'f',
  'the Milky Way is on Earth': 'f'
};

Sentence.symbolDictionary = {
  t: 'true',
  f: 'false',
  A: '&and;',
  O: '&or;',
  N: '&not;',
  I: 'NULL',
  T: '&rarr;',
  B: '&equiv;',
  X: '&#8891;',
  '(': '(',
  ')': ')'
};

Sentence.generateSentenceItems = function (array) {
  var _this2 = this;

  var booleans = Object.keys(this.booleans);
  var connectives = Object.keys(this.connectives);
  var parens = ['(', ')'];
  var englishConnectives = {
    N: "it's false that",
    O: 'or',
    A: 'and',
    I: 'if',
    T: 'then',
    B: 'if and only if',
    X: 'xor'
  };

  var truths = [];
  Object.keys(this.dictionary).forEach(function (el) {
    if (el !== 't' && _this2.dictionary[el] === 't') truths.push(el);
  });
  truths.shuffle();

  var falsehoods = [];
  Object.keys(this.dictionary).forEach(function (el) {
    if (el !== 'f' && _this2.dictionary[el] === 'f') falsehoods.push(el);
  });
  falsehoods.shuffle();

  var sentenceItems = array.map(function (el) {
    if (parens.includes(el)) {
      return el;
    } else if (connectives.includes(el)) {
      return englishConnectives[el];
    } else if (el === 't') {
      return truths.pop();
    } else if (el === 'f') {
      return falsehoods.pop();
    }
  });

  while (true) {
    var sentenceItemsParsed = this.parse(sentenceItems);
    if (!sentenceItemsParsed) {
      return sentenceItems.map(function (el, idx) {
        return {
          id: idx,
          text: el
        };
      });
    } else if (!sentenceItemsParsed.truthValue()) {
      return sentenceItems.map(function (el, idx) {
        return {
          id: idx,
          text: el
        };
      });
    } else {
      sentenceItems = sentenceItems.shuffle();
    }
  }
};

Sentence.booleans = {
  t: true,
  f: false
};

Sentence.binaryConns = ['A', 'O', 'T', 'B', 'X'];

Sentence.connectives = {
  A: function A(sentOne, sentTwo) {
    return sentOne && sentTwo;
  },
  O: function O(sentOne, sentTwo) {
    return sentOne || sentTwo;
  },
  T: function T(sentOne, sentTwo) {
    return !sentOne || sentTwo;
  },
  B: function B(sentOne, sentTwo) {
    return (!sentOne || sentTwo) && (!sentTwo || sentOne);
  },
  X: function X(sentOne, sentTwo) {
    return !sentOne && sentTwo || sentOne && !sentTwo;
  },
  I: function I() {},
  N: function N(sentence) {
    return !sentence;
  }
};

// util functions for handling arrays:

Sentence.remove = function (sentArr, el) {
  var idx = sentArr.indexOf(el);
  if (idx !== -1) sentArr.splice(idx, 1);
};

Sentence.mainConnectiveIdx = function (sentArr) {
  var booleans = Object.keys(Sentence.booleans);
  var binaryConns = Sentence.binaryConns;
  if (sentArr.length === 1) {
    return;
  } else if (sentArr[0] === 'I') {
    var thenIdx = sentArr.slice(1).mainConnectiveIdx();
    if (sentArr[thenIdx + 1] === 'T') {
      return thenIdx + 1;
    } else {
      return;
    }
  } else if (sentArr[0] === '(' && sentArr.matchingClosingParensIdx(0) === sentArr.length - 1) {
    if (sentArr[1] === '(' && sentArr.matchingClosingParensIdx(1) === sentArr.length - 2) {
      return;
    } else {
      return sentArr.slice(1, sentArr.length - 1).mainConnectiveIdx() + 1;
    }
  } else if (sentArr.length === 2 && sentArr[0] === 'N' && booleans.includes(sentArr[1])) {
    return 0;
  } else if (sentArr[0] === 'N' && sentArr[1] === '(' && sentArr.matchingClosingParensIdx(1) === sentArr.length - 1) {
    return 0;
  } else if (sentArr[0] === 'N' && sentArr[1] === 'N' && sentArr.slice(1).mainConnectiveIdx() === 0) {
    return 0;
  } else if (sentArr[0] === 'N' && sentArr.slice(1).mainConnectiveIdx()) {
    return sentArr.slice(1).mainConnectiveIdx() + 1;
  } else if (sentArr.length === 3 && booleans.includes(sentArr[0]) && binaryConns.includes(sentArr[1]) && booleans.includes(sentArr[2])) {
    return 1;
  } else if (sentArr.length === 3 && booleans.includes(sentArr[0]) && binaryConns.includes(sentArr[1]) && booleans.includes(sentArr[2])) {
    return 1;
  } else if (booleans.includes(sentArr[0]) && binaryConns.includes(sentArr[1]) && sentArr[2] === '(' && sentArr.matchingClosingParensIdx(2) === sentArr.length - 1) {
    return 1;
  } else if (booleans.includes(sentArr[0]) && binaryConns.includes(sentArr[1]) && sentArr[2] === 'N') {
    return 1;
  } else if (booleans.includes(sentArr[0]) && binaryConns.includes(sentArr[1]) && sentArr[sentArr.slice(2).mainConnectiveIdx() + 2] === sentArr[1]) {
    return 1;
  } else if (sentArr[0] === '(') {
    var matchingClosingParensIdx = sentArr.matchingClosingParensIdx(0);
    if (!matchingClosingParensIdx) {
      return undefined;
    } else if (binaryConns.includes(sentArr[matchingClosingParensIdx + 1]) && booleans.includes(sentArr[matchingClosingParensIdx + 2]) && sentArr.length === matchingClosingParensIdx + 3) {
      return matchingClosingParensIdx + 1;
    } else if (binaryConns.includes(sentArr[matchingClosingParensIdx + 1]) && sentArr[matchingClosingParensIdx + 2] === 'N') {
      return matchingClosingParensIdx + 1;
    } else if (binaryConns.includes(sentArr[matchingClosingParensIdx + 1]) && sentArr[matchingClosingParensIdx + 2] === '(' && sentArr.matchingClosingParensIdx(matchingClosingParensIdx + 2) === sentArr.length - 1) {
      return matchingClosingParensIdx + 1;
    } else {
      var secondMainConnIdx = sentArr.slice(matchingClosingParensIdx + 2).mainConnectiveIdx() + matchingClosingParensIdx + 2;
      if (sentArr[secondMainConnIdx] === sentArr[matchingClosingParensIdx + 1]) {
        return matchingClosingParensIdx + 1;
      }
    }
  }
};

Sentence.noAdjacentAtomics = function (sentArr) {
  var booleans = Object.keys(Sentence.booleans);
  for (var i = 0; i < sentArr.length - 1; i++) {
    if (booleans.includes(sentArr[i]) && booleans.includes(sentArr[i + 1])) {
      return false;
    }
  }
  return true;
};

Sentence.validParens = function (sentArr) {
  if (sentArr.includes('(')) {
    var openingParensIdx = sentArr.findOpeningParens(0);
    var closingParensIdx = sentArr.matchingClosingParensIdx(openingParensIdx);
    if (closingParensIdx) {
      var dup = sentArr.slice();
      dup.splice(closingParensIdx, 1);
      dup.splice(openingParensIdx, 1);
      return dup.validParens();
    } else {
      return false;
    }
  } else if (sentArr.includes(')')) {
    return false;
  } else {
    return true;
  }
};

Sentence.findOpeningParens = function (sentArr, idx) {
  for (var i = idx; i < sentArr.length; i++) {
    if (sentArr[i] === '(') return i;
  }
};

Sentence.matchingClosingParensIdx = function (sentArr, idx) {
  var openCount = 0;
  for (var i = idx + 1; i < sentArr.length; i++) {
    if (sentArr[i] === '(') {
      openCount++;
    } else if (sentArr[i] === ')' && openCount > 0) {
      openCount--;
    } else if (sentArr[i] === ')' && openCount === 0) {
      return i;
    }
  }
};

Sentence.shuffle = function (sentArr) {
  return sentArr.sort(function () {
    return Math.random() - 0.5;
  });
};

Sentence.equals = function (sentArr, array) {
  for (var i = 0; i < sentArr.length; i++) {
    if (sentArr[i] !== array[i]) {
      return false;
    }
  }
  return true;
};

exports.default = Sentence;

/***/ }),
/* 1 */
/***/ (function(module, exports) {

throw new Error("Module build failed: Error: ENOENT: no such file or directory, open '/Users/appacademy/Desktop/logic.js/lib/array.js'");

/***/ })
/******/ ]);
//# sourceMappingURL=index.js.map