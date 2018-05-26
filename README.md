# `boolean-logic`

## A lightweight package for evaluating formulas of Boolean logic

### Code status

[ ![Codeship Status for m1010j/boolean-logic](https://app.codeship.com/projects/5a9e6f80-33db-0136-62d8-0e66b751bd02/status?branch=master)](https://app.codeship.com/projects/288987)

### Overview

The `boolean-logic` package allows well-formed formulas, represented either as strings or as arrays of strings, to be evaluated for truth or falsity using the `isTrue` function, for satisfiability using the `isSat` function, for validity using the `isValid` function. The `counterModel` function finds counter-models for well-formed formulas that aren't valid. `isSat`, `isValid`, and `counterModel` can also be used to evaluate premise-conclusion arguments. The default object exported by `boolean-logic` contains `isTrue`, `isSat`, `isValid`, and `counterModel` as properties.

### Well-formed formulas

A string is considered a well-formed formula (wff) if is obtained from the following rules:

* **Atomic sentences**: `'t'`, `'f'`, `'1'`, `'2'`, `'3'`, ...
* **Complex sentences**: If `p` and `q` are wffs, then `` `(N${p})` ``, `` `(${p}A${q})` ``, `` `(${p}O${q})` ``, `` `(${p}X${q})` ``, `` `(${p}T${q})` ``, `` `(${p}B${q})` `` are wffs as well.

In other words, `'t'` and `'f'` are atomic sentences&mdash;`'t'` is always true (verum), `'f'` always false (falsum)&mdash;and numerals are atomic sentences (i.e.`` `${n}` ``, for `n` an integer). `'N'` is the only unary connective; it is interpreted as negation. `'A'`, `'O'`, `'X'`, `'T'`, and `'B'` are binary connectives; they are interpreted as conjunction, inclusive disjunction, exclusive disjunction, the material conditional, and the material biconditional.

As is usual, outer parentheses can be dropped, as can parentheses that are used to stack identical connectives (with the exception of `'T'`). So, if `` `(${p})` `` is a wff, then so is `p`; and if `p`, `q`, and `r` are wffs, then so are `` `(NN${p})` ``, `` `(${p}A${q}A${R})` ``, `` `(${p}O${q}O${R})` ``, `` `(${p}X${q}X${R})` ``, and `` `(${p}B${q}B${R})` ``. However, `boolean-logic` also exports a function `normalize` that transforms a wff to a wff with parentheses that meet the strict rules above, and a function `reduce` that returns an equivalent wff containing only negations and disjunctions.

For `array` an array of strings, `array` is a wff if `array.join('')` is a wff.

`isTrue` and `isSat` return `undefined` for strings or arrays that are not well-formed but that are composed of the above vocabulary return `undefined`. `isTrue` and `isSat` throw an error for arguments other than strings or arrays, as well as for arguments that are composed of strings that aren't included in the above vocabulary.

### Premise-conclusion arguments

For `p` and `q` string wffs and `arr1` and `arr2` (possibly empty) arrays of wffs, `[${p}, ${q}]`, `[${arr1}, ${q}]`, `[${p}, ${arr2}]`, `[${arr1}, ${arr2}]` are (premise-conclusion) arguments. When `arr1` or `arr2` are empty, they are treated as equivalent to `t` when they act as premises (the first member of the argument) and as equivalent to `f` when they act as conclusions (the second member of the argument).

### Installation

`npm install boolean-logic`

or

`yarn install boolean-logic`

### Syntax

#### `isTrue()`

```javascript
isTrue(wff[, model]);
```

##### Parameters

`wff`: The wff to be evaluated.

`model` (optional): A plain object mapping numerals to Booleans.

##### Return value

`true`, `false`, or `undefined` (if `wff` contains numerals but `model` is not supplied or `model[wff]` is neither `true` nor `false`, or if `wff` isn't well-formed).

#### `isSat()`

```javascript
isSat(wffs[, returnModel, bruteForce]);
```

##### Parameters

`wffs`: A wff string or array of wff strings to be evaluated.

`returnModel` (optional): A Boolean indicating whether function should return a model or `true` if `wff` is satisfiable. If this parameter isn't supplied, no model will be returned.

`bruteForce` (optional): A Boolean indicating whether satisfiability should be determined by brute force by generating all possible models. Its default value is `true`. If this parameter set to `false`, the short truth table algorithm will be used.

##### Return value

`true`, a plain object mapping numerals to Booleans (if `returnModel === true`), `false`, or `undefined` (if `wff` isn't well-formed).

#### `isValid()`

```javascript
isValid(argument[, bruteForce]);
```

##### Parameters

`argument`: A wff string or argument to be evaluated.

`bruteForce` (optional): A Boolean indicating whether validity should be determined by brute force by generating all possible models. Its default value is `true`. If this parameter set to `false`, the short truth table algorithm will be used.

##### Return value

`true`, `false`, or `undefined` (if `argument` isn't well-formed).

#### `counterModel()`

```javascript
counterModel(argument[, bruteForce]);
```

##### Parameters

`argument`: A wff string or argument to be evaluated.

`bruteForce` (optional): A Boolean indicating whether validity should be determined by brute force by first generating all possible models. If this parameter isn't supplied, the short truth table algorithm will be used.

##### Return value

A plain object mapping numerals to Booleans (if `returnModel === true`), `false` (if `argument` is valid), or `undefined` (if `argument` isn't well-formed).

### Examples

```javascript
import { isTrue, isSat, normalize, reduce } from 'boolean-logic';

isTrue('t'); // true
isTrue('f'); // false
isTrue('1'); // undefined
isTrue('1', { 1: true }); // true
isTrue('(1A2)', { 1: true, 2: false }); // false
isTrue(['(', '1', 'A', '2', ')'], { 1: true, 2: false }); // false

isSat('t'); // true
isSat('f'); // false
isSat('1'); // true
isSat('(1AN1)'); // false
isSat(['1', 'N1']); // false
isSat('(1O2)', true); // { 1: true, 2: true }
isSat('(1O2)', true, true); // { 1: true, 2: true }

isValid('1ON1'); // true
isValid('1ON2'); // false
isValid(['1', '1']); // true
isValid(['1', '2']); // false
isValid([['1', '1T2'], '2']); // true
isValid([['1', '1T2'], '3']); // false
isValid(['2', ['1', '2']]); // true
isValid(['3', ['1', '2']]); // false
isValid([['1', '3'], ['1', '2']]); // true
isValid([['3', '4'], ['1', '2']]); // false
isValid([[], ['1ON1']]); // true
isValid([[], '1ON1']); // true
isValid([[], ['1ON2']]); // false
isValid([[], '1ON2']); // false
isValid([['1AN1'], []]); // true
isValid(['1AN1', []]); // true
isValid([['1AN2'], []]); // false
isValid(['1AN2', []]); // false
isValid('1ON1', true); // true
isValid('1ON2', true); // false

counterModel('1ON2'); // {1: false, 2: true}
counterModel('1ON1'); // false

isTrue('At'); // undefined
isSat('A1'); // undefined
isValid('A1'); // undefined
counterModel('A1'); // undefined

normalize('NN1'); // '(N(N1))'
normalize(['N', 'N', '1']); // ['(', 'N', '(', 'N', '1', ')', ')']

reduce('(1A2)'); // '(N((N1)O(N2)))'
reduce(['(', '1', 'A', '2', ')']); // ['(', 'N', '(', '(', 'N', '1', ')', 'O', '(', 'N', '2', ')', ')', ')']
```

The educational logic game [Andor](http://www.andor.fun) is powered by the `boolean-logic` package.

### [Contributing](./CONTRIBUTING.md)

### [License](./LICENSE)
