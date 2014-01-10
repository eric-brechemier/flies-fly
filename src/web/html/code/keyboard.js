within("ukulo.com/flies-fly", function( publish, subscribe, get ) {

  var
    // ASCII code of the space character
    SPACE_KEYCODE = 32;

  function no( value ) {
    var undef; // do not trust global undefined, which can be set to a value
    return value === null || value === undef;
  }

  function or( a, b ) {
    return no( a )? b: a;
  }

  function getKeyCode( event ) {
    event = or( event, window.event );
    return event.keyCode;
  }

  function isSpaceBar( event ) {
    return getKeyCode( event ) === SPACE_KEYCODE;
  }

  function reportPlayerMove( position ) {
    return function( event ) {
      if ( isSpaceBar( event ) ) {
        if ( get( "player-hand-position" ) !== position ) {
          publish( "player-hand-position", position );
        }
      }
    };
  }

  window.onkeydown = reportPlayerMove( "down" );
  window.onkeyup   = reportPlayerMove( "up"   );
});
