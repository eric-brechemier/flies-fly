// within.js - v1.0.0 - Stable.
// https://github.com/eric-brechemier/within (License: CC0)
//
// within is a factory of semi-private spaces
// where properties and events can be shared
// in isolation.
//
// Usage:
//
//   // Run code within a module
//   within( "your.domain/path", function( publish, subscribe, get, set ) {
//     // semi-private space
//   });
//
//   // Access a shared space by name
//   within( "your.domain/path" ).set( "property", "value" );
//
//   // Create an anonymous space for single use
//   var space = within();

// from sub/nada/privately.js (CC0)
function privately( func ) {
  return func();
}

privately(function() {
  var
    undef, // do not trust global undefined, which can be set to a value
    dataSpaces = {},
    eventSpaces = {},
    has,
    call;

  // from sub/nada/no.js (CC0)
  function no( value ) {
    return value === null || value === undef;
  }

  // from sub/nada/copy.js (CC0)
  function copy( array ) {
    return [].concat( array );
  }

  // from sub/nada/remove.js (CC0)
  function remove( array, value ) {
    var i;
    for ( i = array.length; i >= 0; i-- ) {
      if ( array[ i ] === value ){
        array.splice( i, 1 );
      }
    }
  }

  // from sub/nada/forEach.js (CC0)
  function forEach( array, callback ) {
    var
      isBreak = false,
      i,
      length = array.length;

    for ( i = 0; i < length && !isBreak ; i++ ){
      isBreak = callback( array[ i ], i ) === true;
    }

    return isBreak;
  }

  // from sub/nada/bind.js (CC0)
  function bind( func, object ) {
    return function() {
      return func.apply( object, arguments );
    };
  }

  // from sub/nadasurf/alias.js (CC0)
  function alias( func ) {
    return bind( func.call, func );
  }

  has = alias( Object.prototype.hasOwnProperty );
  call = alias( Function.prototype.call );

  /*
    Function: within( [name, [callback]] ): any
    Create a semi-private space to share properties and events

    Parameters:
      name - string, optional, name of the symbolic space:
             a domain name and path that you control on the Web.
             Example: "github.com/eric-brechemier/within/tests/module1"
      callback - function( publish, subscribe, get, set ), optional, function
                 called immediately in the context ('this') of the space data
                 object with four functions (described separately below) as
                 arguments to share events and properties within the space.

    Returns:
      any, the value returned by the callback function,
      or a space function with the four methods publish, subscribe, get, set,
      to interact with the space data when the callback function is omitted;
      the space function can then be called at any point with the same kind
      of callback function described above to run code within the space.
      When no name is provided, an anonymous module is created for single use,
      for which no reference is kept in the internal space factory.
  */
  function within( name, callback ) {
    var
      // data space - object(string -> any), set of properties
      dataSpace,
      // event space - object(string -> array of functions), event listeners
      eventSpace;

    if ( no( name ) ) {
      dataSpace = {};
      eventSpace = {};
    } else {
      if ( !has( dataSpaces, name ) ) {
        dataSpaces[ name ] = {};
        eventSpaces[ name ] = {};
      }
      dataSpace = dataSpaces[ name ];
      eventSpace = eventSpaces[ name ];
    }

    /*
      Function: get( name ): any
      Retrieve the value of a property

      Parameter:
        name - string, the name of a property in module data object

      Returns:
        any, the value of the property with given name
        in the own properties of the module data object
    */
    function get( name ) {
      if ( !has( dataSpace, name ) ){
        return undef;
      }
      return dataSpace[ name ];
    }

    /*
      Function: set( name, value )
      Set the value of a property of the module

      Parameters:
        name - string, the name of a property in module data object
        value - any, the new value of the property
    */
    function set( name, value ) {
      dataSpace[ name ] = value;
    }

    /*
      Function: publish( name, value )
      Set the value of a property and fire listeners registered for this event
      in this module and in this module only, until a listener returns true or
      all listeners have been called.

      Parameters:
        name - string, the name of an event and the associated property
        value - any, optional, the new value of the property, also provided
                to listeners, defaults to boolean value true
    */
    function publish( name, value ) {
      var listeners;
      if ( arguments.length < 2 ) {
        value = true;
      }
      set( name, value );
      if ( !has( eventSpace, name ) ) {
        return;
      }
      listeners = copy( eventSpace[ name ] );
      forEach( listeners, function( listener ) {
        return call( listener, dataSpace, value );
      });
    }

    /*
      Function: subscribe( name, listener ): function
      Register a callback function for the event of given name

      Parameters:
        name - string, the name of an event and the related property
        listener - function( value ), the callback triggered in the context of
                   the module data object:
                   - immediately, if the property with given name has been set,
                     with the value of the property as parameter
                   - then each time the event with given name is published
                     until the subscription is cancelled, with the value of
                     the property when the event is published as parameter.

      Returns:
        function(), the function to call to remove current callback function
        from listeners and prevent it from receiving further notifications
        for this event.
    */
    function subscribe( name, listener ) {
      var listeners;
      if ( !has( eventSpace, name ) ) {
        eventSpace[ name ] = [];
      }
      listeners = eventSpace[ name ];
      listeners.push( listener );
      if ( has( dataSpace, name ) ) {
        call( listener, dataSpace, dataSpace[ name ] );
      }
      return function unsubscribe() {
        remove( listeners, listener );
      };
    }

    /*
      Function: space( callback ): any
      Run code in the given space

      Parameter:
        callback - function( publish, subscribe, get, set ), optional, function
                   called immediately in the context ('this') of the space data
                   object with four functions (described above) as arguments to
                   share events and properties within the space.

      Returns:
        any, the value returned by the callback function,
        or undefined
    */
    function space( callback ) {
      return callback.apply( dataSpace, [ publish, subscribe, get, set ] );
    }

    if ( arguments.length < 2 ) {
      space.publish = publish;
      space.subscribe = subscribe;
      space.get = get;
      space.set = set;
      return space;
    }

    return space( callback );
  }

  // export to global 'this'
  this.within = within;
});
