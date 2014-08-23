/* global createMap, geocode, async, addMarker, google */

(function(){
  'use strict';

  var map, locations;

  $(document).ready(function(){
    map = createMap('show-map', 39, -95, 3);
    $('#add-stop').click(addStop);
    $('button[type=submit]').click(geoAndSubmit);
    locations = getLocations();
    locations.forEach(function(loc){
      addMarker(map, loc.lat, loc.lng, loc.name);
    });
    displayDirections();
  });

  function geoAndSubmit(e){
    var places = $('input').toArray().map(function(input){
      return $(input).val();
    });

    async.map(places, iterator, result);

    e.preventDefault();
  }

  function iterator(place, cb){
    geocode(place, function(name, lat, lng){
      cb(null, {name:name, lat:lat, lng:lng});
    });
  }

  function result(err, places){
    places.forEach(function(place, index){
      $('form').prepend('<input name="places['+index+'][name]" value="'+place.name+'" type="hidden">');
      $('form').prepend('<input name="places['+index+'][lat]" value="'+place.lat+'" type="hidden">');
      $('form').prepend('<input name="places['+index+'][lng]" value="'+place.lng+'" type="hidden">');
    });

    $('form').submit();
  }

  function addStop(){
    var $last  = $('form > .stop-group:last-of-type'),
        $clone = $last.clone();

    $last.after($clone);
  }

  function getLocations(){
    return $('#origin, .stop, #destination').toArray().map(function(tr){
      var name   = $(tr).attr('data-name'),
          lat    = $(tr).attr('data-lat') * 1,
          lng    = $(tr).attr('data-lng') * 1;
      return {name:name, lat:lat, lng:lng};
    });
  }

  function displayDirections(){
    var directionsService = new google.maps.DirectionsService(),
        directionsDisplay = new google.maps.DirectionsRenderer();
    directionsDisplay.setMap(map);
    directionsDisplay.setPanel(document.getElementById('directions'));

    var waypoints = locations.map(function(loc){
      return new google.maps.LatLng(loc.lat, loc.lng);
    });

    if(waypoints.length > 1){
      var origin      = waypoints[0],
          destination = waypoints[waypoints.length - 1];
      waypoints.shift();
      waypoints.pop();

      waypoints = waypoints.map(function(wp){
        return {location:wp, stopover:true};
      });

      var request = {
        origin:origin,
        destination:destination,
        waypoints:waypoints,
        optimizeWaypoints: false,
        travelMode: google.maps.TravelMode.DRIVING
      };

      directionsService.route(request, function(response, status){
        if(status === google.maps.DirectionsStatus.OK){
          computeDistance(response);
          directionsDisplay.setDirections(response);
        }
      });
    }
  }

  function computeDistance(response){
    if(response.routes.length){
      var distance = response.routes[0].legs.reduce(function(sum, leg){
        return leg.distance.value + sum;
      }, 0);

      distance /= 1609.34; // convert meters to miles
      var current = $('#distance').attr('data-distance') * 1;

      distance = Math.round(distance);
      current = Math.round(current);

      if(distance !== current){
        var id   = $('#id').attr('data-id'),
            url  = '/trips/' + id + '/distance',
            type = 'put',
            data = {distance:distance};

        $.ajax({url:url, type:type, data:data, dataType:'json', success:function(data){
          $('#distance').attr('data-distance', distance).text(distance.toFixed(2) + ' miles');
        }});
      }
    }
  }
})();

