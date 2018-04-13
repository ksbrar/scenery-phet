// Copyright 2014-2017, University of Colorado Boulder

/**
 * SpectrumNode displays a rectangle of the visible spectrum.
 *
 * TODO: Rename this to WavelengthSpectrumNode, and rename AbstractSpectrumNode to SpectrumNode
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var sceneryPhet = require( 'SCENERY_PHET/sceneryPhet' );
  var VisibleColor = require( 'SCENERY_PHET/VisibleColor' );
  var AbstractSpectrumNode = require( 'SCENERY_PHET/AbstractSpectrumNode' );

  /**
   * Slider track that displays the visible spectrum of light.
   *
   * @param {Object} [options]
   * @constructor
   */
  function SpectrumNode( options ) {

    options = _.extend( {
      minWavelength: VisibleColor.MIN_WAVELENGTH,
      maxWavelength: VisibleColor.MAX_WAVELENGTH
    }, options );

    // validation
    assert && assert( options.minWavelength < options.maxWavelength );
    assert && assert( options.minWavelength >= VisibleColor.MIN_WAVELENGTH && options.minWavelength <= VisibleColor.MAX_WAVELENGTH );
    assert && assert( options.maxWavelength >= VisibleColor.MIN_WAVELENGTH && options.maxWavelength <= VisibleColor.MAX_WAVELENGTH );
    assert && assert( typeof options.minValue === 'undefined', 'minValue is supplied by WavelengthSlider' );
    assert && assert( typeof options.maxValue === 'undefined', 'maxValue is supplied by WavelengthSlider' );

    options.minValue = options.minWavelength;
    options.maxValue = options.maxWavelength;
    options.valueToColor = function( value ) {
      return VisibleColor.wavelengthToColor( value );
    };

    AbstractSpectrumNode.call( this, options );
  }

  sceneryPhet.register( 'SpectrumNode', SpectrumNode );

  return inherit( AbstractSpectrumNode, SpectrumNode );
} );