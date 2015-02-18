// Copyright 2002-2013, University of Colorado Boulder

/**
 * A drag handler for something has a location and is constrained to some (optional) bounds.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var Vector2 = require( 'DOT/Vector2' );

  /**
   * @param {Property.<Vector2>} locationProperty
   * @param {Object} [options]
   * @constructor
   */
  function MovableDragHandler( locationProperty, options ) {

    options = _.extend( {
      dragBounds: null, // {Bounds2} dragging will be constrained to these optional bounds
      modelViewTransform: ModelViewTransform2.createIdentity(), // {ModelViewTransform2} defaults to identity
      startDrag: function( event ) {},  // use this to do something at the start of dragging, like moving a node to the foreground
      endDrag: function( event ) {}  // use this to do something at the end of dragging, like 'snapping'
    }, options );

    var startOffset; // where the drag started, relative to the Movable's origin, in parent view coordinates

    SimpleDragHandler.call( this, {

      allowTouchSnag: true,

      // note where the drag started
      start: function( event ) {
        options.startDrag( event );
        var location = options.modelViewTransform.modelToViewPosition( locationProperty.get() );
        startOffset = event.currentTarget.globalToParentPoint( event.pointer.point ).minus( location );
      },

      // change the location, adjust for starting offset, constrain to drag bounds
      drag: function( event ) {
        var parentPoint = event.currentTarget.globalToParentPoint( event.pointer.point ).minus( startOffset );
        var location = options.modelViewTransform.viewToModelPosition( parentPoint );
        if ( options.dragBounds ) {
          location = constrainLocation( location, options.dragBounds );
        }
        locationProperty.set( location );
      },

      end: function( event ) {
        options.endDrag( event );
      }
    } );
  }

  /**
   * Constrains a location to some bounds.
   * @param {Vector2} location
   * @param {Bounds2} bounds
   */
  var constrainLocation = function( location, bounds ) {
    if ( bounds.containsCoordinates( location.x, location.y ) ) {
      return location;
    }
    else {
      var xConstrained = Math.max( Math.min( location.x, bounds.maxX ), bounds.x );
      var yConstrained = Math.max( Math.min( location.y, bounds.maxY ), bounds.y );
      return new Vector2( xConstrained, yConstrained );
    }
  };

  return inherit( SimpleDragHandler, MovableDragHandler );
} );
