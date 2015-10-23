"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.randomInt = randomInt;
exports.randomByWeight = randomByWeight;

function randomInt(low, high) {
  return Math.floor(Math.random() * (high - low) + low);
}

function randomByWeight(arr, weightField) {
  var total = arr.reduce(function (sum, item) {
    return sum + item[weightField];
  }, 0);
  var choice = randomInt(0, total);
  var choose = function choose(_x, _x2) {
    var _again = true;

    _function: while (_again) {
      var val = _x,
          index = _x2;
      thisWeight = undefined;
      _again = false;

      var thisWeight = arr[index][weightField];
      if (val < thisWeight) return arr[index];
      _x = val - thisWeight;
      _x2 = index + 1;
      _again = true;
      continue _function;
    }
  };

  return choose(choice, 0);
}