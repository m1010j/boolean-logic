jest.unmock('../boolean-logic.js');

import Logic, { isTrue, isSat, normalize } from '../boolean-logic.js';

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
  it("returns undefined for arguments that aren't well-formed", () => {
    expect(isTrue('At')).toBe(undefined);
  });
  it('throws error for arguments that contain unknown vocabulary', () => {
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
  describe('when not asked to return model', () => {
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
    it("returns undefined for arguments that aren't well-formed", () => {
      expect(isSat('At')).toBe(undefined);
    });
    it('throws error for arguments that contain unknown vocabulary', () => {
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
  describe('when asked to return model', () => {
    it('returns model in which the argument is true', () => {
      expect(isSat('(1A2A3)X4', true)).toEqual({
        1: false,
        2: true,
        3: true,
        4: true,
      });
    });
  });
});

describe('normalize', () => {
  describe('when given a string', () => {
    it('returns a string with missing parentheses added', () => {
      expect(normalize('NN1')).toEqual('(N(N1))');
      expect(normalize('1A2A3')).toEqual('(1A(2A3))');
    });
    it('returns original string if no parentheses missing', () => {
      expect(normalize('((1A2)A3)')).toEqual('((1A2)A3)');
    });
    it("returns undefined for arguments that aren't well-formed", () => {
      expect(normalize('((1A2)A)')).toEqual(undefined);
    });
    it('throws error for arguments that contain unknown vocabulary', () => {
      function error() {
        normalize('tCt');
      }
      expect(error).toThrow("Argument can only contain 'N', 'A', 'O', 'T', 'B', 'X', '(', ')', 't', 'f', and numerals (strings of integers)");
    });
    it("throws error for arguments that aren't strings or arrays", () => {
      function error() {
        normalize({});
      }
      expect(error).toThrow('Argument must be either a string or an array');
    });
  });
  describe('when given an array', () => {
    it('returns an array with missing parentheses added', () => {
      expect(normalize([
          'N',
          'N',
          '1',
        ])).toEqual(['(', 'N', '(', 'N', '1', ')', ')']);
    });
    it('throws error for arguments that contain unknown vocabulary', () => {
      function error() {
        normalize(['t', 'C', 't']);
      }
      expect(error).toThrow("Argument can only contain 'N', 'A', 'O', 'T', 'B', 'X', '(', ')', 't', 'f', and numerals (strings of integers)");
    });
  });
})

describe('Logic', () => {
  it("has an 'isTrue' property", () => {
    expect(Logic.isTrue).toBeTruthy();
  });
  it("has an 'isSat' property", () => {
    expect(Logic.isSat).toBeTruthy();
  });
  it("has a 'normalize' property", () => {
    expect(Logic.normalize).toBeTruthy();
  });
});
