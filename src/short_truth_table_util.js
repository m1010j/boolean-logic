import { merge } from 'lodash';
import Logic from './class_definition.js';

Logic.prototype.forEach = function(callback) {
  let nodes = [this];
  while (nodes.length > 0) {
    let node = nodes.shift();
    callback(node);
    nodes = nodes.concat(node.children);
  }
};

Logic.prototype.length = function() {
  let num = 0;
  this.forEach(node => {
    num += 1;
  });
  return num;
};

Logic.prototype.nthNode = function(n) {
  if (n === 0) return this;
  const children = this.children;
  for (let i = 0; i < children.length; i++) {
    n--;
    let result = children[i].nthNode(n);
    if (result) {
      return result;
    } else {
      n = n - children[i].length() + 1;
    }
  }
};

Logic.prototype.findIdx = function(str) {
  const length = this.length();
  for (let i = 0; i < length; i++) {
    if (this.nthNode(i).stringify() === str) {
      return i;
    }
  }
};

Logic.prototype.supposeTrue = function() {
  const reduced = this.reduce();

  const length = reduced.length();
  let model = {
    [reduced.stringify()]: { truthValue: true },
    t: { truthValue: true },
    f: { truthValue: false },
  };
  let i = 0;
  let node;
  let nodeString;
  let nodeValueInModel;
  let negatumString;
  let negatumValueInModel;
  let firstDisjunctString;
  let secondDisjunctString;
  let firstDisjunctValueInModel;
  let secondDisjunctValueInModel;
  let nodeOpenPossibilities;

  while (!model.busted && i < length) {
    node = reduced.nthNode(i);
    nodeString = node.stringify();
    if (model[nodeString] !== undefined) {
      nodeValueInModel = model[nodeString].truthValue;
    }
    if (typeof nodeValueInModel === 'boolean') {
      if (node.value === 'N') {
        handleNegation();
      } else if (node.value === 'O') {
        handleDisjunction();
      }
    }
    i++;
  }
  if (!model.busted) {
    return extractRealModel(model);
  }

  function extractRealModel() {
    const realModel = {};
    for (let key in model) {
      if (key !== 't' && key !== 'f' && Logic._isAtomic(key)) {
        realModel[key] = model[key].truthValue;
      }
    }
    return realModel;
  }

  function handleNegation() {
    negatumValueInModel = undefined;
    negatumString = node.children[0].stringify();
    if (model[negatumString] !== undefined) {
      negatumValueInModel = model[negatumString].truthValue;
    }
    if (negatumValueInModel === nodeValueInModel) {
      handleInconsistency();
    } else if (negatumValueInModel === undefined) {
      model[negatumString] = { truthValue: !nodeValueInModel };
    }
  }

  function handleDisjunction() {
    firstDisjunctString = node.children[0].stringify();
    secondDisjunctString = node.children[1].stringify();
    firstDisjunctValueInModel = undefined;
    secondDisjunctValueInModel = undefined;
    if (model[firstDisjunctString] !== undefined) {
      firstDisjunctValueInModel = model[firstDisjunctString].truthValue;
    }
    if (model[secondDisjunctString] !== undefined) {
      secondDisjunctValueInModel = model[secondDisjunctString].truthValue;
    }
    if (model[nodeString] !== undefined) {
      nodeOpenPossibilities = model[nodeString].openPossibilities;
    }
    if (!nodeValueInModel) {
      handleNodeFalse();
    } else {
      if (
        firstDisjunctValueInModel === false &&
        secondDisjunctValueInModel === false
      ) {
        handleInconsistency();
      } else if (
        firstDisjunctValueInModel === false &&
        secondDisjunctValueInModel === undefined
      ) {
        model[secondDisjunctString] = { truthValue: true };
      } else if (
        firstDisjunctValueInModel === undefined &&
        secondDisjunctValueInModel === false
      ) {
        model[firstDisjunctString] = { truthValue: true };
      } else if (
        firstDisjunctValueInModel === true &&
        secondDisjunctValueInModel === undefined
      ) {
        addTrueTrue();
        handleTrueUndef();
      } else if (
        firstDisjunctValueInModel === undefined &&
        secondDisjunctValueInModel === true
      ) {
        addTrueTrue();
        handleUndefTrue();
      } else if (
        firstDisjunctValueInModel === undefined &&
        secondDisjunctValueInModel === undefined
      ) {
        addTrueTrue();
        handleUndefUndef();
      }
    }

    function handleNodeFalse() {
      if (
        firstDisjunctValueInModel === true ||
        secondDisjunctValueInModel === true
      ) {
        handleInconsistency();
      } else {
        model[firstDisjunctString] = { truthValue: false };
        model[secondDisjunctString] = { truthValue: false };
      }
    }

    function addTrueTrue() {
      if (!nodeOpenPossibilities) {
        model[nodeString].openPossibilities = [[true, true]];
        nodeOpenPossibilities = model[nodeString].openPossibilities;
      }
    }

    function handleTrueUndef() {
      if (
        nodeOpenPossibilities &&
        arrayIncludesArray(nodeOpenPossibilities, [true, true])
      ) {
        let currentPossibilityIdx = indexOfArray(nodeOpenPossibilities, [
          true,
          true,
        ]);
        nodeOpenPossibilities.splice(currentPossibilityIdx, 1);
        nodeOpenPossibilities.push([true, false]);
        model[nodeString].snapshot = merge({}, model);
        model[secondDisjunctString] = { truthValue: true };
      } else if (
        nodeOpenPossibilities &&
        arrayIncludesArray(nodeOpenPossibilities, [true, false])
      ) {
        let currentPossibilityIdx = indexOfArray(nodeOpenPossibilities, [
          true,
          false,
        ]);
        nodeOpenPossibilities.splice(currentPossibilityIdx, 1);
        model[nodeString].snapshot = merge({}, model);
        model[secondDisjunctString] = { truthValue: false };
      } else {
        handleInconsistency();
      }
    }

    function handleUndefTrue() {
      if (
        nodeOpenPossibilities &&
        arrayIncludesArray(nodeOpenPossibilities, [true, true])
      ) {
        let currentPossibilityIdx = indexOfArray(nodeOpenPossibilities, [
          true,
          true,
        ]);
        nodeOpenPossibilities.splice(currentPossibilityIdx, 1);
        nodeOpenPossibilities.push([false, true]);
        model[nodeString].snapshot = merge({}, model);
        model[firstDisjunctString] = { truthValue: true };
      } else if (
        nodeOpenPossibilities &&
        arrayIncludesArray(nodeOpenPossibilities, [false, true])
      ) {
        let currentPossibilityIdx = indexOfArray(nodeOpenPossibilities, [
          false,
          true,
        ]);
        nodeOpenPossibilities.splice(currentPossibilityIdx, 1);
        model[nodeString].snapshot = merge({}, model);
        model[firstDisjunctString] = { truthValue: false };
      } else {
        handleInconsistency();
      }
    }

    function handleUndefUndef() {
      if (
        nodeOpenPossibilities &&
        arrayIncludesArray(nodeOpenPossibilities, [true, true])
      ) {
        let currentPossibilityIdx = indexOfArray(nodeOpenPossibilities, [
          true,
          true,
        ]);
        nodeOpenPossibilities.splice(currentPossibilityIdx, 1);
        nodeOpenPossibilities.push([true, false]);
        nodeOpenPossibilities.push([false, true]);
        model[nodeString].snapshot = merge({}, model);
        model[firstDisjunctString] = { truthValue: true };
        model[secondDisjunctString] = { truthValue: true };
      } else if (
        nodeOpenPossibilities &&
        arrayIncludesArray(nodeOpenPossibilities, [true, false])
      ) {
        let currentPossibilityIdx = indexOfArray(nodeOpenPossibilities, [
          true,
          false,
        ]);
        nodeOpenPossibilities.splice(currentPossibilityIdx, 1);
        model[nodeString].snapshot = merge({}, model);
        model[firstDisjunctString] = { truthValue: true };
        model[secondDisjunctString] = { truthValue: false };
      } else if (
        nodeOpenPossibilities &&
        arrayIncludesArray(nodeOpenPossibilities, [false, true])
      ) {
        let currentPossibilityIdx = indexOfArray(nodeOpenPossibilities, [
          false,
          true,
        ]);
        nodeOpenPossibilities.splice(currentPossibilityIdx, 1);
        model[nodeString].snapshot = merge({}, model);
        model[firstDisjunctString] = { truthValue: false };
        model[secondDisjunctString] = { truthValue: true };
      } else {
        handleInconsistency();
      }
    }
  }

  function findClosestNodeAndIdxWithOpenPossibilities() {
    for (let j = i; j >= 0; j--) {
      let current = reduced.nthNode(j);
      if (current.value === 'O') {
        let currentString = current.stringify();
        let currentValueInModel = model[currentString];
        if (
          currentValueInModel &&
          currentValueInModel.openPossibilities &&
          currentValueInModel.openPossibilities.length > 0
        ) {
          return { node: current, idx: j };
        }
      }
    }
  }

  function handleInconsistency() {
    const closest = findClosestNodeAndIdxWithOpenPossibilities();
    if (!closest) {
      model.busted = true;
    } else {
      i = closest.idx - 1;
      const closestString = closest.node.stringify();
      model = model[closestString].snapshot;
    }
  }
};

function arrayIncludesArray(arr1, arr2) {
  for (let i = 0; i < arr1.length; i++) {
    if (arrayEqualsArray(arr1[i], arr2)) {
      return true;
    }
  }
  return false;
}

function indexOfArray(arr1, arr2) {
  for (let i = 0; i < arr1.length; i++) {
    if (arrayEqualsArray(arr1[i], arr2)) {
      return i;
    }
  }
}

function arrayEqualsArray(arr1, arr2) {
  if (arr1.length !== arr2.length) {
    return false;
  }
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) {
      return false;
    }
  }
  return true;
}

export default Logic;
