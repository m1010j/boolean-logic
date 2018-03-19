class Logic {
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
      children._remove(this);
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
    return this.children.length === 0 && Logic._isAtomic(this.value);
  }

  wff() {
    const connectives = Object.keys(this.constructor._connectives);
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
      this.constructor._binaryConns.includes(this.value) &&
      this.children.length === 2 &&
      this.children[0].wff() &&
      this.children[1].wff()
    ) {
      return true;
    }

    return false;
  }

  isTrue(model) {
    model = model || {};
    const modelValues = Object.keys(model).map(key => model[key]);
    for (let i = 0; i < modelValues.length; i++) {
      if (modelValues[i] !== true && modelValues[i] !== false) {
        return;
      }
    }

    const fullModel = Object.assign(
      {},
      model || {},
      this.constructor._booleans
    );
    if (!this.wff()) {
      return;
    } else if (this.atomic()) {
      return fullModel[this.value];
    } else {
      const childOne = this.children[0].isTrue(model);
      let childTwo;
      if (this.children[1]) childTwo = this.children[1].isTrue(model);
      const connective = this.constructor._connectives[this.value];
      return connective(childOne, childTwo);
    }
  }
}

Logic.isTrue = function(wff, model) {
  const parsed = Logic._parse(wff);
  if (!parsed) {
    return;
  }
  return parsed.isTrue(model);
};

Logic.isSat = function(wff, returnModel) {
  const parsedWff = Logic._parse(wff);
  if (!parsedWff) {
    return;
  }
  const models = this._generateModels(wff);
  return this._checkModels(parsedWff, models, returnModel);
};

Logic._checkModels = function(parsedWff, models, returnModel) {
  for (let i = 0; i < models.length; i++) {
    if (parsedWff.isTrue(models[i])) {
      return returnModel ? models[i] : true;
    }
  }
  return false;
};

Logic._booleans = {
  t: true,
  f: false,
};

Logic._binaryConns = ['A', 'O', 'T', 'B', 'X'];

Logic._vocabulary = Logic._binaryConns.concat(['N', '(', ')', 't', 'f']);

Logic._connectives = {
  A: (sentOne, sentTwo) => sentOne && sentTwo,
  O: (sentOne, sentTwo) => sentOne || sentTwo,
  T: (sentOne, sentTwo) => !sentOne || sentTwo,
  B: (sentOne, sentTwo) => (!sentOne || sentTwo) && (!sentTwo || sentOne),
  X: (sentOne, sentTwo) => (!sentOne && sentTwo) || (sentOne && !sentTwo),
  N: sentence => !sentence,
};

Logic._generateModels = function(wff) {
  const atomics = this._atomics(wff);
  const subsets = this._subsets(atomics);
  return subsets.map(subset => {
    const newModel = {};
    atomics.forEach(atomic => {
      if (subset.includes(atomic)) {
        newModel[atomic] = false;
      } else {
        newModel[atomic] = true;
      }
    });
    return newModel;
  });
};

Logic._atomics = function(wff) {
  wff = this._ensureIsArray(wff);
  if (!wff) {
    return;
  }
  const atomics = [];
  wff.forEach(el => {
    if (this._isAtomic(el) && !atomics.includes(el)) {
      atomics.push(el);
    }
  });
  return atomics;
};

Logic._parse = function(wff) {
  this._ensureIsLegal(wff);
  wff = Logic._ensureIsArray(wff);
  if (!wff) {
    throw 'Argument must be either a string or an array';
  }
  const mainConnectiveIdx = this._mainConnectiveIdx(wff);
  const mainConnective = wff[mainConnectiveIdx];
  if (wff.length === 1 && Logic._isAtomic(wff[0])) {
    return new Logic(wff[0]);
  } else if (
    wff[0] === '(' &&
    wff.length > 3 &&
    this._matchingClosingParensIdx(wff, 0) === wff.length - 1
  ) {
    if (
      wff[1] === '(' &&
      this._matchingClosingParensIdx(wff, 1) === wff.length - 2
    ) {
      return;
    } else {
      return this._parse(wff.slice(1, wff.length - 1));
    }
  } else if (mainConnectiveIdx === 0) {
    const prejacent = this._parse(wff.slice(1));
    const connective = new Logic(wff[mainConnectiveIdx]);
    if (prejacent) {
      connective.addChild(prejacent);
      return connective;
    }
  } else if (mainConnectiveIdx) {
    const firstConjunct = this._parse(wff.slice(0, mainConnectiveIdx));
    const secondConjunct = this._parse(wff.slice(mainConnectiveIdx + 1));
    if (firstConjunct && secondConjunct) {
      const connective = new Logic(mainConnective);
      if (mainConnective) {
        connective.addChild(firstConjunct);
        connective.addChild(secondConjunct);
        return connective;
      }
    }
  }
};

Logic._parseString = function(str) {
  const parsed = [];
  for (let i = 0; i < str.length; i++) {
    if (this._vocabulary.includes(str[i])) {
      parsed.push(str[i]);
    } else {
      let subStr = '';
      for (
        let j = i;
        j < str.length && !this._vocabulary.includes(str[j]);
        j++
      ) {
        subStr += str[j];
        i = j;
      }
      if (this._isAtomic(subStr)) {
        parsed.push(subStr);
      } else {
        return;
      }
    }
  }
  return parsed;
};

