// Copyright 2002-2013, University of Colorado Boulder

/**
 * Reset All button.
 */
define( function( require ) {
  'use strict';

  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var PushButton = require( 'SUN/PushButton' );
  var Shape = require( 'KITE/Shape' );
  var Vector2 = require( 'DOT/Vector2' );

  // images
  var resetButtonUp = require( 'image!SCENERY_PHET/reset_button_up.png' );
  var resetButtonOver = require( 'image!SCENERY_PHET/reset_button_over.png' );
  var resetButtonDown = require( 'image!SCENERY_PHET/reset_button_down.png' );
  var resetButtonDisabled = require( 'image!SCENERY_PHET/reset_button_disabled.png' );

  var RADIUS = resetButtonUp.width / 2; // assumes that all button images are circles and have the same dimensions.
  var RADIUS_SQUARED = RADIUS * RADIUS;
  var CENTER = new Vector2( RADIUS, RADIUS );

  function ResetAllButton( callback, options ) {
    options = _.extend( {
      touchAreaRadius: RADIUS + 5 // convenience for expanding the touchArea, which is a circle
    }, options );
    PushButton.call( this,
      new ResetAllImage( resetButtonUp ),
      new ResetAllImage( resetButtonOver ),
      new ResetAllImage( resetButtonDown ),
      new ResetAllImage( resetButtonDisabled ),
      callback, options );
    this.touchArea = Shape.circle( CENTER.x, CENTER.y, options.touchAreaRadius );
  }

  function ResetAllImage( image ) {
    Image.call( this, image );
  }

  inherit( Image, ResetAllImage, {
    containsPointSelf: function( point ) {
      return point.distanceSquared( CENTER ) <= RADIUS_SQUARED;
    }
  } );

  return inherit( PushButton, ResetAllButton );
} );