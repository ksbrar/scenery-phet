// Copyright 2013, University of Colorado

/**
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Sam Reid
 */
define( function ( require ) {
  'use strict';

  var Button = require( 'SUN/Button' );
  var FontAwesomeNode = require( 'SUN/FontAwesomeNode' );
  var inherit = require( 'PHET_CORE/inherit' );

  function ResetAllButton( callback ) {
    Button.call( this, new FontAwesomeNode( 'refresh', {fill: '#fff'} ), { fill: '#f99d1c' }, callback );
  }

  inherit( ResetAllButton, Button );

  return ResetAllButton;
} );