/* global geocode */

(function(){
  'use strict';

  $(document).ready(function(){
    $('button[type=submit]').click(addTrip);
  });

  function addTrip(e){
    var origin      = $('#origin').val(),
        destination = $('#destination').val();

    geocode(origin, function(originName, originLat, originLng){
      geocode(destination, function(destinationName, destinationLat, destinationLng){
        $('input[name=originname]').val(originName);
        $('input[name=originlat]').val(originLat);
        $('input[name=originlng]').val(originLng);
        $('input[name=destinationname]').val(destinationName);
        $('input[name=destinationlat]').val(destinationLat);
        $('input[name=destinationlng]').val(destinationLng);
        $('form').submit();
      });
    });

    e.preventDefault();
  }
})();

