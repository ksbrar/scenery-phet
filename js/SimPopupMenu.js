/**
 * Popup menu that is displayed when the user clicks on the bars in the bottom right in the navigation bar.
 * Would be nice to have a balloon triangle dropdown shape like in a comic book dialog.
 *
 * @author Sam Reid
 */
define( function( require ) {
  "use strict";

  var Node = require( 'SCENERY/nodes/Node' );
  var Shape = require( 'KITE/Shape' );
  var Path = require( 'SCENERY/nodes/Path' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var Text = require( 'SCENERY/nodes/Text' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Layout = require( 'SCENERY_PHET/Layout' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Button = require( 'SUN/Button' );
  var PanelNode = require( 'SUN/PanelNode' );

  var HEIGHT = 110;

  function SimPopupMenu( options ) {
    var simPopupMenu = this;
    Node.call( this );

    var items = [new Text( 'PhET Homepage', {fontSize: '18px'} ),
      new Text( 'Related Sims', {fontSize: '18px'} ),
      new Text( 'About...', {fontSize: '18px'} )];

    //left align the items

    //Compute bounds
    var widestItem = _.max( items, function( item ) {return item.width;} );
    var tallestItem = _.max( items, function( item ) {return item.height;} );
    console.log( widestItem.width );

    var itemHeight = tallestItem.height;

    var verticalSpacing = 5;
    var padding = 5;
    var bubbleWidth = widestItem.width + padding * 2;
    var bubbleHeight = itemHeight * items.length + padding * 2 + verticalSpacing * (items.length - 1);

    console.log( "th", bubbleHeight );

    var bubble = new Rectangle( 0, 0, bubbleWidth, bubbleHeight, 6, 6, {fill: 'white', lineWidth: 1, stroke: 'black'} );

    var tail = new Shape();
    tail.moveTo( bubbleWidth - 20, bubbleHeight - 2 );
    tail.lineToRelative( 0, 20 );
    tail.lineToRelative( -20, -20 );
    tail.close();

    this.addChild( bubble );
    this.addChild( new Path( {shape: tail, fill: 'white'} ) );

    var tailOutline = new Shape();
    tailOutline.moveTo( bubbleWidth - 20, bubbleHeight );
    tailOutline.lineToRelative( 0, 20 - 2 );
    tailOutline.lineToRelative( -18, -18 );
    this.addChild( new Path( {shape: tailOutline, stroke: 'black', lineWidth: 1} ) );

    var y = padding;
    for ( var i = 0; i < items.length; i++ ) {
      var item = items[i];
      item.top = y;
      item.left = padding;
      this.addChild( item );

      if ( i === items.length - 2 ) {
        this.addChild( new Path( {shape: Shape.lineSegment( 8, y + itemHeight + verticalSpacing / 2, bubbleWidth - 8, y + itemHeight + verticalSpacing / 2 ), stroke: 'gray', lineWidth: 1} ) );
      }
      y += itemHeight + verticalSpacing;
    }

    this.addInputListener( { down: function() {
      simPopupMenu.detach();
    } } );
    this.mutate( options );
  }

  inherit( SimPopupMenu, Node );

  return SimPopupMenu;
} );