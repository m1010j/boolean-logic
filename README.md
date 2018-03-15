# `boolean-logic`

## A lightweight package for evaluating formulas of Boolean logic

### Overview

The `boolean-logic` package allows well-formed formulas, represented either as strings or as arrays of strings, to be evaluated for truth or falsity using the `isTrue` function and for satisfiability using the `isSat` function. The default object exported by `boolean-logic` contains `isTrue` and `isSat` as properties.

### Well-formed formulas

A string is considered a well-formed formula (wff) if is obtained from the following rules:

* **Atomic sentences**: `'t'`, `'f'`, `'1'`, `'2'`, `'3'`, ...
* **Complex sentences**: If `p` and `q` are wffs, then `` `(N${p})` ``, `` `(${p}A${q})` ``, `` `(${p}O${q})` ``, `` `(${p}X${q})` ``, `` `(${p}T${q})` ``, `` `(${p}B${q})` `` are wffs as well.

In other words, `'t'` and `'f'` are atomic sentences&mdash;`'t'` is always true, `'f'` always false&mdash;and numerals are atomic sentences (i.e.`` `${n}` ``, for `n` an integer). `'N'` is the only unary connective; it is interpreted as negation. `'A'`, `'O'`, `'X'`, `'T'`, and `'B'` are binary connectives; they are interpreted as conjunction, inclusive disjunction, exclusive disjunction, the material conditional, and the material biconditional.

As is usual, outer parentheses can be dropped, as can parentheses that are used to stack identical connectives (with the exception of `'T'`). So, if `` `(${p})` `` is a wff, then so is `p`; and if `p`, `q`, and `r` are wffs, then so are `` `(NN${p})` ``, `` `(${p}A${q}A${R})` ``, `` `(${p}O${q}O${R})` ``, `` `(${p}X${q}X${R})` ``, and `` `(${p}B${q}B${R})` ``.

For `array` an array of strings, `array` is a wff if `array.join('')` is a wff.

`isTrue` and `isSat` return `undefined` for strings or arrays that are not well-formed but that are composed of the above vocabulary return `undefined`. `isTrue` and `isSat` throw an error for arguments other than strings or arrays, as well as for arguments that are composed of strings that aren't included in the above vocabulary.

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
isSat(wff);
```

##### Parameters

`wff`: The wff to be evaluated.

##### Return value

`true`, `false`, or `undefined` (if `wff` isn't well-formed).

### Examples

```javascript
import { isTrue, isSat } from 'boolean-logic';

isTrue('t'); // true
isTrue('f'); // false
isTrue('1'); // undefined
isTrue('1', { 1: true }); // true
isTrue('(1A2)', { 1: true, 2: false }); // false
isTrue(['(', '1', 'A', '2', ')'], { 1: true, 2: false }); // false

isSat('t'); // true
isSat('f'); // false
isSat('1'); // true
isSat(['(', '1', 'A', 'N', '1', ')']); // false

isTrue('At'); // undefined
isSat('A1'); // undefined
```

The educational logic game [Andor](http://www.andor.fun) is powered by the `boolean-logic` package.

### [Contributing](./CONTRIBUTING.md)

### [License](./LICENSE)
