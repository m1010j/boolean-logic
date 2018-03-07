import Array from './array';

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
    const booleans = Object.keys(this.constructor.booleans);
    return this.children.length === 0 && booleans.includes(this.value);
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

  truthValue() {
    if (!this.wff()) {
      return null;
    } else if (this.atomic()) {
      return this.constructor.booleans[this.value];
    } else {
      const childOne = this.children[0].truthValue();
      let childTwo;
      if (this.children[1]) childTwo = this.children[1].truthValue();
      const connective = this.constructor.connectives[this.value];
      return connective(childOne, childTwo);
    }
  }
}

Sentence.testArrayOfStrings = function(array) {
  const parsed = array.map(str => {
    return [str, Sentence.parse(str.split(''))];
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

Sentence.parse = function(array, ignoreIfs) {
  let translation = array.map(el => this.dictionary[el]);
  let mainConnectiveIdx = translation.mainConnectiveIdx();
  if (
    !ignoreIfs &&
    translation[0] === 'I' &&
    translation[mainConnectiveIdx] !== 'T'
  ) {
    return;
  } else if (translation[0] === 'I' || ignoreIfs) {
    const purgedTranslation = translation.filter(el => {
      const elTranslation = this.dictionary[el];
      if (elTranslation !== 'I') {
        return elTranslation;
      }
    });
    translation = purgedTranslation;
    mainConnectiveIdx = translation.mainConnectiveIdx();
  }

  let mainConnective;
  if (mainConnectiveIdx) {
    mainConnective = translation[mainConnectiveIdx];
  }
  const booleans = Object.keys(this.booleans);

  if (translation.length === 1 && booleans.includes(translation[0])) {
    return new Sentence(translation[0]);
  } else if (
    translation[0] === '(' &&
    translation.length > 3 &&
    translation.matchingClosingParensIdx(0) === translation.length - 1
  ) {
    if (
      translation[1] === '(' &&
      translation.matchingClosingParensIdx(1) === translation.length - 2
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
  'the Milky Way is on Earth': 'f',
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

Sentence.generateSentenceItems = function(array) {
  const booleans = Object.keys(this.booleans);
  const connectives = Object.keys(this.connectives);
  const parens = ['(', ')'];
  const englishConnectives = {
    N: "it's false that",
    O: 'or',
    A: 'and',
    I: 'if',
    T: 'then',
    B: 'if and only if',
    X: 'xor',
  };

  let truths = [];
  Object.keys(this.dictionary).forEach(el => {
    if (el !== 't' && this.dictionary[el] === 't') truths.push(el);
  });
  truths.shuffle();

  let falsehoods = [];
  Object.keys(this.dictionary).forEach(el => {
    if (el !== 'f' && this.dictionary[el] === 'f') falsehoods.push(el);
  });
  falsehoods.shuffle();

  let sentenceItems = array.map(el => {
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
    let sentenceItemsParsed = this.parse(sentenceItems);
    if (!sentenceItemsParsed) {
      return sentenceItems.map((el, idx) => {
        return {
          id: idx,
          text: el,
        };
      });
    } else if (!sentenceItemsParsed.truthValue()) {
      return sentenceItems.map((el, idx) => {
        return {
          id: idx,
          text: el,
        };
      });
    } else {
      sentenceItems = sentenceItems.shuffle();
    }
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
  const booleans = Object.keys(Sentence.booleans);
  const binaryConns = Sentence.binaryConns;
  if (sentArr.length === 1) {
    return;
  } else if (sentArr[0] === 'I') {
    const thenIdx = sentArr.slice(1).mainConnectiveIdx();
    if (sentArr[thenIdx + 1] === 'T') {
      return thenIdx + 1;
    } else {
      return;
    }
  } else if (
    sentArr[0] === '(' &&
    sentArr.matchingClosingParensIdx(0) === sentArr.length - 1
  ) {
    if (
      sentArr[1] === '(' &&
      sentArr.matchingClosingParensIdx(1) === sentArr.length - 2
    ) {
      return;
    } else {
      return sentArr.slice(1, sentArr.length - 1).mainConnectiveIdx() + 1;
    }
  } else if (
    sentArr.length === 2 &&
    sentArr[0] === 'N' &&
    booleans.includes(sentArr[1])
  ) {
    return 0;
  } else if (
    sentArr[0] === 'N' &&
    sentArr[1] === '(' &&
    sentArr.matchingClosingParensIdx(1) === sentArr.length - 1
  ) {
    return 0;
  } else if (
    sentArr[0] === 'N' &&
    sentArr[1] === 'N' &&
    sentArr.slice(1).mainConnectiveIdx() === 0
  ) {
    return 0;
  } else if (sentArr[0] === 'N' && sentArr.slice(1).mainConnectiveIdx()) {
    return sentArr.slice(1).mainConnectiveIdx() + 1;
  } else if (
    sentArr.length === 3 &&
    booleans.includes(sentArr[0]) &&
    binaryConns.includes(sentArr[1]) &&
    booleans.includes(sentArr[2])
  ) {
    return 1;
  } else if (
    sentArr.length === 3 &&
    booleans.includes(sentArr[0]) &&
    binaryConns.includes(sentArr[1]) &&
    booleans.includes(sentArr[2])
  ) {
    return 1;
  } else if (
    booleans.includes(sentArr[0]) &&
    binaryConns.includes(sentArr[1]) &&
    sentArr[2] === '(' &&
    sentArr.matchingClosingParensIdx(2) === sentArr.length - 1
  ) {
    return 1;
  } else if (
    booleans.includes(sentArr[0]) &&
    binaryConns.includes(sentArr[1]) &&
    sentArr[2] === 'N'
  ) {
    return 1;
  } else if (
    booleans.includes(sentArr[0]) &&
    binaryConns.includes(sentArr[1]) &&
    sentArr[sentArr.slice(2).mainConnectiveIdx() + 2] === sentArr[1]
  ) {
    return 1;
  } else if (sentArr[0] === '(') {
    const matchingClosingParensIdx = sentArr.matchingClosingParensIdx(0);
    if (!matchingClosingParensIdx) {
      return undefined;
    } else if (
      binaryConns.includes(sentArr[matchingClosingParensIdx + 1]) &&
      booleans.includes(sentArr[matchingClosingParensIdx + 2]) &&
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
      sentArr.matchingClosingParensIdx(matchingClosingParensIdx + 2) ===
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
  const booleans = Object.keys(Sentence.booleans);
  for (let i = 0; i < sentArr.length - 1; i++) {
    if (booleans.includes(sentArr[i]) && booleans.includes(sentArr[i + 1])) {
      return false;
    }
  }
  return true;
};

Sentence.validParens = function(sentArr) {
  if (sentArr.includes('(')) {
    const openingParensIdx = sentArr.findOpeningParens(0);
    const closingParensIdx = sentArr.matchingClosingParensIdx(openingParensIdx);
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

export default Sentence;
