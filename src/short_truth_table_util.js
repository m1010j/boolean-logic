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
  const wff = this;

  const length = wff.length();
  let model = {
    [wff.stringify()]: { truthValue: true },
    t: { truthValue: true },
    f: { truthValue: false },
  };
  let i = 0;
  let node;
  let nodeString;
  let nodeValueInModel;
  let negatumString;
  let negatumValueInModel;
  let firstComponentString;
  let secondComponentString;
  let firstComponentValueInModel;
  let secondComponentValueInModel;
  let nodeOpenPossibilities;

  while (!model.busted && i < length) {
    node = wff.nthNode(i);
    nodeString = node.stringify();
    if (model[nodeString] !== undefined) {
      nodeValueInModel = model[nodeString].truthValue;
    }
    if (typeof nodeValueInModel === 'boolean') {
      if (node.value === 'N') {
        handleNot();
      } else if (node.value === 'A') {
        handleAnd();
      } else if (node.value === 'O') {
        handleOr();
      } else if (node.value === 'X') {
        handleXor();
      } else if (node.value === 'T') {
        handleIf();
      } else if (node.value === 'B') {
        handleIff();
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

  function handleNot() {
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

  function handleAnd() {
    firstComponentString = node.children[0].stringify();
    secondComponentString = node.children[1].stringify();
    firstComponentValueInModel = undefined;
    secondComponentValueInModel = undefined;
    if (model[firstComponentString] !== undefined) {
      firstComponentValueInModel = model[firstComponentString].truthValue;
    }
    if (model[secondComponentString] !== undefined) {
      secondComponentValueInModel = model[secondComponentString].truthValue;
    }
    if (model[nodeString] !== undefined) {
      nodeOpenPossibilities = model[nodeString].openPossibilities;
    }
    if (nodeValueInModel) {
      handleNodeTrue();
    } else {
      handleNodeFalse();
    }

    function handleNodeTrue() {
      if (
        firstComponentValueInModel === false ||
        secondComponentValueInModel === false
      ) {
        handleInconsistency();
      } else if (
        firstComponentValueInModel === true &&
        secondComponentValueInModel === undefined
      ) {
        model[secondComponentString] = { truthValue: true };
      } else if (
        firstComponentValueInModel === undefined &&
        secondComponentValueInModel === true
      ) {
        model[firstComponentString] = { truthValue: true };
      } else if (
        firstComponentValueInModel === undefined &&
        secondComponentValueInModel === undefined
      ) {
        model[firstComponentString] = { truthValue: true };
        model[secondComponentString] = { truthValue: true };
      }
    }

    function handleNodeFalse() {
      if (
        firstComponentValueInModel === true &&
        secondComponentValueInModel === true
      ) {
        handleInconsistency();
      } else if (
        firstComponentValueInModel === true &&
        secondComponentValueInModel === undefined
      ) {
        model[secondComponentString] = { truthValue: false };
      } else if (
        firstComponentValueInModel === undefined &&
        secondComponentValueInModel === true
      ) {
        model[firstComponentString] = { truthValue: false };
      } else if (
        firstComponentValueInModel === false &&
        secondComponentValueInModel === undefined
      ) {
        addFalseTrue();
        handleFalseUndef();
      } else if (
        firstComponentValueInModel === undefined &&
        secondComponentValueInModel === false
      ) {
        addTrueFalse();
        handleUndefFalse();
      } else if (
        firstComponentValueInModel === undefined &&
        secondComponentValueInModel === undefined
      ) {
        addTrueFalse();
        handleUndefUndef();
      }
    }

    function addFalseTrue() {
      if (!nodeOpenPossibilities) {
        model[nodeString].openPossibilities = [[false, true]];
        nodeOpenPossibilities = model[nodeString].openPossibilities;
      }
    }

    function addTrueFalse() {
      if (!nodeOpenPossibilities) {
        model[nodeString].openPossibilities = [[true, false]];
        nodeOpenPossibilities = model[nodeString].openPossibilities;
      }
    }

    function handleFalseUndef() {
      if (
        nodeOpenPossibilities &&
        arrayIncludesArray(nodeOpenPossibilities, [false, true])
      ) {
        let currentPossibilityIdx = indexOfArray(nodeOpenPossibilities, [
          false,
          true,
        ]);
        nodeOpenPossibilities.splice(currentPossibilityIdx, 1);
        nodeOpenPossibilities.push([false, false]);
        model[nodeString].snapshot = merge({}, model);
        model[secondComponentString] = { truthValue: true };
      } else if (
        nodeOpenPossibilities &&
        arrayIncludesArray(nodeOpenPossibilities, [false, false])
      ) {
        let currentPossibilityIdx = indexOfArray(nodeOpenPossibilities, [
          false,
          false,
        ]);
        nodeOpenPossibilities.splice(currentPossibilityIdx, 1);
        model[nodeString].snapshot = merge({}, model);
        model[secondComponentString] = { truthValue: false };
      } else {
        handleInconsistency();
      }
    }

    function handleUndefFalse() {
      if (
        nodeOpenPossibilities &&
        arrayIncludesArray(nodeOpenPossibilities, [true, false])
      ) {
        let currentPossibilityIdx = indexOfArray(nodeOpenPossibilities, [
          true,
          false,
        ]);
        nodeOpenPossibilities.splice(currentPossibilityIdx, 1);
        nodeOpenPossibilities.push([false, false]);
        model[nodeString].snapshot = merge({}, model);
        model[firstComponentString] = { truthValue: true };
      } else if (
        nodeOpenPossibilities &&
        arrayIncludesArray(nodeOpenPossibilities, [false, false])
      ) {
        let currentPossibilityIdx = indexOfArray(nodeOpenPossibilities, [
          false,
          false,
        ]);
        nodeOpenPossibilities.splice(currentPossibilityIdx, 1);
        model[nodeString].snapshot = merge({}, model);
        model[firstComponentString] = { truthValue: false };
      } else {
        handleInconsistency();
      }
    }

    function handleUndefUndef() {
      if (
        nodeOpenPossibilities &&
        arrayIncludesArray(nodeOpenPossibilities, [true, false])
      ) {
        let currentPossibilityIdx = indexOfArray(nodeOpenPossibilities, [
          true,
          false,
        ]);
        nodeOpenPossibilities.splice(currentPossibilityIdx, 1);
        nodeOpenPossibilities.push([false, true]);
        nodeOpenPossibilities.push([false, false]);
        model[nodeString].snapshot = merge({}, model);
        model[firstComponentString] = { truthValue: true };
        model[secondComponentString] = { truthValue: false };
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
        model[firstComponentString] = { truthValue: false };
        model[secondComponentString] = { truthValue: true };
      } else if (
        nodeOpenPossibilities &&
        arrayIncludesArray(nodeOpenPossibilities, [false, false])
      ) {
        let currentPossibilityIdx = indexOfArray(nodeOpenPossibilities, [
          false,
          false,
        ]);
        nodeOpenPossibilities.splice(currentPossibilityIdx, 1);
        model[nodeString].snapshot = merge({}, model);
        model[firstComponentString] = { truthValue: false };
        model[secondComponentString] = { truthValue: false };
      } else {
        handleInconsistency();
      }
    }
  }

  function handleOr() {
    firstComponentString = node.children[0].stringify();
    secondComponentString = node.children[1].stringify();
    firstComponentValueInModel = undefined;
    secondComponentValueInModel = undefined;
    if (model[firstComponentString] !== undefined) {
      firstComponentValueInModel = model[firstComponentString].truthValue;
    }
    if (model[secondComponentString] !== undefined) {
      secondComponentValueInModel = model[secondComponentString].truthValue;
    }
    if (model[nodeString] !== undefined) {
      nodeOpenPossibilities = model[nodeString].openPossibilities;
    }
    if (!nodeValueInModel) {
      handleNodeFalse();
    } else {
      if (
        firstComponentValueInModel === false &&
        secondComponentValueInModel === false
      ) {
        handleInconsistency();
      } else if (
        firstComponentValueInModel === false &&
        secondComponentValueInModel === undefined
      ) {
        model[secondComponentString] = { truthValue: true };
      } else if (
        firstComponentValueInModel === undefined &&
        secondComponentValueInModel === false
      ) {
        model[firstComponentString] = { truthValue: true };
      } else if (
        firstComponentValueInModel === true &&
        secondComponentValueInModel === undefined
      ) {
        addTrueTrue();
        handleTrueUndef();
      } else if (
        firstComponentValueInModel === undefined &&
        secondComponentValueInModel === true
      ) {
        addTrueTrue();
        handleUndefTrue();
      } else if (
        firstComponentValueInModel === undefined &&
        secondComponentValueInModel === undefined
      ) {
        addTrueTrue();
        handleUndefUndef();
      }
    }

    function handleNodeFalse() {
      if (
        firstComponentValueInModel === true ||
        secondComponentValueInModel === true
      ) {
        handleInconsistency();
      } else {
        model[firstComponentString] = { truthValue: false };
        model[secondComponentString] = { truthValue: false };
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
        model[secondComponentString] = { truthValue: true };
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
        model[secondComponentString] = { truthValue: false };
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
        model[firstComponentString] = { truthValue: true };
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
        model[firstComponentString] = { truthValue: false };
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
        model[firstComponentString] = { truthValue: true };
        model[secondComponentString] = { truthValue: true };
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
        model[firstComponentString] = { truthValue: true };
        model[secondComponentString] = { truthValue: false };
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
        model[firstComponentString] = { truthValue: false };
        model[secondComponentString] = { truthValue: true };
      } else {
        handleInconsistency();
      }
    }
  }

  function handleXor() {
    firstComponentString = node.children[0].stringify();
    secondComponentString = node.children[1].stringify();
    firstComponentValueInModel = undefined;
    secondComponentValueInModel = undefined;
    if (model[firstComponentString] !== undefined) {
      firstComponentValueInModel = model[firstComponentString].truthValue;
    }
    if (model[secondComponentString] !== undefined) {
      secondComponentValueInModel = model[secondComponentString].truthValue;
    }
    if (model[nodeString] !== undefined) {
      nodeOpenPossibilities = model[nodeString].openPossibilities;
    }
    if (!nodeValueInModel) {
      handleNodeFalse();
    } else {
      handleNodeTrue();
    }

    function handleNodeFalse() {
      if (
        (firstComponentValueInModel === true &&
          secondComponentValueInModel === false) ||
        (firstComponentValueInModel === false &&
          secondComponentValueInModel === true)
      ) {
        handleInconsistency();
      } else if (
        firstComponentValueInModel === true &&
        secondComponentValueInModel === undefined
      ) {
        model[secondComponentString] = { truthValue: true };
      } else if (
        firstComponentValueInModel === undefined &&
        secondComponentValueInModel === true
      ) {
        model[firstComponentString] = { truthValue: true };
      } else if (
        firstComponentValueInModel === false &&
        secondComponentValueInModel === undefined
      ) {
        model[secondComponentString] = { truthValue: false };
      } else if (
        firstComponentValueInModel === undefined &&
        secondComponentValueInModel === false
      ) {
        model[firstComponentString] = { truthValue: false };
      } else if (
        firstComponentValueInModel === undefined &&
        secondComponentValueInModel === undefined
      ) {
        addTrueTrue();
        handleUndefUndef();
      }

      function addTrueTrue() {
        if (!nodeOpenPossibilities) {
          model[nodeString].openPossibilities = [[true, true]];
          nodeOpenPossibilities = model[nodeString].openPossibilities;
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
          nodeOpenPossibilities.push([false, false]);
          model[nodeString].snapshot = merge({}, model);
          model[firstComponentString] = { truthValue: true };
          model[secondComponentString] = { truthValue: true };
        } else if (
          nodeOpenPossibilities &&
          arrayIncludesArray(nodeOpenPossibilities, [false, false])
        ) {
          let currentPossibilityIdx = indexOfArray(nodeOpenPossibilities, [
            false,
            false,
          ]);
          nodeOpenPossibilities.splice(currentPossibilityIdx, 1);
          model[nodeString].snapshot = merge({}, model);
          model[firstComponentString] = { truthValue: false };
          model[secondComponentString] = { truthValue: false };
        } else {
          handleInconsistency();
        }
      }
    }

    function handleNodeTrue() {
      if (
        (firstComponentValueInModel === true &&
          secondComponentValueInModel === true) ||
        (firstComponentValueInModel === false &&
          secondComponentValueInModel === false)
      ) {
        handleInconsistency();
      } else if (
        firstComponentValueInModel === true &&
        secondComponentValueInModel === undefined
      ) {
        model[secondComponentString] = { truthValue: false };
      } else if (
        firstComponentValueInModel === undefined &&
        secondComponentValueInModel === true
      ) {
        model[firstComponentString] = { truthValue: false };
      } else if (
        firstComponentValueInModel === false &&
        secondComponentValueInModel === undefined
      ) {
        model[secondComponentString] = { truthValue: true };
      } else if (
        firstComponentValueInModel === undefined &&
        secondComponentValueInModel === false
      ) {
        model[firstComponentString] = { truthValue: true };
      } else if (
        firstComponentValueInModel === undefined &&
        secondComponentValueInModel === undefined
      ) {
        addTrueFalse();
        handleUndefUndef();
      }

      function addTrueFalse() {
        if (!nodeOpenPossibilities) {
          model[nodeString].openPossibilities = [[true, false]];
          nodeOpenPossibilities = model[nodeString].openPossibilities;
        }
      }

      function handleUndefUndef() {
        if (
          nodeOpenPossibilities &&
          arrayIncludesArray(nodeOpenPossibilities, [true, false])
        ) {
          let currentPossibilityIdx = indexOfArray(nodeOpenPossibilities, [
            true,
            false,
          ]);
          nodeOpenPossibilities.splice(currentPossibilityIdx, 1);
          nodeOpenPossibilities.push([false, true]);
          model[nodeString].snapshot = merge({}, model);
          model[firstComponentString] = { truthValue: true };
          model[secondComponentString] = { truthValue: false };
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
          model[firstComponentString] = { truthValue: false };
          model[secondComponentString] = { truthValue: true };
        } else {
          handleInconsistency();
        }
      }
    }
  }
  function handleIff() {
    firstComponentString = node.children[0].stringify();
    secondComponentString = node.children[1].stringify();
    firstComponentValueInModel = undefined;
    secondComponentValueInModel = undefined;
    if (model[firstComponentString] !== undefined) {
      firstComponentValueInModel = model[firstComponentString].truthValue;
    }
    if (model[secondComponentString] !== undefined) {
      secondComponentValueInModel = model[secondComponentString].truthValue;
    }
    if (model[nodeString] !== undefined) {
      nodeOpenPossibilities = model[nodeString].openPossibilities;
    }
    if (!nodeValueInModel) {
      handleNodeFalse();
    } else {
      handleNodeTrue();
    }

    function handleNodeFalse() {
      if (
        (firstComponentValueInModel === true &&
          secondComponentValueInModel === true) ||
        (firstComponentValueInModel === false &&
          secondComponentValueInModel === false)
      ) {
        handleInconsistency();
      } else if (
        firstComponentValueInModel === true &&
        secondComponentValueInModel === undefined
      ) {
        model[secondComponentString] = { truthValue: false };
      } else if (
        firstComponentValueInModel === undefined &&
        secondComponentValueInModel === true
      ) {
        model[firstComponentString] = { truthValue: false };
      } else if (
        firstComponentValueInModel === false &&
        secondComponentValueInModel === undefined
      ) {
        model[secondComponentString] = { truthValue: true };
      } else if (
        firstComponentValueInModel === undefined &&
        secondComponentValueInModel === false
      ) {
        model[firstComponentString] = { truthValue: true };
      } else if (
        firstComponentValueInModel === undefined &&
        secondComponentValueInModel === undefined
      ) {
        addTrueFalse();
        handleUndefUndef();
      }

      function addTrueFalse() {
        if (!nodeOpenPossibilities) {
          model[nodeString].openPossibilities = [[true, false]];
          nodeOpenPossibilities = model[nodeString].openPossibilities;
        }
      }

      function handleUndefUndef() {
        if (
          nodeOpenPossibilities &&
          arrayIncludesArray(nodeOpenPossibilities, [true, false])
        ) {
          let currentPossibilityIdx = indexOfArray(nodeOpenPossibilities, [
            true,
            false,
          ]);
          nodeOpenPossibilities.splice(currentPossibilityIdx, 1);
          nodeOpenPossibilities.push([false, true]);
          model[nodeString].snapshot = merge({}, model);
          model[firstComponentString] = { truthValue: true };
          model[secondComponentString] = { truthValue: false };
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
          model[firstComponentString] = { truthValue: false };
          model[secondComponentString] = { truthValue: true };
        } else {
          handleInconsistency();
        }
      }
    }

    function handleNodeTrue() {
      if (
        (firstComponentValueInModel === true &&
          secondComponentValueInModel === false) ||
        (firstComponentValueInModel === false &&
          secondComponentValueInModel === true)
      ) {
        handleInconsistency();
      } else if (
        firstComponentValueInModel === true &&
        secondComponentValueInModel === undefined
      ) {
        model[secondComponentString] = { truthValue: true };
      } else if (
        firstComponentValueInModel === undefined &&
        secondComponentValueInModel === true
      ) {
        model[firstComponentString] = { truthValue: true };
      } else if (
        firstComponentValueInModel === false &&
        secondComponentValueInModel === undefined
      ) {
        model[secondComponentString] = { truthValue: false };
      } else if (
        firstComponentValueInModel === undefined &&
        secondComponentValueInModel === false
      ) {
        model[firstComponentString] = { truthValue: false };
      } else if (
        firstComponentValueInModel === undefined &&
        secondComponentValueInModel === undefined
      ) {
        addTrueTrue();
        handleUndefUndef();
      }

      function addTrueTrue() {
        if (!nodeOpenPossibilities) {
          model[nodeString].openPossibilities = [[true, true]];
          nodeOpenPossibilities = model[nodeString].openPossibilities;
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
          nodeOpenPossibilities.push([false, false]);
          model[nodeString].snapshot = merge({}, model);
          model[firstComponentString] = { truthValue: true };
          model[secondComponentString] = { truthValue: true };
        } else if (
          nodeOpenPossibilities &&
          arrayIncludesArray(nodeOpenPossibilities, [false, false])
        ) {
          let currentPossibilityIdx = indexOfArray(nodeOpenPossibilities, [
            false,
            false,
          ]);
          nodeOpenPossibilities.splice(currentPossibilityIdx, 1);
          model[nodeString].snapshot = merge({}, model);
          model[firstComponentString] = { truthValue: false };
          model[secondComponentString] = { truthValue: false };
        } else {
          handleInconsistency();
        }
      }
    }
  }

  function handleIf() {
    firstComponentString = node.children[0].stringify();
    secondComponentString = node.children[1].stringify();
    firstComponentValueInModel = undefined;
    secondComponentValueInModel = undefined;
    if (model[firstComponentString] !== undefined) {
      firstComponentValueInModel = model[firstComponentString].truthValue;
    }
    if (model[secondComponentString] !== undefined) {
      secondComponentValueInModel = model[secondComponentString].truthValue;
    }
    if (model[nodeString] !== undefined) {
      nodeOpenPossibilities = model[nodeString].openPossibilities;
    }
    if (!nodeValueInModel) {
      handleNodeFalse();
    } else {
      if (
        firstComponentValueInModel === false &&
        secondComponentValueInModel === false
      ) {
        handleInconsistency();
      } else if (
        firstComponentValueInModel === false &&
        secondComponentValueInModel === undefined
      ) {
        addFalseTrue();
        handleFalseUndef();
      } else if (
        firstComponentValueInModel === undefined &&
        secondComponentValueInModel === false
      ) {
        model[firstComponentString] = { truthValue: false };
      } else if (
        firstComponentValueInModel === true &&
        secondComponentValueInModel === undefined
      ) {
        model[firstComponentString] = { truthValue: true };
      } else if (
        firstComponentValueInModel === undefined &&
        secondComponentValueInModel === true
      ) {
        addTrueTrue();
        handleUndefTrue();
      } else if (
        firstComponentValueInModel === undefined &&
        secondComponentValueInModel === undefined
      ) {
        addTrueTrue();
        handleUndefUndef();
      }
    }

    function handleNodeFalse() {
      if (
        firstComponentValueInModel === false ||
        secondComponentValueInModel === true
      ) {
        handleInconsistency();
      } else {
        model[firstComponentString] = { truthValue: true };
        model[secondComponentString] = { truthValue: false };
      }
    }

    function addTrueTrue() {
      if (!nodeOpenPossibilities) {
        model[nodeString].openPossibilities = [[true, true]];
        nodeOpenPossibilities = model[nodeString].openPossibilities;
      }
    }

    function addFalseTrue() {
      if (!nodeOpenPossibilities) {
        model[nodeString].openPossibilities = [[false, true]];
        nodeOpenPossibilities = model[nodeString].openPossibilities;
      }
    }

    function handleFalseUndef() {
      if (
        nodeOpenPossibilities &&
        arrayIncludesArray(nodeOpenPossibilities, [false, true])
      ) {
        let currentPossibilityIdx = indexOfArray(nodeOpenPossibilities, [
          false,
          true,
        ]);
        nodeOpenPossibilities.splice(currentPossibilityIdx, 1);
        nodeOpenPossibilities.push([false, false]);
        model[nodeString].snapshot = merge({}, model);
        model[firstComponentString] = { truthValue: true };
      } else if (
        nodeOpenPossibilities &&
        arrayIncludesArray(nodeOpenPossibilities, [false, false])
      ) {
        let currentPossibilityIdx = indexOfArray(nodeOpenPossibilities, [
          false,
          false,
        ]);
        nodeOpenPossibilities.splice(currentPossibilityIdx, 1);
        model[nodeString].snapshot = merge({}, model);
        model[firstComponentString] = { truthValue: false };
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
        model[firstComponentString] = { truthValue: true };
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
        model[firstComponentString] = { truthValue: false };
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
        nodeOpenPossibilities.push([false, true]);
        nodeOpenPossibilities.push([false, false]);
        model[nodeString].snapshot = merge({}, model);
        model[firstComponentString] = { truthValue: true };
        model[secondComponentString] = { truthValue: true };
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
        model[firstComponentString] = { truthValue: false };
        model[secondComponentString] = { truthValue: true };
      } else if (
        nodeOpenPossibilities &&
        arrayIncludesArray(nodeOpenPossibilities, [false, false])
      ) {
        let currentPossibilityIdx = indexOfArray(nodeOpenPossibilities, [
          false,
          false,
        ]);
        nodeOpenPossibilities.splice(currentPossibilityIdx, 1);
        model[nodeString].snapshot = merge({}, model);
        model[firstComponentString] = { truthValue: false };
        model[secondComponentString] = { truthValue: false };
      } else {
        handleInconsistency();
      }
    }
  }

  function findClosestNodeAndIdxWithOpenPossibilities() {
    for (let j = i; j >= 0; j--) {
      let current = wff.nthNode(j);
      if (['O', 'X', 'B', 'A', 'T'].includes(current.value)) {
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
