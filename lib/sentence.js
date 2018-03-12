class Sentence {
  constructor(value) {
    this.value = value;
    this.parent = null;
    this.children = [];
  }

  setParent(parent) {
    if (this.parent === parent) {
      return;
    }

    if (this.parent) {
      const children = this.parent.children;
      children.remove(this);
    }

    this.parent = parent;

    if (this.parent) {
      this.parent.children.push(this);
    }
  }

  addChild(child) {
    child.setParent(this);
  }

  removeChild(child) {
    if (this.children.includes(child)) child.setParent(null);
  }

  atomic() {
    return this.children.length === 0 && Sentence.isAtomic(this.value);
  }

  wff() {
    const connectives = Object.keys(this.constructor.connectives);
    if (!this.atomic() && !connectives.includes(this.value)) {
      return false;
    } else if (this.atomic()) {
      return true;
    } else if (
      this.value === 'N' &&
      this.children.length === 1 &&
      this.children[0].wff()
    ) {
      return true;
    } else if (
      this.constructor.binaryConns.includes(this.value) &&
      this.children.length === 2 &&
      this.children[0].wff() &&
      this.children[1].wff()
    ) {
      return true;
    }

    return false;
  }

  truthValue(model) {
    const fullModel = Object.assign({}, model || {}, this.constructor.booleans);
    if (!this.wff()) {
      return;
    } else if (this.atomic()) {
      return fullModel[this.value];
    } else {
      const childOne = this.children[0].truthValue(model);
      let childTwo;
      if (this.children[1]) childTwo = this.children[1].truthValue(model);
      const connective = this.constructor.connectives[this.value];
      return connective(childOne, childTwo);
    }
  }
}

Sentence.evaluate = function(array, model) {
  const parsed = Sentence.parse(array);
  return parsed.truthValue(model);
};

Sentence.atomics = function(array) {
  array = this.ensureIsArray(array);
  const atomics = [];
  array.forEach(el => {
    if (this.isAtomic(el) && !atomics.includes(el)) {
      atomics.push(el);
    }
  });
  return atomics;
};

Sentence.subsets = function(array) {
  if (array.length === 0) {
    return [[]];
  }
};

Sentence.testArrayOfStrings = function(array) {
  const parsed = array.map(str => {
    return [str, this.parse(str.split(''))];
  });
  for (let i = 0; i < parsed.length; i++) {
    if (!parsed[i][1]) {
      return parsed[i][0];
    } else if (!parsed[i][1].truthValue()) {
      return parsed[i][0];
    }
  }
  return true;
};

