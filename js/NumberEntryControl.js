// Copyright 2014-2015, University of Colorado Boulder

/**
 * A composite Scenery node that brings together a keypad and a box where the entered values are displayed.  Kind of
 * looks like a calculator, though it doesn't behave as one.
 *
 * @author Sharfudeen Ashraf
 * @author John Blanco
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var sceneryPhet = require( 'SCENERY_PHET/sceneryPhet' );
  var inherit = require( 'PHET_CORE/inherit' );
  var NumberKeypad = require( 'SCENERY_PHET/NumberKeypad' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Text = require( 'SCENERY/nodes/Text' );

  /**
   * @param {Object} [options]
   * @constructor
   */
  function NumberEntryControl( options ) {
    Node.call( this );
    var self = this;
    options = _.extend( {
      maxDigits: 5,
      readoutFont: new PhetFont( 20 )
    }, options );

    // Add the keypad.
    this.keypad = new NumberKeypad( {
      maxDigits: options.maxDigits
    } );
    this.addChild( this.keypad );

    // Add the number readout background.
    var testString = new Text( '', { font: options.readoutFont } );
    _.times( options.maxDigits, function() { testString.text = testString.text + '9'; } );
    var readoutBackground = new Rectangle( 0, 0, testString.width * 1.2, testString.height * 1.2, 4, 4, {
      fill: 'white',
      stroke: '#777777',
      lineWidth: 1.5,
      centerX: this.keypad.width / 2
    } );
    this.addChild( readoutBackground );

    // Add the digits.
    var digits = new Text( '', { font: options.readoutFont } );
    this.addChild( digits );
    this.value = 0; // @private
    this.keypad.digitStringProperty.link( function( digitString ) {
      digits.text = digitString;
      digits.center = readoutBackground.center;
      self.value = Number( digitString );
    } );

    // Layout
    this.keypad.top = readoutBackground.bottom + 10;

    // Pass options through to parent class.
    this.mutate( options );
  }

  sceneryPhet.register( 'NumberEntryControl', NumberEntryControl );

  return inherit( Node, NumberEntryControl, {
    /**
     * Returns the numeric value of the currently entered number (0 for nothing entered).
     * @public
     *
     * @returns {number}
     */
    getValue: function() {
      return this.value;
    },

    /**
     * Sets the currently entered number.
     * @public
     *
     * @param {number} number
     */
    setValue: function( number ) {
      assert && assert( typeof number === 'number' );
      assert && assert( number % 1 === 0, 'Only supports integers currently' );

      this.keypad.digitStringProperty.set( '' + number );
    },

    /**
     * Clears the keypad, so nothing is entered
     * @public
     */
    clear: function() {
      this.keypad.clear();
    },

    /**
     * Set the keypad such that any new digit entry will clear the existing string and start over.
     * @public
     */
    armForNewEntry: function() {
      this.keypad.armForNewEntry();
    }
  } );
} );