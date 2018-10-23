// Copyright 2017, University of Colorado Boulder

/**
 * Manages a queue of Utterances that are read in order by a screen reader.  This queue typically reads
 * things in a first-in-first-out manner, but it is possible to send an alert directly to the front of
 * the queue.  Items in the queue are sent to the screen reader front to back with a certain delay interval.
 *
 * Screen readers are inconsistent in the way that they order alerts, some use last-in-first-out order,
 * others use first-in-first-out order, others just read the last alert that was provided. This queue
 * manages order and improves consistency.
 *
 * NOTE: utteranceQueue is a type but instantiated and returned as a singleton.  It is initialized by Sim.js and if
 * something adds an alert to the queue before Sim.js has initialized the queue, the result will be a silent no-op.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var AriaHerald = require( 'SCENERY_PHET/accessibility/AriaHerald' );
  var inherit = require( 'PHET_CORE/inherit' );
  var PhetioObject = require( 'TANDEM/PhetioObject' );
  var sceneryPhet = require( 'SCENERY_PHET/sceneryPhet' );
  var Tandem = require( 'TANDEM/Tandem' );
  var timer = require( 'PHET_CORE/timer' );
  var Utterance = require( 'SCENERY_PHET/accessibility/Utterance' );
  var UtteranceQueueIO = require( 'SCENERY_PHET/accessibility/UtteranceQueueIO' );

  /**
   * @constructor
   */
  function utteranceQueue() {

    // @private {boolean} initialization is like utteranceQueue's constructor. No-ops all around if not
    // initialized (cheers). See initialize()
    this._initialized = false;

    // @private {Array.<Utterance>} - array of Utterances, spoken in first to last order
    this.queue = [];

    // @private {number} the interval for sending alerts to the screen reader, in milliseconds - can be set with
    // setStepInterval
    this._stepInterval = 500;

    // @private {null|function} - callback added to the timer to step the queue, reference kept so listener can be
    // removed if necessary
    this._intervalCallback = null;

    // whether or not Utterances moving through the queue are read by a screen reader
    this._muted = false;

    // whether the UtterancesQueue is alerting, and if you can add/remove utterances
    this._enabled = true;

    PhetioObject.call( this ); // options will be provided in initialize (if it is ever called)
  }

  inherit( PhetioObject, utteranceQueue, {

    /**
     * Add an utterance ot the end of the queue.  If the utterance has a type of alert which
     * is already in the queue, the older alert will be immediately removed.
     *
     * @public
     * @param {Utterance|string} utterance
     */
    addToBack: function( utterance ) {
      assert && assert( utterance instanceof Utterance || typeof utterance === 'string',
        'utterance queue only supports string or type Utterance.' );

      // No-op function if the utteranceQueue is disabled
      if ( !this._enabled || !this._initialized ) {
        return;
      }

      if ( typeof utterance === 'string' ) {
        utterance = new Utterance( { alert: utterance } );
      }

      // clear utterances of the same group as the one being added
      this.clearUtteranceGroup( utterance.uniqueGroupId );

      this.queue.push( utterance );
    },

    /**
     * Conventience function to help with nullable values
     * @param {undefined|null|Utterance|string} utterance
     */
    addToBackIfDefined: function( utterance ) {
      if ( utterance !== null && utterance !== undefined ) {
        this.addToBack( utterance );
      }
    },

    /**
     * Add an utterance to the front of the queue to be read immediately.
     * @param {Utterance|string} utterance
     */
    addToFront: function( utterance ) {
      assert && assert( utterance instanceof Utterance || typeof utterance === 'string',
        'utterance queue only supports string or type Utterance.' );

      // No-op function if the utteranceQueue is disabled
      if ( !this._enabled || !this._initialized ) {
        return;
      }

      if ( typeof utterance === 'string' ) {
        utterance = new Utterance( { alert: utterance } );
      }

      // remove any utterances of the same group as the one being added
      this.clearUtteranceGroup( utterance.uniqueGroupId );

      this.queue.unshift( utterance );
    },

    /**
     * Move to the next item in the queue. Checks the Utterance predicate first, if predicate
     * returns false, no alert will be read. Called privately by timer.setInterval
     *
     * @private
     */
    next: function() {

      // find the next item to announce - generally the next item in the queue, unless it has a delay specified that
      // is greater than the amount of time that the utterance has been sitting in the queue
      var nextUtterance;
      for ( var i = 0; i < this.queue.length; i++ ) {
        var utterance = this.queue[ i ];
        if ( utterance.timeInQueue > utterance.delayTime ) {
          nextUtterance = utterance;
          this.queue.splice( i, 1 );
          break;
        }
      }

      // only speak the utterance if the Utterance predicate returns true
      if ( nextUtterance && !this._muted && nextUtterance.predicate() ) {

        // just get the text of the Utterance once! This is because getting it triggers updates in the Utterance that
        // should only be triggered on alert! See Utterance.getTextToAlert
        var text = nextUtterance.getTextToAlert();

        // phet-io event to the data stream
        this.phetioStartEvent( 'announced', { utterance: text } );

        // Pass the utterance text on to be set in the PDOM.
        AriaHerald.announcePolite( text );

        this.phetioEndEvent();
      }
    },

    /**
     * Called by addToFront and addToBack, do not call this. Clears the queue of all utterances of the specified group
     * to support the behavior of uniqueGroupId. See Utterance.uniqueGroupId for description of this feature.
     *
     * @param {string|number|null} uniqueGroupId
     * @private
     */
    clearUtteranceGroup: function( uniqueGroupId ) {

      // if there are any other items in the queue of the same type, remove them immediately because the added
      // utterance is meant to replace it
      if ( uniqueGroupId ) {
        for ( var i = this.queue.length - 1; i >= 0; i-- ) {
          var otherUtterance = this.queue[ i ];
          if ( otherUtterance.uniqueGroupId === uniqueGroupId ) {
            this.queue.splice( i, 1 );
          }
        }
      }
    },

    /**
     * Clear the utteranceQueue of all Utterances, any Utterances remaining in the queue will
     * not be announced by the screen reader.
     *
     * @public
     */
    clear: function() {
      this.queue = [];
    },

    /**
     * Set whether or not the utterance queue is muted.  When muted, Utterances will still
     * move through the queue, but nothing will be sent to assistive technology.
     *
     * @param {boolean} isMuted
     */
    setMuted: function( isMuted ) {
      this._muted = isMuted;
    },
    set muted( isMuted ) { this.setMuted( isMuted ); },

    /**
     * Get whether or not the utteranceQueue is muted.  When muted, Utterances will still
     * move through the queue, but nothing will be read by asistive technology.
     * @public
     */
    getMuted: function() {
      return this._muted;
    },
    get muted() { return this.getMuted(); },

    /**
     * Set whether or not the utterance queue is enabled.  When enabled, Utterances cannot be added to
     * the queue, and the Queue cannot be cleared. Also nothing will be sent to assistive technology.
     *
     * @param {boolean} isEnabled
     */
    setEnabled: function( isEnabled ) {
      this._enabled = isEnabled;
    },
    set enabled( isEnabled ) { this.setEnabled( isEnabled ); },

    /**
     * Get whether or not the utterance queue is enabled.  When enabled, Utterances cannot be added to
     * the queue, and the Queue cannot be cleared. Also nothing will be sent to assistive technology.
     * @public
     */
    getEnabled: function() {
      return this._enabled;
    },
    get enabled() { return this.getEnabled(); },

    /**
     * Get the interval that alerts are sent to the screen reader.
     *
     * @public
     * @return {number}
     */
    getStepInterval: function() {
      return this._stepInterval;
    },
    get stepInterval() { return this.getStepInterval(); },

    /**
     * Set the alert interval in milliseconds by adding a new interval callback to the timer. Beware that this
     * impacts the entire queue. Controlling timing of utterances is probably better managed by using options
     * for an individual Utterance.
     * @public
     * 
     * @param {number} alertInterval
     */
    setStepInterval: function( alertInterval ) {
      this._stepInterval = alertInterval;

      // remove the previous callback if it was added
      this._intervalCallback && timer.clearInterval( this._intervalCallback );

      this._intervalCallback = timer.setInterval( this.stepQueue.bind( this ), this._stepInterval );
    },
    set stepInterval( alertInterval ) { this.setStepInterval( alertInterval ); },

    /**
     * Step the queue, called by the timer.
     * @private
     */
    stepQueue: function() {

      // No-op function if the utteranceQueue is disabled
      if ( !this._enabled ) {
        return;
      }

      for ( var i = 0; i < this.queue.length; i++ ) {
        this.queue[ i ].timeInQueue += this._stepInterval;
      }

      this.next();
    },

    /**
     * Basically a constructor for the queue. Setup necessary processes for running the queue and register
     * the phet-io tandem. If utteranceQueue is not initialized (say, when accessibility is not enabled), all functions
     * will be no-ops. See type documentation above for NOTE.
     * @public
     */
    initialize: function() {
      this._initialized = true;

      // begin stepping the queue by adding a callback
      this.setStepInterval( this._stepInterval );

      // TODO: can this be moved to the constructor?
      this.initializePhetioObject( {}, {
        tandem: Tandem.rootTandem.createTandem( 'utteranceQueue' ),
        phetioType: UtteranceQueueIO,
        phetioState: false
      } );
    }
  } );

  var instance = new utteranceQueue();

  sceneryPhet.register( 'utteranceQueue', instance );

  return instance;
} );