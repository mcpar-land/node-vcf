function vCard() {

  if( !(this instanceof vCard) )
    return new vCard()

  /** @type {String} Version number */
  this.version = vCard.versions[ vCard.versions.length - 1 ]
  /** @type {Object} Card data */
  this.data = {}

}

vCard.mimeType = 'text/vcard'

vCard.extension = '.vcf'

vCard.versions = [ '2.1', '3.0', '4.0' ]

vCard.EOL = '\r\n'

vCard.foldLine = require( 'foldline' )

vCard.normalize = function( input ) {
  return ( input + '' )
    // Trim whitespace
    .replace( /^[\s\r\n]+|[\s\r\n]+$/g, '' )
    // Trim blank lines
    .replace( /(\r\n)[\x09\x20]?(\r\n)|$/g, '$1' )
    // Unfold folded lines
    .replace( /\r\n[\x20\x09]/g, "" )
}

vCard.isSupported = function( version ) {
  return /^\d\.\d$/.test( version ) &&
    vCard.versions.indexOf( version ) !== -1
}

vCard.parse = function( value ) {

  var objects = ( value + '' ).split( /(?=BEGIN\:VCARD)/gi )
  var cards = []

  for( var i = 0; i < objects.length; i++ ) {
    cards.push( new vCard().parse( objects[i] ) )
  }

  return cards

}

vCard.parseLines = require( './parse-lines' )

vCard.fromJSON = function( jcard ) {

  jcard = typeof jcard === 'string' ?
    JSON.parse( jcard ) : jcard

  if( jcard == null || !Array.isArray( jcard ) )
    return new vCard()

  if( !/vcard/i.test( jcard[0] ) )
    throw new Error( 'Object not in jCard format' )

  var card = new vCard()

  jcard[1].forEach( function( prop ) {
    card.addProperty( vCard.Property.fromJSON( prop ) )
  })

  return card

}

vCard.format = function( card, version ) {

  version = version || card.version ||
    vCard.versions[ vCard.versions.length - 1 ]

  if( !vCard.isSupported( version ) )
    throw new Error( 'Unsupported vCard version "' + version + '"' )

  var vcf = []

  vcf.push( 'BEGIN:VCARD' )
  vcf.push( 'VERSION:' + version )

  var props = Object.keys( card.data )
  var prop = ''

  for( var i = 0; i < props.length; i++ ) {
    if( props[i] === 'version' ) continue;
    prop = card.data[ props[i] ]
    if( Array.isArray( prop ) ) {
      for( var k = 0; k < prop.length; k++ ) {
        if( prop[k].isEmpty() ) continue
        vcf.push( vCard.foldLine( prop[k].toString( version ), 75 ) )
      }
    } else if( !prop.isEmpty() ) {
      vcf.push( vCard.foldLine( prop.toString( version ), 75 ) )
    }
  }

  vcf.push( 'END:VCARD' )

  return vcf.join( vCard.EOL )

}

vCard.Property = require( './property' )

vCard.prototype = {

  constructor: vCard,

  get: function( key, type ) {

    if( this.data[ key ] == null ) {
      return this.data[ key ]
    }

    if( Array.isArray( this.data[ key ] ) ) {
      var props = this.data[ key ]
      .filter(prop => !type || prop.is(type))
      .map( function( prop ) {
        return prop.clone()
      })
      return props.length <= 1 ? props[0] : props
    } else {
      return type
        ? ( this.data[key].is(type) ? this.data[key].clone : undefined )
        : this.data[ key ].clone()
    }

  },

  getWithType: function( key, type ) {
    var props = this.get(key)
    if (!Array.isArray(props)) {
      return prop.is(type) ? prop : undefined
    }
    return props.filter(prop => prop.is(type))
  },

  set: function( key, value, params ) {
    return this.setProperty( new vCard.Property( key, value, params ) )
  },

  add: function( key, value, params ) {
    var prop = new vCard.Property( key, value, params )
    this.addProperty( prop )
    return this
  },

  setProperty: function( prop ) {
    this.data[ prop._field ] = prop
    return this
  },

  addProperty: function( prop ) {

    var key = prop._field

    if( Array.isArray( this.data[ key ] ) ) {
      this.data[ key ].push( prop )
    } else if( this.data[ key ] != null ) {
      this.data[ key ] = [ this.data[ key ], prop ]
    } else {
      this.data[ key ] = prop
    }

    return this

  },

  parse: function( value ) {

    // Normalize & split
    var lines = vCard.normalize( value )
      .split( /\r\n/g )

    // Keep begin and end markers
    // for eventual error messages
    var begin = lines[0]
    var version = lines[1]
    var end = lines[ lines.length - 1 ]

    if( !/BEGIN:VCARD/i.test( begin ) )
      throw new SyntaxError( 'Invalid vCard: Expected "BEGIN:VCARD" but found "'+ begin +'"' )

    if( !/END:VCARD/i.test( end ) )
      throw new SyntaxError( 'Invalid vCard: Expected "END:VCARD" but found "'+ end +'"' )

    // TODO: For version 2.1, the VERSION can be anywhere between BEGIN & END
    if( !/VERSION:\d\.\d/i.test( version ) )
      throw new SyntaxError( 'Invalid vCard: Expected "VERSION:\\d.\\d" but found "'+ version +'"' )

    this.version = version.substring( 8, 11 )

    if( !vCard.isSupported( this.version ) )
      throw new Error( 'Unsupported version "' + this.version + '"' )

    this.data = vCard.parseLines( lines )

    return this

  },

  toString: function( version, charset ) {
    version = version || this.version
    return vCard.format( this, version )
  },

  toJCard: function( version ) {

    version = version || '4.0'

    var keys = Object.keys( this.data )
    var data = [ [ 'version', {}, 'text', version ] ]
    var prop = null

    for( var i = 0; i < keys.length; i++ ) {
      if( keys[i] === 'version' ) continue;
      prop = this.data[ keys[i] ]
      if( Array.isArray( prop ) ) {
        for( var k = 0; k < prop.length; k++ ) {
          data.push( prop[k].toJSON() )
        }
      } else {
        data.push( prop.toJSON() )
      }
    }

    return [ 'vcard', data ]

  },

  toJSON: function() {
    return this.toJCard( this.version )
  },

}

// Exports
module.exports = vCard