Logic._isAtomic = function(str) {
  if (['t', 'f'].includes(str) || !isNaN(parseInt(str))) {
    return true;
  } else {
    return false;
  }
};

Logic._mainConnectiveIdx = function(sentArr) {
  const binaryConns = this._binaryConns;
  if (sentArr.length === 1) {
    return;
  } else if (sentArr[0] === 'I') {
    const thenIdx = this._mainConnectiveIdx(sentArr.slice(1));
    if (sentArr[thenIdx + 1] === 'T') {
      return thenIdx + 1;
    } else {
      return;
    }
  } else if (
    sentArr[0] === '(' &&
    this._matchingClosingParensIdx(sentArr, 0) === sentArr.length - 1
  ) {
    if (
      sentArr[1] === '(' &&
      this._matchingClosingParensIdx(sentArr, 1) === sentArr.length - 2
    ) {
      return;
    } else {
      return this._mainConnectiveIdx(sentArr.slice(1, sentArr.length - 1)) + 1;
    }
  } else if (
    sentArr.length === 2 &&
    sentArr[0] === 'N' &&
    Logic._isAtomic(sentArr[1])
  ) {
    return 0;
  } else if (
    sentArr[0] === 'N' &&
    sentArr[1] === '(' &&
    this._matchingClosingParensIdx(sentArr, 1) === sentArr.length - 1
  ) {
    return 0;
  } else if (
    sentArr[0] === 'N' &&
    sentArr[1] === 'N' &&
    this._mainConnectiveIdx(sentArr.slice(1)) === 0
  ) {
    return 0;
  } else if (sentArr[0] === 'N' && this._mainConnectiveIdx(sentArr.slice(1))) {
    return this._mainConnectiveIdx(sentArr.slice(1)) + 1;
  } else if (
    sentArr.length === 3 &&
    Logic._isAtomic(sentArr[0]) &&
    binaryConns.includes(sentArr[1]) &&
    Logic._isAtomic(sentArr[2])
  ) {
    return 1;
  } else if (
    sentArr.length === 3 &&
    Logic._isAtomic(sentArr[0]) &&
    binaryConns.includes(sentArr[1]) &&
    Logic._isAtomic(sentArr[2])
  ) {
    return 1;
  } else if (
    Logic._isAtomic(sentArr[0]) &&
    binaryConns.includes(sentArr[1]) &&
    sentArr[2] === '(' &&
    this._matchingClosingParensIdx(sentArr, 2) === sentArr.length - 1
  ) {
    return 1;
  } else if (
    Logic._isAtomic(sentArr[0]) &&
    binaryConns.includes(sentArr[1]) &&
    sentArr[2] === 'N'
  ) {
    return 1;
  } else if (
    Logic._isAtomic(sentArr[0]) &&
    binaryConns.includes(sentArr[1]) &&
    sentArr[this._mainConnectiveIdx(sentArr.slice(2)) + 2] === sentArr[1]
  ) {
    return 1;
  } else if (sentArr[0] === '(') {
    const matchingClosingParensIdx = this._matchingClosingParensIdx(sentArr, 0);
    if (!matchingClosingParensIdx) {
      return undefined;
    } else if (
      binaryConns.includes(sentArr[matchingClosingParensIdx + 1]) &&
      Logic._isAtomic(sentArr[matchingClosingParensIdx + 2]) &&
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
      this._matchingClosingParensIdx(sentArr, matchingClosingParensIdx + 2) ===
        sentArr.length - 1
    ) {
      return matchingClosingParensIdx + 1;
    } else {
      const secondMainConnIdx =
        this._mainConnectiveIdx(sentArr.slice(matchingClosingParensIdx + 2)) +
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

Logic._matchingClosingParensIdx = function(sentArr, idx) {
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

Logic._subsets = function(array) {
  if (array.length === 0) {
    return [[]];
  }
  const subs = this._subsets(array.slice(0, array.length - 1));
  const concatted = subs.map(sub => {
    return sub.concat([array[array.length - 1]]);
  });
  return subs.concat(concatted);
};

Logic._remove = function(sentArr, el) {
  const idx = sentArr.indexOf(el);
  if (idx !== -1) sentArr.splice(idx, 1);
};

Logic._ensureIsArray = function(wff) {
  if (typeof wff === 'string') {
    wff = this._parseString(wff);
  } else if (!(wff instanceof Array)) {
    return;
  }
  return wff;
};

Logic._ensureIsLegal = function(wff) {
  for (let i = 0; i < wff.length; i++) {
    if (!this._vocabulary.includes(wff[i]) && !this._isAtomic(wff[i])) {
      throw "Argument can only contain 'N', 'A', 'O', 'T', 'B', 'X', '(', ')', 't', 'f', and numerals (strings of integers)";
    }
  }
};

export const isTrue = Logic.isTrue.bind(Logic);

export const isSat = Logic.isSat.bind(Logic);

export default Logic;