Sentence.parse = function(array, ignoreIfs = true) {
  array = Sentence.ensureIsArray(array);
  let translation = array.map(el => this.dictionary[el] || el);
  let mainConnectiveIdx = this.mainConnectiveIdx(translation);
  if (
    !ignoreIfs &&
    translation[0] === 'I' &&
    translation[mainConnectiveIdx] !== 'T'
  ) {
    return;
  } else if (translation[0] === 'I' || ignoreIfs) {
    const purgedTranslation = translation.filter(el => {
      const elTranslation = this.dictionary[el] || el;
      if (elTranslation !== 'I') {
        return elTranslation;
      }
    });
    translation = purgedTranslation;
    mainConnectiveIdx = this.mainConnectiveIdx(translation);
  }

  let mainConnective;
  if (mainConnectiveIdx) {
    mainConnective = translation[mainConnectiveIdx];
  }
  if (translation.length === 1 && Sentence.isAtomic(translation[0])) {
    return new Sentence(translation[0]);
  } else if (
    translation[0] === '(' &&
    translation.length > 3 &&
    this.matchingClosingParensIdx(translation, 0) === translation.length - 1
  ) {
    if (
      translation[1] === '(' &&
      this.matchingClosingParensIdx(translation, 1) === translation.length - 2
    ) {
      return;
    } else {
      return this.parse(translation.slice(1, translation.length - 1));
    }
  } else if (mainConnectiveIdx === 0) {
    const prejacent = this.parse(translation.slice(1));
    const connective = new Sentence(translation[mainConnectiveIdx]);
    if (prejacent) {
      connective.addChild(prejacent);
      return connective;
    }
  } else if (mainConnectiveIdx) {
    const firstConjunct = this.parse(translation.slice(0, mainConnectiveIdx));
    const secondConjunct = this.parse(translation.slice(mainConnectiveIdx + 1));
    if (firstConjunct && secondConjunct) {
      const connective = new Sentence(mainConnective);
      if (mainConnective) {
        connective.addChild(firstConjunct);
        connective.addChild(secondConjunct);
        return connective;
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
  '(': '(',
  ')': ')',
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
  ')': ')',
};

Sentence.isAtomic = function(str) {
  if (['t', 'f'].includes(str) || !isNaN(parseInt(str))) {
    return true;
  } else {
    return false;
  }
};

Sentence.booleans = {
  t: true,
  f: false,
};

Sentence.binaryConns = ['A', 'O', 'T', 'B', 'X'];

Sentence.connectives = {
  A: (sentOne, sentTwo) => sentOne && sentTwo,
  O: (sentOne, sentTwo) => sentOne || sentTwo,
  T: (sentOne, sentTwo) => !sentOne || sentTwo,
  B: (sentOne, sentTwo) => (!sentOne || sentTwo) && (!sentTwo || sentOne),
  X: (sentOne, sentTwo) => (!sentOne && sentTwo) || (sentOne && !sentTwo),
  I: () => {},
  N: sentence => !sentence,
};

// util functions for handling arrays:

Sentence.remove = function(sentArr, el) {
  const idx = sentArr.indexOf(el);
  if (idx !== -1) sentArr.splice(idx, 1);
};

Sentence.mainConnectiveIdx = function(sentArr) {
  const binaryConns = Sentence.binaryConns;
  if (sentArr.length === 1) {
    return;
  } else if (sentArr[0] === 'I') {
    const thenIdx = this.mainConnectiveIdx(sentArr.slice(1));
    if (sentArr[thenIdx + 1] === 'T') {
      return thenIdx + 1;
    } else {
      return;
    }
  } else if (
    sentArr[0] === '(' &&
    this.matchingClosingParensIdx(sentArr, 0) === sentArr.length - 1
  ) {
    if (
      sentArr[1] === '(' &&
      this.matchingClosingParensIdx(sentArr, 1) === sentArr.length - 2
    ) {
      return;
    } else {
      return this.mainConnectiveIdx(sentArr.slice(1, sentArr.length - 1)) + 1;
    }
  } else if (
    sentArr.length === 2 &&
    sentArr[0] === 'N' &&
    Sentence.isAtomic(sentArr[1])
  ) {
    return 0;
  } else if (
    sentArr[0] === 'N' &&
    sentArr[1] === '(' &&
    this.matchingClosingParensIdx(sentArr, 1) === sentArr.length - 1
  ) {
    return 0;
  } else if (
    sentArr[0] === 'N' &&
    sentArr[1] === 'N' &&
    this.mainConnectiveIdx(sentArr.slice(1)) === 0
  ) {
    return 0;
  } else if (sentArr[0] === 'N' && this.mainConnectiveIdx(sentArr.slice(1))) {
    return this.mainConnectiveIdx(sentArr.slice(1)) + 1;
  } else if (
    sentArr.length === 3 &&
    Sentence.isAtomic(sentArr[0]) &&
    binaryConns.includes(sentArr[1]) &&
    Sentence.isAtomic(sentArr[2])
  ) {
    return 1;
  } else if (
    sentArr.length === 3 &&
    Sentence.isAtomic(sentArr[0]) &&
    binaryConns.includes(sentArr[1]) &&
    Sentence.isAtomic(sentArr[2])
  ) {
    return 1;
  } else if (
    Sentence.isAtomic(sentArr[0]) &&
    binaryConns.includes(sentArr[1]) &&
    sentArr[2] === '(' &&
    this.matchingClosingParensIdx(sentArr, 2) === sentArr.length - 1
  ) {
    return 1;
  } else if (
    Sentence.isAtomic(sentArr[0]) &&
    binaryConns.includes(sentArr[1]) &&
    sentArr[2] === 'N'
  ) {
    return 1;
  } else if (
    Sentence.isAtomic(sentArr[0]) &&
    binaryConns.includes(sentArr[1]) &&
    sentArr[this.mainConnectiveIdx(sentArr.slice(2)) + 2] === sentArr[1]
  ) {
    return 1;
  } else if (sentArr[0] === '(') {
    const matchingClosingParensIdx = this.matchingClosingParensIdx(sentArr, 0);
    if (!matchingClosingParensIdx) {
      return undefined;
    } else if (
      binaryConns.includes(sentArr[matchingClosingParensIdx + 1]) &&
      Sentence.isAtomic(sentArr[matchingClosingParensIdx + 2]) &&
      sentArr.length === matchingClosingParensIdx + 3
    ) {
      return matchingClosingParensIdx + 1;
    } else if (
      binaryConns.includes(sentArr[matchingClosingParensIdx + 1]) &&
      sentArr[matchingClosingParensIdx + 2] === 'N'
    ) {
      return matchingClosingParensIdx + 1;
    } else if (
      binaryConns.includes(sentArr[matchingClosingParensIdx + 1]) &&
      sentArr[matchingClosingParensIdx + 2] === '(' &&
      this.matchingClosingParensIdx(sentArr, matchingClosingParensIdx + 2) ===
        sentArr.length - 1
    ) {
      return matchingClosingParensIdx + 1;
    } else {
      const secondMainConnIdx =
        sentArr.slice(matchingClosingParensIdx + 2).mainConnectiveIdx() +
        matchingClosingParensIdx +
        2;
      if (
        sentArr[secondMainConnIdx] === sentArr[matchingClosingParensIdx + 1]
      ) {
        return matchingClosingParensIdx + 1;
      }
    }
  }
};

Sentence.noAdjacentAtomics = function(sentArr) {
  for (let i = 0; i < sentArr.length - 1; i++) {
    if (Sentence.isAtomic(sentArr[i]) && Sentence.isAtomic(sentArr[i + 1])) {
      return false;
    }
  }
  return true;
};

Sentence.validParens = function(sentArr) {
  if (sentArr.includes('(')) {
    const openingParensIdx = this.findOpeningParens(sentArr, 0);
    const closingParensIdx = this.matchingClosingParensIdx(
      sentArr,
      openingParensIdx
    );
    if (closingParensIdx) {
      const dup = sentArr.slice();
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

Sentence.findOpeningParens = function(sentArr, idx) {
  for (let i = idx; i < sentArr.length; i++) {
    if (sentArr[i] === '(') return i;
  }
};

Sentence.matchingClosingParensIdx = function(sentArr, idx) {
  let openCount = 0;
  for (let i = idx + 1; i < sentArr.length; i++) {
    if (sentArr[i] === '(') {
      openCount++;
    } else if (sentArr[i] === ')' && openCount > 0) {
      openCount--;
    } else if (sentArr[i] === ')' && openCount === 0) {
      return i;
    }
  }
};

Sentence.shuffle = function(sentArr) {
  return sentArr.sort(() => Math.random() - 0.5);
};

Sentence.equals = function(sentArr, array) {
  for (let i = 0; i < sentArr.length; i++) {
    if (sentArr[i] !== array[i]) {
      return false;
    }
  }
  return true;
};

Sentence.parseString = function(str) {
  const parsed = [];
  for (let i = 0; i < str.length; i++) {
    const translation = this.dictionary[str[i]];
    if (translation) {
      parsed.push(translation);
    } else {
      let subStr = '';
      for (let j = i; j < str.length && !this.dictionary[str[j]]; j++) {
        subStr += str[j];
        i = j;
      }
      if (this.isAtomic(subStr)) {
        parsed.push(subStr);
      } else {
        return;
      }
    }
  }
  return parsed;
};

Sentence.ensureIsArray = function(array) {
  if (typeof array === 'string') {
    array = this.parseString(array);
  } else if (!(array instanceof Array)) {
    return;
  }
  return array;
};
