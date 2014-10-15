/**
 * This is where the magic happens (Part 2)
 * Now we are going to send commands to our Desktop App
 */

var requestHandle = null;
var searchYoutube = function(query, callback) {

  var maxResults = 25;

  // This searches the Youtube API endpoint and loads a list of results
  var endpoint = "http://gdata.youtube.com/feeds/api/videos?q="+ encodeURIComponent(query) +"&format=5&v=2&max-results="+ maxResults +"&alt=jsonc";

  if( requestHandle !== null ){ requestHandle.abort(); }

  requestHandle = $.ajax({
    type: "GET",
    url: endpoint,
    dataType: "jsonp",
    success: function(response) {
      renderSearchResults( response.data.items );

      if( typeof callback === 'function' ) {
        callback();
      }
    }
  });

};


var renderSearchResults = function( videos ) {

  $('#results').html('');
  var $template = $(".__templates .video");

  if( typeof videos === 'undefined' || videos.length <= 0 ){ return; }

  videos.forEach(function(video){
    // You should really use something like handlebars here
    var $video = $template.clone();

    $video.data('id', video.id);
    $video.data('title', video.title);
    $video.data('thumbnail', video.thumbnail.hqDefault);

    $video.find('img').attr('src', video.thumbnail.hqDefault );
    $video.find('h2').text( video.title );

    $('#results').append($video);
  });

};
