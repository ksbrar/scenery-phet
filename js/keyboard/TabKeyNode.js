// Copyright 2017, University of Colorado Boulder

/**
 * Node that looks like a 'Tab' key on a keyboard.  By default, the tab key is
 * more rectangular than a letter key, and the text content is aligned
 * in the left top corner.
 * 
 * @author Jesse Greenberg
 */

define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var sceneryPhet = require( 'SCENERY_PHET/sceneryPhet' );
  var TextKeyNode = require( 'SCENERY_PHET/keyboard/TextKeyNode' );
  var SceneryPhetA11yStrings = require( 'SCENERY_PHET/SceneryPhetA11yStrings' );

  // strings (a11y strings are not translatable yet, see SceneryPhetA11yStrings for more details)
  var tabString = SceneryPhetA11yStrings.tabString;

  /**
   * Constructor.
   * 
   * @param {Object} [options]
   */
  function TabKeyNode( options ) {
    // Tandem.indicateUninstrumentedCode();  // see https://github.com/phetsims/phet-io/issues/986

    options = _.extend( {
      minKeyWidth: 50, // in the ScreenView coordinate frame, tab key is usually wider than other keys
      maxKeyWidth: 50
    }, options );

    TextKeyNode.call( this, tabString, options );
  }

  sceneryPhet.register( 'TabKeyNode', TabKeyNode );

  return inherit( TextKeyNode, TabKeyNode );

} );