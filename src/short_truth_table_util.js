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
  const length = this.length();
  let i = 0;
  while (i < length) {
    let node = this.nthNode(i);
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
          model = handleNegation();
        } else if (node.value === 'O') {
          model = handleDisjunction();
        }
      }
    }
    i++;
  }
  return model;

  function handleNegation() {
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
    return model;
  }

  function handleDisjunction() {
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
};

export default Logic;
