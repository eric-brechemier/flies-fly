within("ukulo.com/flies-fly", function( publish, subscribe, get, set ) {

  var
    // maximum duration of a round (when player hand stays down), in ms
    MAX_ROUND_DURATION_MS = 2000,

    // timeout for end of round
    endRoundTimeout = null;

  set( "game-over", false );

  function resetTimeout( timeout ) {
    if ( timeout !== null ) {
      clearTimeout( timeout );
    }
    timeout = null;
  }

  function startRound() {
    if ( get( "game-over" ) ) {
      return;
    }
    publish( "start-round" );
    endRoundTimeout = setTimeout(endRound, MAX_ROUND_DURATION_MS);
  }

  function endRound() {
    resetTimeout( endRoundTimeout );
    if ( get( "game-over" ) ){
      return;
    }
    publish( "end-round" );
    if ( get( "player-hand-position" ) !== get( "expected-hand-position" ) ) {
      publish( "player-eliminated" );
      set( "game-over", true );
      publish( "end-game" );
    }
  }

  subscribe( "player-hand-position", function( position ) {
    if ( position === "down" ) {
      startRound();
    } else {
      endRound();
    }
  });

});
