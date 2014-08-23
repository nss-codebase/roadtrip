/* global createMap */

(function(){
  'use strict';

  var map;

  $(document).ready(function(){
    var lat = $('#stop').attr('data-lat') * 1,
        lng = $('#stop').attr('data-lng') * 1;

    map = createMap('stop-map', lat, lng, 11);
    $('#event-add').click(addEvent);
  });

  function addEvent(){
    var id   = $('#stop').attr('data-id'),
        stop = $('#stop').attr('data-index'),
        name = $('#event-name').val(),
        url  = '/trips/' + id + '/stops/' + stop + '/events',
        type = 'post',
        data = {name:name};

    $.ajax({url:url, type:type, data:data, dataType:'html', success:function(html){
      $('#events').empty().append(html);
      $('#event-name').val('');
    }});
  }
})();

