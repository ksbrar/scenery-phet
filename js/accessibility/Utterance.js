// Copyright 2017-2018, University of Colorado Boulder

/**
 * An utterance to be handed off to the AlertQueue, which manages the order of accessibility alerts
 * read by a screen reader.
 *
 * An utterance to be provided to the AlertQueue. An utterance can be one of AlertableDef or an array of items
 * that conform to AlertableDef. If using an array, alertables in the array will be anounced in order (one at a time)
 * each time this utterances is added to the utteranceQueue.
 *
 * @author Jesse Greenberg
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const sceneryPhet = require( 'SCENERY_PHET/sceneryPhet' );

  class Utterance {

    /**
     * @param {Object} config
     */
    constructor( config ) {
      config = _.extend( {

        /**
         * The content of the alert that this Utterance is wrapping. If it is an array, then the Utterance will
         * keep track of number of times that the Utterance has been alerted, and choose from the list "accordingly" see
         * loopingSchema for more details
         * {AlertableDef}
         * @required
         */
        alert: null,

        // if true, then the alert must be of type {Array}, and alerting will cycle through each alert, and then wrap back
        // to the beginning when complete. The default behavior (loopAlerts:false) is to repeat the last alert in the array until reset.
        loopAlerts: false,

        // @returns {boolean} - if predicate returns false, the alert content associated
        // with this utterance will not be announced by a screen reader
        predicate: function() { return true; },

        // {number|string|null} - Adds a signifier to the utterance that prevents too many alerts of the same type
        // spamming the queue. If more than one Utterance of the same uniqueGroupId is added to the queue, all others
        // of the same type that were previously added will be removed. If null, this feature is ignored and
        // all will  be announced.
        uniqueGroupId: null,

        // {number} - if provided, this utterance won't be spoken until it has been in the queue for at least this long.
        // Can be used in combination with uniqueGroupId so if an Utterance is being delayed and a new Utterance
        // of the same uniqueGroupId is added to the queue, the delayed utterance will be removed immediately.
        // But beware! The queue will otherwise still prioritize items in FIFO, so the utterance could sit in the queue
        // for longer than this amount.
        delayTime: 0
      }, config );

      assert && assert( config.alert, 'alert is required' );
      assert && assert( typeof config.alert === 'string' || Array.isArray( config.alert ) );
      assert && assert( typeof config.loopAlerts === 'boolean' );
      assert && assert( typeof config.predicate === 'function' );
      assert && assert( typeof config.uniqueGroupId === 'string' || config.uniqueGroupId === null );
      assert && assert( typeof config.delayTime === 'number' );
      if ( config.loopAlerts ) {
        assert && assert( Array.isArray( config.alert ), 'if loopAlerts is provided, config.alert must be an array' );
      }

      // @private
      this._alert = config.alert;
      this.numberOfTimesAlerted = 0; // keep track of the number of times alerted, this will dictate which alert to call.
      this.loopAlerts = config.loopAlerts;

      // @public (read-only, scenery-phet-internal)
      this.predicate = config.predicate;
      this.uniqueGroupId = config.uniqueGroupId;

      // @public {number} (scenery-phet-internal) - In ms, how long this utterance has been in the queue in ms. Useful
      // for doing things like determining if an utterance is stale by time, or adding a delay before the utterance
      // should be read.
      this.timeInQueue = 0;

      // @public {number} (scenery-phet-internal) - In ms, how long the utterance should remain in the queue before it
      // is read. The queue is cleared in FIFO order, but utterances are skipped until the delay time is less than the
      // amount of time the utterance has been in the queue
      this.delayTime = config.delayTime;
    }

    /**
     * Getter for the text to be alerted for this Utterance. This should only be called when the alert is about to occur
     * because Utterance updates the number of times it has alerted based on this function, see this.numberOfTimesAlerted
     * @returns {string}
     * @public
     */
    getTextToAlert() {
      let alert;
      if ( typeof this._alert === 'string' ) {
        alert = this._alert;
      }
      else if ( this.loopAlerts ) {
        alert = this._alert[ this.numberOfTimesAlerted % this._alert.length ];
      }
      else {
        assert && assert( Array.isArray( this._alert ) ); // sanity check
        const currentAlertIndex = Math.min( this.numberOfTimesAlerted, this._alert.length - 1 );
        alert = this._alert[ currentAlertIndex ];
      }
      this.numberOfTimesAlerted++;
      return alert;
    }

    /**
     * Set the alert for the utterance
     * @param {AlertableDef} alert
     * @public
     */
    set alert( alert ) {
      this._alert = alert;
    }

    /**
     * @public
     */
    reset() {
      this.numberOfTimesAlerted = 0;
    }
  }

  return sceneryPhet.register( 'Utterance', Utterance );
} );
