jest.unmock('lodash');
jest.unmock('../boolean-logic.js');
jest.unmock('../src/class_definition.js');
jest.unmock('../src/class_util.js');
jest.unmock('../src/short_truth_table_util.js');

import Logic, {
  isTrue,
  isSat,
  isValid,
  counterModel,
  normalize,
  reduce,
} from '../boolean-logic.js';

describe('isTrue', () => {
  describe('when given a string', () => {
    it("evaluates 't' to true without a model", () => {
      expect(isTrue('t')).toBe(true);
    });
    it("evaluates 't' to true with an arbitrary model", () => {
      expect(isTrue('t', { t: false })).toBe(true);
    });
    it("evaluates 'f' to false without a model", () => {
      expect(isTrue('f')).toBe(false);
    });
    it("evaluates 't' to false with an arbitrary model", () => {
      expect(isTrue('f', { t: true })).toBe(false);
    });
    it("evaluates '1' to undefined without a model", () => {
      expect(isTrue('1')).toBe(undefined);
    });
    it("evaluates '1' to the value specified by the model", () => {
      expect(isTrue('1', { 1: true })).toBe(true);
    });
    it("evaluates '12' to undefined without a model", () => {
      expect(isTrue('12')).toBe(undefined);
    });
    it("evaluates '12' to the value specified by the model", () => {
      expect(isTrue('12', { 12: false })).toBe(false);
    });
    it("evaluates '1' to undefined with a corrupt model", () => {
      expect(isTrue('1', { 1: 'corrupt' })).toBe(undefined);
    });
    it('correctly evaluates negations', () => {
      expect(isTrue('(Nt)')).toBe(false);
      expect(isTrue('(Nf)')).toBe(true);
    });
    it('correctly evaluates conjunctions', () => {
      expect(isTrue('(tAt)')).toBe(true);
      expect(isTrue('(tAf)')).toBe(false);
      expect(isTrue('(fAt)')).toBe(false);
      expect(isTrue('(fAf)')).toBe(false);
    });
    it('correctly evaluates inclusive disjunctions', () => {
      expect(isTrue('(tOt)')).toBe(true);
      expect(isTrue('(tOf)')).toBe(true);
      expect(isTrue('(fOt)')).toBe(true);
      expect(isTrue('(fOf)')).toBe(false);
    });
    it('correctly evaluates exclusive disjunctions', () => {
      expect(isTrue('(tXt)')).toBe(false);
      expect(isTrue('(tXf)')).toBe(true);
      expect(isTrue('(fXt)')).toBe(true);
      expect(isTrue('(fXf)')).toBe(false);
    });
    it('correctly evaluates conditionals', () => {
      expect(isTrue('(tTt)')).toBe(true);
      expect(isTrue('(tTf)')).toBe(false);
      expect(isTrue('(fTt)')).toBe(true);
      expect(isTrue('(fTf)')).toBe(true);
    });
    it('correctly evaluates biconditionals', () => {
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
        it("evaluates 't' to satisfiable", () => {
          expect(isSat('t')).toBe(true);
        });
        it("evaluates 'f' to unsatisfiable", () => {
          expect(isSat('f')).toBe(false);
        });
        it("evaluates '1' to satisfiable", () => {
          expect(isSat('1')).toBe(true);
        });
        it("evaluates '12' to satisfiable", () => {
          expect(isSat('12')).toBe(true);
        });
        it('evaluates a more complex wff as to satisfiable', () => {
          expect(
            isSat(
              '(((6O1)B4)A(N(N(N(((13O1)B(7T(((14B5)X(1B10))T3)))O((9X5)O7))))))'
            )
          ).toBe(true);
        });
        it("evaluates '1ON1' to unsatisfiable", () => {
          expect(isSat('1AN1')).toBe(false);
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
          expect(
            isSat(
              '(((6O1)B4)A(N(N(N(((13O1)B(7T(((14B5)X(1B10))T3)))O((9X5)O7))))))',
              false,
              true
            )
          ).toBe(true);
          expect(isSat('1AN1', false, true)).toBe(false);
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
  describe('when given an array of strings', () => {
    describe('when not asked to return model', () => {
      it('correctly evaluates conjunction of strings', () => {
        expect(isSat(['1', '2'])).toBe(true);
      });
      describe('when asked to return model', () => {
        it('returns model in which the conjunction of strings is true', () => {
          expect(isTrue('1A2', isSat(['1', '2'], true))).toEqual(true);
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
});

describe('isValid', () => {
  describe('when not asked to use brute force', () => {
    describe('when given a single wff string', () => {
      it('correctly evaluates logical truths', () => {
        expect(isValid('1ON1')).toEqual(true);
      });
      it("correctly evaluates wffs that aren't logical truths", () => {
        expect(isValid('1ON2')).toEqual(false);
      });
    });
    describe('when given two wff strings', () => {
      it('returns false valid arguments', () => {
        expect(isValid(['1', '1'])).toEqual(true);
      });
      it('returns a countermodel for invalid arguments', () => {
        expect(isValid(['1', '2'])).toEqual(false);
      });
    });
    describe('when given an array of wff strings and a wff string', () => {
      it('returns false valid arguments', () => {
        expect(isValid([['1', '1T2'], '2'])).toEqual(true);
      });
      it('returns a countermodel for invalid arguments', () => {
        expect(isValid([['1', '1T2'], '3'])).toEqual(false);
      });
    });
    describe('when given a wff string and an array of wff strings', () => {
      it('returns false valid arguments', () => {
        expect(isValid(['2', ['1', '2']])).toEqual(true);
      });
      it('returns a countermodel for invalid arguments', () => {
        expect(isValid(['0', ['1', '2']])).toEqual(false);
      });
    });
    describe('when given two arrays of wff strings', () => {
      it('returns false valid arguments', () => {
        expect(isValid([['1', '3'], ['1', '2']])).toEqual(true);
      });
      it('returns a countermodel for invalid arguments', () => {
        expect(isValid([['3', '4'], ['1', '2']])).toEqual(false);
      });
    });
    describe('when given an empty array as the first argument', () => {
      it('treats the premise as verum', () => {
        expect(isValid([[], ['1ON1']])).toEqual(true);
        expect(isValid([[], '1ON1'])).toEqual(true);
        expect(isValid([[], ['1ON2']])).toEqual(false);
        expect(isValid([[], '1ON2'])).toEqual(false);
      });
    });
    describe('when given an empty array as the second argument', () => {
      it('treats the conclusion as falsum', () => {
        expect(isValid([['1AN1'], []])).toEqual(true);
        expect(isValid(['1AN1', []])).toEqual(true);
        expect(isValid([['1AN2'], []])).toEqual(false);
        expect(isValid(['1AN2', []])).toEqual(false);
      });
    });
  });
  describe('when asked to use brute force', () => {
    it('behaves the same way', () => {
      expect(isValid('1ON1', true)).toEqual(true);
      expect(isValid('1ON2', true)).toEqual(false);
      expect(isValid(['1', '1'], true)).toEqual(true);
      expect(isValid(['1', '2'], true)).toEqual(false);
      expect(isValid([['1', '1T2'], '2'], true)).toEqual(true);
      expect(isValid([['1', '1T2'], '3'], true)).toEqual(false);
      expect(isValid(['2', ['1', '2']], true)).toEqual(true);
      expect(isValid(['0', ['1', '2']], true)).toEqual(false);
      expect(isValid([['1', '3'], ['1', '2']], true)).toEqual(true);
      expect(isValid([['3', '4'], ['1', '2']], true)).toEqual(false);
      expect(isValid([[], ['1ON1']], true)).toEqual(true);
      expect(isValid([[], '1ON1'], true)).toEqual(true);
      expect(isValid([[], ['1ON2']], true)).toEqual(false);
      expect(isValid([[], '1ON2'], true)).toEqual(false);
      expect(isValid([['1AN1'], []], true)).toEqual(true);
      expect(isValid(['1AN1', []], true)).toEqual(true);
      expect(isValid([['1AN2'], []], true)).toEqual(false);
      expect(isValid(['1AN2', []], true)).toEqual(false);
    });
  });
});

describe('counterModel', () => {
  describe('when not asked to use brute force', () => {
    describe('when given a single wff string', () => {
      it('returns a countermodel for invalid arguments', () => {
        expect(!isTrue('1ON2', counterModel('1ON2'))).toEqual(true);
        expect(!isTrue('1T2', counterModel(['1', '2']))).toEqual(true);
        expect(
          !isTrue('(1A(1T2))T3', counterModel([['1', '1T2'], '3']))
        ).toEqual(true);
        expect(!isTrue('3T(1O2)', counterModel(['3', ['1', '2']]))).toEqual(
          true
        );
        expect(
          !isTrue('(3A4)T(1O2)', counterModel([['3', '4'], ['1', '2']]))
        ).toEqual(true);
        expect(!isTrue('tT(1ON2)', counterModel([[], ['1ON2']]))).toEqual(true);
        expect(!isTrue('tT1ON2', counterModel([[], '1ON2']))).toEqual(true);
        expect(!isTrue('(1AN2)Tf', counterModel([['1AN2'], []]))).toEqual(true);
        expect(!isTrue('(1AN2)Tf', counterModel(['1AN2', []]))).toEqual(true);
      });
      it('returns false for valid arguments', () => {
        expect(counterModel('1ON1')).toEqual(false);
        expect(counterModel(['1', '1'])).toEqual(false);
        expect(counterModel(['2', ['1', '2']])).toEqual(false);
        expect(counterModel([['1', '3'], ['1', '2']])).toEqual(false);
        expect(counterModel([['1AN1'], []])).toEqual(false);
        expect(counterModel(['1AN1', []])).toEqual(false);
        expect(counterModel([[], ['1ON1']])).toEqual(false);
        expect(counterModel([[], '1ON1'])).toEqual(false);
        expect(counterModel([['1', '1T2'], '2'])).toEqual(false);
      });
    });
  });
  describe('when asked to use brute force', () => {
    it('behaves the same way', () => {
      expect(!isTrue('1ON2', counterModel('1ON2', true))).toEqual(true);
      expect(!isTrue('1T2', counterModel(['1', '2'], true))).toEqual(true);
      expect(
        !isTrue('(1A(1T2))T3', counterModel([['1', '1T2'], '3'], true))
      ).toEqual(true);
      expect(!isTrue('3T(1O2)', counterModel(['3', ['1', '2']], true))).toEqual(
        true
      );
      expect(
        !isTrue('(3A4)T(1O2)', counterModel([['3', '4'], ['1', '2']], true))
      ).toEqual(true);
      expect(!isTrue('tT(1ON2)', counterModel([[], ['1ON2']], true))).toEqual(
        true
      );
      expect(!isTrue('tT1ON2', counterModel([[], '1ON2'], true))).toEqual(true);
      expect(!isTrue('(1AN2)Tf', counterModel([['1AN2'], []], true))).toEqual(
        true
      );
      expect(!isTrue('(1AN2)Tf', counterModel(['1AN2', []], true))).toEqual(
        true
      );
    });
    expect(counterModel('1ON1', true)).toEqual(false);
    expect(counterModel(['1', '1'], true)).toEqual(false);
    expect(counterModel(['2', ['1', '2']], true)).toEqual(false);
    expect(counterModel([['1', '3'], ['1', '2']], true)).toEqual(false);
    expect(counterModel([['1AN1'], []], true)).toEqual(false);
    expect(counterModel(['1AN1', []], true)).toEqual(false);
    expect(counterModel([[], ['1ON1']], true)).toEqual(false);
    expect(counterModel([[], '1ON1'], true)).toEqual(false);
    expect(counterModel([['1', '1T2'], '2'], true)).toEqual(false);
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
  it("has an 'isValid' property", () => {
    expect(Logic.isValid).toBeTruthy();
  });
  it("has an 'counterModel' property", () => {
    expect(Logic.counterModel).toBeTruthy();
  });
  it("has a 'normalize' property", () => {
    expect(Logic.normalize).toBeTruthy();
  });
  it("has a 'reduce' property", () => {
    expect(Logic.reduce).toBeTruthy();
  });
});
