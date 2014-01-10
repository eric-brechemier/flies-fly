within("ukulo.com/flies-fly", function( publish, subscribe, get, set ) {

  var
    sentence = "Flies fly",
    correction = "<em>Yes</em>, flies <em class='valid'>do</em> fly!";
  set( "expected-hand-position", "up" );

  subscribe( "start-round", function() {
    publish( "teacher-says", sentence );
  });

  subscribe( "end-round", function() {
    // TODO: update sentence
  });

  subscribe( "player-eliminated", function() {
    publish( "teacher-says", correction );
  });

});
