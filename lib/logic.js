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

Logic.prototype.isTrue = function(model) {
  model = model || {};
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

export default Logic;
