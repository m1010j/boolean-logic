import { merge } from 'lodash';

class Logic {
  constructor(value) {
    this.value = value;
    this.parent = null;
    this.children = [];
  }
}

Logic.prototype.setParent = function(parent) {
  if (this.parent === parent) {
    return;
  }

  if (this.parent) {
    const children = this.parent.children;
    const thisIndex = children.indexOf(this);
    children.splice(thisIndex, 1);
  }

  this.parent = parent;

  if (this.parent) {
    this.parent.children.push(this);
  }
};

Logic.prototype.addChild = function(child) {
  child.setParent(this);
};

Logic.prototype.removeChild = function(child) {
  if (this.children.includes(child)) child.setParent(null);
};

Logic.prototype.atomic = function() {
  return this.children.length === 0 && Logic._isAtomic(this.value);
};

Logic.prototype.wff = function() {
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
};

Logic.prototype.dup = function() {
  return this.constructor._parse(this.stringify());
};

Logic.prototype.reduce = function() {
  if (this.children.length === 0) {
    return this.dup();
  } else if (this.value === 'N') {
    const negation = new this.constructor('N');
    negation.addChild(this.children[0].reduce());
    return negation;
  } else if (this.value === 'O') {
    const disjunction = new this.constructor('O');
    disjunction.addChild(this.children[0].reduce());
    disjunction.addChild(this.children[1].reduce());
    return disjunction;
  } else if (this.value === 'A') {
    const firstNegation = new this.constructor('N');
    const secondNegation = new this.constructor('N');
    const thirdNegation = new this.constructor('N');
    const disjunction = new this.constructor('O');
    const firstChildReduced = this.children[0].reduce();
    const secondChildReduced = this.children[1].reduce();
    firstNegation.addChild(firstChildReduced);
    secondNegation.addChild(secondChildReduced);
    disjunction.addChild(firstNegation);
    disjunction.addChild(secondNegation);
    thirdNegation.addChild(disjunction);
    return thirdNegation;
  } else if (this.value === 'X') {
    const firstChildReduced1 = this.children[0].reduce();
    const secondChildReduced1 = this.children[1].reduce();
    const firstChildReduced2 = firstChildReduced1.dup();
    const secondChildReduced2 = secondChildReduced1.dup();
    const disjunction = new this.constructor('O');
    disjunction.addChild(firstChildReduced1);
    disjunction.addChild(secondChildReduced1);
    const firstConjunction = new this.constructor('A');
    firstConjunction.addChild(firstChildReduced2);
    firstConjunction.addChild(secondChildReduced2);
    const negation = new this.constructor('N');
    negation.addChild(firstConjunction);
    const secondConjunction = new this.constructor('A');
    secondConjunction.addChild(disjunction);
    secondConjunction.addChild(negation);
    return secondConjunction.reduce();
  } else if (this.value === 'T') {
    const firstChildReduced = this.children[0].reduce();
    const secondChildReduced = this.children[1].reduce();
    const negation = new this.constructor('N');
    negation.addChild(firstChildReduced);
    const disjunction = new this.constructor('O');
    disjunction.addChild(negation);
    disjunction.addChild(secondChildReduced);
    return disjunction;
  } else if (this.value === 'B') {
    const firstChildReduced1 = this.children[0].reduce();
    const secondChildReduced1 = this.children[1].reduce();
    const firstChildReduced2 = firstChildReduced1.dup();
    const secondChildReduced2 = secondChildReduced1.dup();
    const negation1 = new this.constructor('N');
    negation1.addChild(firstChildReduced1);
    const disjunction1 = new this.constructor('O');
    disjunction1.addChild(negation1);
    disjunction1.addChild(secondChildReduced1);
    const negation2 = new this.constructor('N');
    negation2.addChild(secondChildReduced2);
    const disjunction2 = new this.constructor('O');
    disjunction2.addChild(negation2);
    disjunction2.addChild(firstChildReduced2);
    const conjunction = new this.constructor('A');
    conjunction.addChild(disjunction1);
    conjunction.addChild(disjunction2);
    return conjunction.reduce();
  }
};

