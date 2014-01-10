within("ukulo.com/flies-fly", function( publish, subscribe ) {

  var
    DISPLAY_ID = "display",
    display = document.getElementById( DISPLAY_ID );

  function print( message ) {
    display.innerHTML = message;
  }

  subscribe( "teacher-says", function( sentence ) {
    print( sentence );
  });

  subscribe( "end-round", function() {
    print( "" );
  });

});
