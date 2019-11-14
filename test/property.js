var vCard = require( '..' )
var fs = require( 'fs' )
var assert = require( 'assert' )

function fillerProp() {
  return new vCard.Property('tel', '(123) 456 7890', {
    'type': ['work', 'pref']
  })
}

suite( 'vCard.Property', function() {

  test('should create a new Property', function() {
    var prop = fillerProp()
    assert.ok( prop instanceof vCard.Property )
  })

  test('should get property fields and data', function() {
    var prop = fillerProp()
    assert.strictEqual( prop.fieldOf(), 'tel' )
    assert.strictEqual( prop.valueOf(), '(123) 456 7890' )
  })

  test('should set data', function() {
    var prop = fillerProp()
    prop.setValue('+1 (800) 588 2300')
    assert.strictEqual( prop.valueOf(), '+1 (800) 588 2300')
  })

})