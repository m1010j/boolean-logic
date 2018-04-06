jest.unmock('../boolean-logic.js');
jest.unmock('../src/class_definition.js');
jest.unmock('../src/class_util.js');
jest.unmock('../src/short_truth_table_util.js');

import Logic, { isTrue, isSat, normalize, reduce } from '../boolean-logic.js';

describe('isTrue', () => {
  describe('when given a string', () => {
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
  });
  describe('when given an array', () => {
    it('correctly evaluates wff', () => {
      expect(isTrue(['N', '1'], { 1: false })).toBe(true);
    });
    it("returns undefined for arguments that aren't well-formed", () => {
      expect(isTrue(['A', 't'])).toBe(undefined);
    });
    it('throws error for arguments that contain unknown vocabulary', () => {
      function error() {
        isTrue(['t', 'C', 't']);
      }
      expect(error).toThrow(
        "Argument can only contain 'N', 'A', 'O', 'T', 'B', 'X', '(', ')', 't', 'f', and numerals (strings of integers)"
      );
    });
  });
  it("throws error for arguments that aren't strings or arrays", () => {
    function error() {
      isTrue({});
    }
    expect(error).toThrow('Argument must be either a string or an array');
  });
});

describe('isSat', () => {
  describe('when given a string', () => {
    describe('when not asked to return model', () => {
      describe('when not asked to use brute force', () => {
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
      });
      describe('when asked to use brute force', () => {
        it('behaves the same way', () => {
          expect(isSat('t', false, true)).toBe(true);
          expect(isSat('f', false, true)).toBe(false);
          expect(isSat('1', false, true)).toBe(true);
          expect(isSat('12', false, true)).toBe(true);
          expect(isSat('1AN1', false, true)).toBe(false);
          expect(isSat(['N', 'N', 't'], false, true)).toBe(true);
          expect(isSat('At', false, true)).toBe(undefined);
          function error() {
            isSat('tCt', false, true);
          }
          expect(error).toThrow(
            "Argument can only contain 'N', 'A', 'O', 'T', 'B', 'X', '(', ')', 't', 'f', and numerals (strings of integers)"
          );
        });
      });
    });
    describe('when asked to return model', () => {
      it('returns model in which the argument is true', () => {
        expect(isTrue('(1A2A3)X4', isSat('(1A2A3)X4', true))).toEqual(true);
      });
    });
  });
  describe('when given an array', () => {
    describe('when not asked to return model', () => {
      it('correctly evaluates argument', () => {
        expect(isSat(['N', 'N', 't'])).toBe(true);
      });
      it("returns undefined for arguments that aren't well-formed", () => {
        expect(isSat(['A', 't'])).toBe(undefined);
      });
      it('throws error for arguments that contain unknown vocabulary', () => {
        function error() {
          isSat(['t', 'C', 't']);
        }
        expect(error).toThrow(
          "Argument can only contain 'N', 'A', 'O', 'T', 'B', 'X', '(', ')', 't', 'f', and numerals (strings of integers)"
        );
      });
    });
    describe('when asked to return model', () => {
      it('returns model in which the argument is true', () => {
        expect(
          isTrue(
            ['(', '1', 'A', '2', 'A', '3', ')', 'X', '4'],
            isSat(['(', '1', 'A', '2', 'A', '3', ')', 'X', '4'], true)
          )
        ).toEqual(true);
      });
    });
  });
  it("throws error for arguments that aren't strings or arrays", () => {
    function error() {
      isSat({});
    }
    expect(error).toThrow('Argument must be either a string or an array');
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
      expect(error).toThrow(
        "Argument can only contain 'N', 'A', 'O', 'T', 'B', 'X', '(', ')', 't', 'f', and numerals (strings of integers)"
      );
    });
  });
  describe('when given an array', () => {
    it('returns an array with missing parentheses added', () => {
      expect(normalize(['N', 'N', '1'])).toEqual([
        '(',
        'N',
        '(',
        'N',
        '1',
        ')',
        ')',
      ]);
    });
    it('throws error for arguments that contain unknown vocabulary', () => {
      function error() {
        normalize(['t', 'C', 't']);
      }
      expect(error).toThrow(
        "Argument can only contain 'N', 'A', 'O', 'T', 'B', 'X', '(', ')', 't', 'f', and numerals (strings of integers)"
      );
    });
  });
  it("throws error for arguments that aren't strings or arrays", () => {
    function error() {
      normalize({});
    }
    expect(error).toThrow('Argument must be either a string or an array');
  });
});

describe('reduce', () => {
  describe('when given a string', () => {
    it('returns an equivalent string containing only negations and disjunctions', () => {
      expect(reduce('(N1)')).toEqual('(N1)');
      expect(reduce('(1O2)')).toEqual('(1O2)');
      expect(reduce('(1A2)')).toEqual('(N((N1)O(N2)))');
      expect(reduce('(1X2)')).toEqual('(N((N(1O2))O(N(N(N((N1)O(N2)))))))');
      expect(reduce('(1T2)')).toEqual('((N1)O2)');
      expect(reduce('(1B2)')).toEqual('(N((N((N1)O2))O(N((N2)O1))))');
    });
    it("returns undefined for arguments that aren't well-formed", () => {
      expect(reduce('((1A2)A)')).toEqual(undefined);
    });
    it('throws error for arguments that contain unknown vocabulary', () => {
      function error() {
        reduce('tCt');
      }
      expect(error).toThrow(
        "Argument can only contain 'N', 'A', 'O', 'T', 'B', 'X', '(', ')', 't', 'f', and numerals (strings of integers)"
      );
    });
  });
  describe('when given an array', () => {
    it('returns an array with missing parentheses added', () => {
      expect(reduce(['(', 'N', '1', ')'])).toEqual(['(', 'N', '1', ')']);
    });
    it('throws error for arguments that contain unknown vocabulary', () => {
      function error() {
        reduce(['t', 'C', 't']);
      }
      expect(error).toThrow(
        "Argument can only contain 'N', 'A', 'O', 'T', 'B', 'X', '(', ')', 't', 'f', and numerals (strings of integers)"
      );
    });
  });
  it("throws error for arguments that aren't strings or arrays", () => {
    function error() {
      reduce({});
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
  it("has a 'normalize' property", () => {
    expect(Logic.normalize).toBeTruthy();
  });
  it("has a 'reduce' property", () => {
    expect(Logic.reduce).toBeTruthy();
  });
});
