"use strict";

export function randomInt (low, high) {
  return Math.floor(Math.random() * (high - low) + low);
}
export function randomByWeight (arr, weightField) {
  let total = arr.reduce((sum, item) => sum + item[weightField], 0);
  let choice = randomInt(0, total);
  let choose = function(val, index) {
    let thisWeight = arr[index][weightField];
    if (val < thisWeight) return arr[index];
    return choose(val - thisWeight, index + 1);
  }

  return choose(choice, 0);
}
