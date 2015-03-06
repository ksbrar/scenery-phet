//  Copyright 2002-2014, University of Colorado Boulder

/**
 * Failure message displayed when a WebGL context loss is experienced and we can't recover. Offers a button to reload
 * the simulation.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Dialog = require( 'JOIST/Dialog' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var Text = require( 'SCENERY/nodes/Text' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var FontAwesomeNode = require( 'SUN/FontAwesomeNode' );
  var TextPushButton = require( 'SUN/buttons/TextPushButton' );

  var contextLossFailure = require( 'string!SCENERY_PHET/webglWarning.contextLossFailure' );
  var contextLossReload = require( 'string!SCENERY_PHET/webglWarning.contextLossReload' );

  function ContextLossFailureDialog() {
    var warningSign = new FontAwesomeNode( 'warning_sign', {
      fill: '#E87600', // "safety orange", according to Wikipedia
      scale: 0.6
    } );

    var text = new Text( contextLossFailure, { font: new PhetFont( 12 ) } );

    var button = new TextPushButton( contextLossReload, {
      font: new PhetFont( 12 ),
      baseColor: '#E87600',
      listener: function() {
        window.location.reload();
      }
    } );

    Dialog.call( this, new HBox( {
      children: [ warningSign, text, button ],
      spacing: 10
    } ), {
      modal: true,
      hasCloseButton: false,
      xMargin: 10,
      yMargin: 10
    } );
  }

  return inherit( Dialog, ContextLossFailureDialog );
} );