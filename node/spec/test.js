var randomByWeight = require('../dist/lib/util.js').randomByWeight;

describe('randomByWeight', function() {
  it('should randomly select items by weight', function() {
    var items = [
      { value: 0, weight: 10 },
      { value: 1, weight: 20 }
    ];
    var selections = [0, 0];
    for (var i = 0; i < 1000; i++) {
      var selection = randomByWeight(items, 'weight');
      selections[selection.value]++;
    }
    console.log(selections)
    expect(selections[0]).toBeGreaterThan(270)
    expect(selections[0]).toBeLessThan(390);
    expect(selections[1]).toBeGreaterThan(600)
    expect(selections[1]).toBeLessThan(730);
  })
})