Logic.prototype.stringify = function() {
  if (this.children.length === 0) {
    return this.value;
  } else if (this.children.length === 1) {
    const child0String = this.children[0].stringify();
    if (!child0String) {
      return;
    } else {
      return `(${this.value}${child0String})`;
    }
  } else if (this.children.length === 2) {
    const child0String = this.children[0].stringify();
    const child1String = this.children[1].stringify();
    if (!child0String || !child1String) {
      return;
    } else {
      return `(${child0String}${this.value}${child1String})`;
    }
  } else {
    return;
  }
};

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
  let nodes = [this];
  let current = -1;
  let node;
  while (current < n) {
    current += 1;
    node = nodes.shift();
    if (node.children) {
      nodes = nodes.concat(node.children);
    }
  }
  return node;
};

Logic.prototype.root = function() {
  let root = this;
  while (root.parent) {
    root = root.parent;
  }
  return root;
};

Logic.prototype.findClosestAncestorStringWithOpenPossibilities = function(
  model
) {
  let parent = this.parent;
  while (true) {
    if (!parent) {
      return;
    } else {
      if (parent.value === 'O') {
        let parentString = parent.stringify();
        let parentValueInModel = model[parentString];
        if (!parentValueInModel) {
          parent = parent.parent;
        } else if (
          parentValueInModel.openPossibilities &&
          parentValueInModel.history.length > 0
        ) {
          return parentString;
        } else {
          parent = parent.parent;
        }
      } else {
        parent = parent.parent;
      }
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

Logic.prototype.findAncestorIdxWithOpenPossibilities = function(model) {
  const closestAncestorString = this.findClosestAncestorStringWithOpenPossibilities(
    model
  );
  if (closestAncestorString) {
    return this.root().findIdx(closestAncestorString);
  }
};

Logic.prototype.supposeTrue = function() {
  let model = {
    [this.stringify()]: { truthValue: true },
    t: { truthValue: true },
    f: { truthValue: false },
  };
  this.forEach(node => {
    if (model) {
      let nodeString = node.stringify();
      let nodeValueInModel;
      if (model[nodeString] !== undefined) {
        nodeValueInModel = model[nodeString].truthValue;
      }
      let nodeOpenPossibilities;
      if (model[nodeString] !== undefined) {
        nodeOpenPossibilities = model[nodeString].openPossibilities;
      }
      if (typeof nodeValueInModel === 'boolean') {
        if (node.value === 'N') {
          let negatumString = node.children[0].stringify();
          let negatumValueInModel;
          if (model[negatumString] !== undefined) {
            negatumValueInModel = model[negatumString].truthValue;
          }
          if (negatumValueInModel === nodeValueInModel) {
            model = undefined;
          } else if (negatumValueInModel === undefined) {
            model[negatumString] = { truthValue: !nodeValueInModel };
          }
        } else if (node.value === 'O') {
          let firstDisjunctString = node.children[0].stringify();
          let secondDisjunctString = node.children[1].stringify();
          let firstDisjunctValueInModel;
          if (model[firstDisjunctString] !== undefined) {
            firstDisjunctValueInModel = model[firstDisjunctString].truthValue;
          }
          let secondDisjunctValueInModel;
          if (model[secondDisjunctString] !== undefined) {
            secondDisjunctValueInModel = model[secondDisjunctString].truthValue;
          }
          if (!nodeValueInModel) {
            if (
              firstDisjunctValueInModel === true ||
              secondDisjunctValueInModel === true
            ) {
              model = undefined;
            } else {
              model[firstDisjunctString] = { truthValue: false };
              model[secondDisjunctString] = { truthValue: false };
            }
          } else {
            if (
              firstDisjunctValueInModel === false &&
              secondDisjunctValueInModel === false
            ) {
              model = undefined;
            } else if (
              firstDisjunctValueInModel === false &&
              secondDisjunctValueInModel === undefined
            ) {
              model[secondDisjunctValueInModel] = { truthValue: true };
            } else if (
              firstDisjunctValueInModel === undefined &&
              secondDisjunctValueInModel === false
            ) {
              model[firstDisjunctValueInModel] = { truthValue: true };
              // TODO: change forEach to for, using nthNode, instead of model = undefined use findAncestorIdxWithOpenPossibilities, reset Idx
            } else if (
              firstDisjunctValueInModel === true &&
              secondDisjunctValueInModel === undefined
            ) {
              if (
                nodeOpenPossibilities &&
                nodeOpenPossibilities.includes([true, true])
              ) {
                let currentPossibilityIdx = nodeOpenPossibilities.indexOf([
                  true,
                  true,
                ]);
                nodeOpenPossibilities.slice(currentPossibilityIdx, 1);
                nodeOpenPossibilities.push([true, false]);
                model[nodeString].snapshot = merge({}, model);
                model[secondDisjunctValueInModel] = { truthValue: true };
              } else if (
                nodeOpenPossibilities &&
                nodeOpenPossibilities.includes([true, false])
              ) {
                let currentPossibilityIdx = nodeOpenPossibilities.indexOf([
                  true,
                  false,
                ]);
                nodeOpenPossibilities.slice(currentPossibilityIdx, 1);
                model[nodeString].snapshot = merge({}, model);
                model[secondDisjunctValueInModel] = { truthValue: false };
              } else {
                model = undefined;
              }
            } else if (
              secondDisjunctValueInModel === true &&
              firstDisjunctValueInModel === undefined
            ) {
              if (
                nodeOpenPossibilities &&
                nodeOpenPossibilities.includes([true, true])
              ) {
                let currentPossibilityIdx = nodeOpenPossibilities.indexOf([
                  true,
                  true,
                ]);
                nodeOpenPossibilities.slice(currentPossibilityIdx, 1);
                nodeOpenPossibilities.push([false, true]);
                model[nodeString].snapshot = merge({}, model);
                model[firstDisjunctValueInModel] = { truthValue: true };
              } else if (
                nodeOpenPossibilities &&
                nodeOpenPossibilities.includes([false, true])
              ) {
                let currentPossibilityIdx = nodeOpenPossibilities.indexOf([
                  true,
                  false,
                ]);
                nodeOpenPossibilities.slice(currentPossibilityIdx, 1);
                model[nodeString].snapshot = merge({}, model);
                model[firstDisjunctValueInModel] = { truthValue: false };
              } else {
                model = undefined;
              }
            } else if (
              firstDisjunctValueInModel === undefined &&
              secondDisjunctValueInModel === undefined
            ) {
              if (
                nodeOpenPossibilities &&
                nodeOpenPossibilities.includes([true, true])
              ) {
                let currentPossibilityIdx = nodeOpenPossibilities.indexOf([
                  true,
                  true,
                ]);
                nodeOpenPossibilities.slice(currentPossibilityIdx, 1);
                nodeOpenPossibilities.push([true, false]);
                nodeOpenPossibilities.push([false, true]);
                model[nodeString].snapshot = merge({}, model);
                model[firstDisjunctValueInModel] = { truthValue: true };
                model[secondDisjunctValueInModel] = { truthValue: true };
              } else if (
                nodeOpenPossibilities &&
                nodeOpenPossibilities.includes([true, false])
              ) {
                let currentPossibilityIdx = nodeOpenPossibilities.indexOf([
                  true,
                  false,
                ]);
                nodeOpenPossibilities.slice(currentPossibilityIdx, 1);
                model[nodeString].snapshot = merge({}, model);
                model[firstDisjunctValueInModel] = { truthValue: true };
                model[secondDisjunctValueInModel] = { truthValue: false };
              } else if (
                nodeOpenPossibilities &&
                nodeOpenPossibilities.includes([false, true])
              ) {
                let currentPossibilityIdx = nodeOpenPossibilities.indexOf([
                  false,
                  true,
                ]);
                nodeOpenPossibilities.slice(currentPossibilityIdx, 1);
                model[nodeString].snapshot = merge({}, model);
                model[firstDisjunctValueInModel] = { truthValue: false };
                model[secondDisjunctValueInModel] = { truthValue: true };
              } else {
                model = undefined;
              }
            }
          }
        }
      }
    }
  });
  return model;
};

Logic.prototype.isTrue = function(model = {}) {
  const modelValues = Object.keys(model).map(key => model[key]);
  for (let i = 0; i < modelValues.length; i++) {
    if (modelValues[i] !== true && modelValues[i] !== false) {
      return;
    }
  }

  const fullModel = Object.assign({}, model || {}, this.constructor._booleans);
  if (this.atomic()) {
    return fullModel[this.value];
  } else {
    const childOne = this.children[0].isTrue(model);
    let childTwo;
    if (this.children[1]) childTwo = this.children[1].isTrue(model);
    const connective = this.constructor._connectives[this.value];
    return connective(childOne, childTwo);
  }
};

Logic.prototype.supposeTrue = () => {
  const reduced = this.reduce();
  const numAtomics = Logic._atomics(reduced.stringify()).length;
  const models = [{}];
  if (reduced.children.length === 0) {
    if (reduced.value === 't') {
      return { t: boolean };
    } else if (reduced.value === 'f') {
      return;
    } else {
    }
  } else {
    if (reduced.value === 'N') {
      models;
    } else {
    }
  }
};

export default Logic;
