import Logic from './src/class_util';

Logic.isTrue = function(wff, model) {
  const parsed = Logic._parse(wff);
  if (!parsed) {
    return;
  }
  return parsed.isTrue(model);
};

Logic.isSat = function(wff, returnModel, bruteForce) {
  const parsedWff = Logic._parse(wff);
  if (!parsedWff) {
    return;
  }
  if (bruteForce) {
    const models = this._generateModels(wff);
    return this._checkModels(parsedWff, models, returnModel);
  } else {
    const model = parsedWff.supposeTrue();
    if (model) {
      if (returnModel) {
        return model;
      } else {
        return true;
      }
    } else {
      return false;
    }
  }
};

Logic.isValid = function(wff, returnModel, bruteForce) {
  if (wff[0] !== '(') {
    return this.isSat(wff, returnModel, bruteForce);
  }
};

Logic.normalize = function(wff) {
  const parsed = Logic._parse(wff);
  if (!parsed) {
    return;
  }
  const normalizedString = parsed.stringify();
  if (typeof wff === 'string') {
    return normalizedString;
  } else if (wff instanceof Array) {
    return this._parseString(normalizedString);
  }
};

Logic.reduce = function(wff) {
  const parsed = Logic._parse(wff);
  if (!parsed) {
    return;
  }
  const reducedString = parsed.reduce().stringify();
  if (typeof wff === 'string') {
    return reducedString;
  } else if (wff instanceof Array) {
    return this._parseString(reducedString);
  }
};

export const isTrue = Logic.isTrue.bind(Logic);

export const isSat = Logic.isSat.bind(Logic);

export const normalize = Logic.normalize.bind(Logic);

export const reduce = Logic.reduce.bind(Logic);

export default Logic;

window.Logic = Logic;
