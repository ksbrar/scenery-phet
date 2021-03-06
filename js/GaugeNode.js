// Copyright 2013-2019, University of Colorado Boulder

/**
 * GaugeNode is a circular gauge that depicts some dynamic value.
 * This was originally ported from the speedometer node in forces-and-motion-basics.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author John Blanco (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var Circle = require( 'SCENERY/nodes/Circle' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Matrix3 = require( 'DOT/Matrix3' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Property = require( 'AXON/Property' );
  var Range = require( 'DOT/Range' );
  var sceneryPhet = require( 'SCENERY_PHET/sceneryPhet' );
  var Shape = require( 'KITE/Shape' );
  var Tandem = require( 'TANDEM/Tandem' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Util = require( 'DOT/Util' );

  /**
   * @param {Property.<number>} valueProperty - the portrayed value
   * @param {string} label - label to display (scaled to fit if necessary)
   * @param {Range} range
   * @param {Object} [options]
   * @constructor
   */
  function GaugeNode( valueProperty, label, range, options ) {
    options = _.extend( {
      // Defaults
      radius: 100,
      backgroundFill: 'white',
      backgroundStroke: 'rgb( 85, 85, 85 )',
      backgroundLineWidth: 2,
      maxLabelWidthScale: 1.3, // {number} defines max width of the label, relative to the radius

      // 10 ticks each on the right side and left side, plus one in the center
      numberOfTicks: 21,

      // the top half of the gauge, plus PI/8 extended below the top half on each side
      span: Math.PI + Math.PI / 4, // {number} the visible span of the gauge value range, in radians
      majorTickLength: 10,
      minorTickLength: 5,
      majorTickLineWidth: 2,
      minorTickLineWidth: 1,

      // Determines whether the gauge will be updated when the value changes.
      // Use this to (for example) disable updates while a gauge is not visible.
      updateEnabledProperty: new Property( true ),
      tandem: Tandem.required
    }, options );

    assert && assert( range instanceof Range, 'range must be of type Range: ' + range );
    assert && assert( options.span <= 2 * Math.PI, 'options.span must be <= 2 * Math.PI: ' + options.span );

    Node.call( this );

    // @public (read-only) {number}
    this.radius = options.radius;

    var anglePerTick = options.span / options.numberOfTicks;
    var tandem = options.tandem;

    this.addChild( new Circle( this.radius, {
      fill: options.backgroundFill,
      stroke: options.backgroundStroke,
      lineWidth: options.backgroundLineWidth
    } ) );

    var foregroundNode = new Node( { pickable: false, tandem: tandem.createTandem( 'foregroundNode' ) } );
    this.addChild( foregroundNode );

    var needle = new Path( Shape.lineSegment( 0, 0, this.radius, 0 ), {
      stroke: 'red',
      lineWidth: 3
    } );
    foregroundNode.addChild( needle );

    var labelNode = new Text( label, {
      font: new PhetFont( 20 ),
      maxWidth: this.radius * options.maxLabelWidthScale,
      tandem: tandem.createTandem( 'labelNode' )
    } ).mutate( {
      centerX: 0,
      centerY: -this.radius / 3
    } );
    foregroundNode.addChild( labelNode );

    var pin = new Circle( 2, { fill: 'black' } );
    foregroundNode.addChild( pin );

    var totalAngle = ( options.numberOfTicks - 1 ) * anglePerTick;
    var startAngle = -1 / 2 * Math.PI - totalAngle / 2;
    var endAngle = startAngle + totalAngle;

    var scratchMatrix = new Matrix3();

    var updateNeedle = function() {
      if ( options.updateEnabledProperty.get() ) {
        if ( typeof( valueProperty.get() ) === 'number' ) {
          assert && assert( valueProperty.get() >= 0, 'GaugeNode representing negative values indicates a logic error' );

          needle.visible = true;
          var needleAngle = Util.linear( range.min, range.max, startAngle, endAngle, Math.abs( valueProperty.get() ) );

          // 2d rotation, but reusing our matrix above
          needle.setMatrix( scratchMatrix.setToRotationZ( needleAngle ) );
        }
        else {

          // Hide the needle if there is no value number value to portray.
          needle.visible = false;
        }
      }
    };

    valueProperty.link( updateNeedle );
    options.updateEnabledProperty.link( updateNeedle );

    // Render all of the ticks into two layers (since they have different strokes)
    // see https://github.com/phetsims/energy-skate-park-basics/issues/208
    var bigTicksShape = new Shape();
    var smallTicksShape = new Shape();

    // Add the tick marks
    for ( var i = 0; i < options.numberOfTicks; i++ ) {
      var tickAngle = i * anglePerTick + startAngle;

      var tickLength = i % 2 === 0 ? options.majorTickLength : options.minorTickLength;
      var x1 = ( this.radius - tickLength ) * Math.cos( tickAngle );
      var y1 = ( this.radius - tickLength ) * Math.sin( tickAngle );
      var x2 = this.radius * Math.cos( tickAngle );
      var y2 = this.radius * Math.sin( tickAngle );
      if ( i % 2 === 0 ) {
        bigTicksShape.moveTo( x1, y1 );
        bigTicksShape.lineTo( x2, y2 );
      }
      else {
        smallTicksShape.moveTo( x1, y1 );
        smallTicksShape.lineTo( x2, y2 );
      }
    }

    foregroundNode.addChild( new Path( bigTicksShape, { stroke: 'gray', lineWidth: options.majorTickLineWidth } ) );
    foregroundNode.addChild( new Path( smallTicksShape, { stroke: 'gray', lineWidth: options.minorTickLineWidth } ) );
    this.mutate( options );

    // @private
    this.disposeGaugeNode = function() {
      if ( valueProperty.hasListener( updateNeedle ) ) {
        valueProperty.unlink( updateNeedle );
      }

      if ( options.updateEnabledProperty.hasListener( updateNeedle ) ) {
        options.updateEnabledProperty.unlink( updateNeedle );
      }
    };
  }

  sceneryPhet.register( 'GaugeNode', GaugeNode );

  return inherit( Node, GaugeNode, {

    // @public
    dispose: function() {
      this.disposeGaugeNode();
      Node.prototype.dispose.call( this );
    }
  } );
} );