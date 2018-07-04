// Copyright 2014-2018, University of Colorado Boulder

/**
 * Star shape (full, 5-pointed)
 *
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var sceneryPhet = require( 'SCENERY_PHET/sceneryPhet' );
  var Shape = require( 'KITE/Shape' );
  var Tandem = require( 'TANDEM/Tandem' );

  /**
   * @param {Object} [options]
   * @constructor
   */
  function StarShape( options ) {

    options = _.extend( {

      //Distance from the center to the tip of a star limb
      outerRadius: 15,

      //Distance from the center to the closest point on the exterior of the star.  Sets the "thickness" of the star limbs
      innerRadius: 7.5
    }, options );

    Tandem.disallowTandem( options );

    Shape.call( this );

    // start at the top and proceed clockwise
    for ( var i = 0; i < 10; i++ ) {
      var angle = i / 10 * Math.PI * 2 - Math.PI / 2;
      var radius = i % 2 === 0 ? options.outerRadius : options.innerRadius;

      this.lineTo(
        radius * Math.cos( angle ),
        radius * Math.sin( angle )
      );
    }
    this.close();
    this.makeImmutable(); // So Paths won't need to add listeners
  }

  sceneryPhet.register( 'StarShape', StarShape );

  return inherit( Shape, StarShape );
} );
