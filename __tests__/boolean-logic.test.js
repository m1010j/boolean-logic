jest.unmock('../boolean-logic.js');

import Logic, { isTrue, isSat } from '../boolean-logic.js';

describe('isTrue', () => {
  it("evauates 't' to true without a model", () => {
    expect(isTrue('t')).toBe(true);
  });
  it("evauates 't' to true with an arbitrary model", () => {
    expect(isTrue('t', { t: false })).toBe(true);
  });
  it("evauates 'f' to false without a model", () => {
    expect(isTrue('f')).toBe(false);
  });
  it("evauates 't' to false with an arbitrary model", () => {
    expect(isTrue('f', { t: true })).toBe(false);
  });
  it("evauates '1' to undefined without a model", () => {
    expect(isTrue('1')).toBe(undefined);
  });
  it("evauates '1' to the value specified by the model", () => {
    expect(isTrue('1', { 1: true })).toBe(true);
  });
  it("evauates '12' to undefined without a model", () => {
    expect(isTrue('12')).toBe(undefined);
  });
  it("evauates '12' to the value specified by the model", () => {
    expect(isTrue('12', { 12: false })).toBe(false);
  });
  it("evauates '1' to undefined with a corrupt model", () => {
    expect(isTrue('1', { 1: 'corrupt' })).toBe(undefined);
  });
  it('correctly evauates negations', () => {
    expect(isTrue('(Nt)')).toBe(false);
    expect(isTrue('(Nf)')).toBe(true);
  });
  it('correctly evauates conjunctions', () => {
    expect(isTrue('(tAt)')).toBe(true);
    expect(isTrue('(tAf)')).toBe(false);
    expect(isTrue('(fAt)')).toBe(false);
    expect(isTrue('(fAf)')).toBe(false);
  });
  it('correctly evauates inclusive disjunctions', () => {
    expect(isTrue('(tOt)')).toBe(true);
    expect(isTrue('(tOf)')).toBe(true);
    expect(isTrue('(fOt)')).toBe(true);
    expect(isTrue('(fOf)')).toBe(false);
  });
  it('correctly evauates exclusive disjunctions', () => {
    expect(isTrue('(tXt)')).toBe(false);
    expect(isTrue('(tXf)')).toBe(true);
    expect(isTrue('(fXt)')).toBe(true);
    expect(isTrue('(fXf)')).toBe(false);
  });
  it('correctly evauates conditionals', () => {
    expect(isTrue('(tTt)')).toBe(true);
    expect(isTrue('(tTf)')).toBe(false);
    expect(isTrue('(fTt)')).toBe(true);
    expect(isTrue('(fTf)')).toBe(true);
  });
  it('correctly evauates biconditionals', () => {
    expect(isTrue('(tBt)')).toBe(true);
    expect(isTrue('(tBf)')).toBe(false);
    expect(isTrue('(fBt)')).toBe(false);
    expect(isTrue('(fBf)')).toBe(true);
  });
  it('allows dropping outer parentheses', () => {
    expect(isTrue('Nf')).toBe(true);
  });
  it('allows stacking identical connectives without parentheses (except for conditionals)', () => {
    expect(isTrue('NNt')).toBe(true);
    expect(isTrue('tAtAt')).toBe(true);
    expect(isTrue('tOtOt')).toBe(true);
    expect(isTrue('tXfXf')).toBe(true);
    expect(isTrue('tBtBt')).toBe(true);
  });
  it('also takes arrays of strings as arguments', () => {
    expect(isTrue(['N', 'N', 't'])).toBe(true);
  });
  it("returns undefined for strings that aren't well-formed", () => {
    expect(isTrue('At')).toBe(undefined);
  });
  it('returns undefined for strings that contain unknown vocabulary', () => {
    function error() {
      isTrue('tCt');
    }
    expect(error).toThrow(
      "Argument can only contain 'N', 'A', 'O', 'T', 'B', 'X', '(', ')', 't', 'f', and numerals (strings of integers)"
    );
  });
  it("throws error for arguments that aren't strings or arrays", () => {
    function error() {
      isTrue({});
    }
    expect(error).toThrow('Argument must be either a string or an array');
  });
});

describe('isSat', () => {
  it("evauates 't' to satisfiable", () => {
    expect(isSat('t')).toBe(true);
  });
  it("evauates 'f' to unsatisfiable", () => {
    expect(isSat('f')).toBe(false);
  });
  it("evauates '1' to satisfiable", () => {
    expect(isSat('1')).toBe(true);
  });
  it("evauates '12' to satisfiable", () => {
    expect(isSat('12')).toBe(true);
  });
  it("evauates '1ON1' to unsatisfiable", () => {
    expect(isSat('1AN1')).toBe(false);
  });
  it('also takes arrays of strings as arguments', () => {
    expect(isSat(['N', 'N', 't'])).toBe(true);
  });
  it("returns undefined for strings that aren't well-formed", () => {
    expect(isSat('At')).toBe(undefined);
  });
  it('returns undefined for strings that contain unknown vocabulary', () => {
    function error() {
      isSat('tCt');
    }
    expect(error).toThrow(
      "Argument can only contain 'N', 'A', 'O', 'T', 'B', 'X', '(', ')', 't', 'f', and numerals (strings of integers)"
    );
  });
  it("throws error for arguments that aren't strings or arrays", () => {
    function error() {
      isSat({});
    }
    expect(error).toThrow('Argument must be either a string or an array');
  });
});

describe('Logic', () => {
  it("has an 'isTrue' property", () => {
    expect(Logic.isTrue).toBeTruthy();
  });
  it("has an 'isSat' property", () => {
    expect(Logic.isSat).toBeTruthy();
  });
});
