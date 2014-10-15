/**
 * This is where the magic happens (Part 2)
 * Now we are going to send commands to our Desktop App
 */

// First of all, connect to the server (our desktop app)
var socket = io.connect();

// Search youtube when the user stops typing. This gives us an automatic autocomplete.
var searchTimeout = null;
$('#searchQuery').on('keyup', function(event){
  // Cancel any queued searches
  clearTimeout(searchTimeout);

  // If the user pressed enter, search inmediately
  if( event.keyCode === 13 ) {
    // Show the loading gif and hide it when the search is done
    $('.loading').show();
    searchYoutube($('#searchQuery').val(), function(){ $('.loading').hide(); });
  }
  else {
    // If not, wait a bit before searching automatically
    searchTimeout = setTimeout(function(){
      // Show the loading gif and hide it when the search is done
      $('.loading').show();
      searchYoutube($('#searchQuery').val(), function(){ $('.loading').hide(); });
    }, 500);
  }
});


// When we click on a video, watch it on the App
$('#results').on('click', '.video', function(event){
  // Send an event to notify the server we want to watch this video
  socket.emit('watchVideo', $(this).data());
});


// When the server tells us that the player changed status (play/pause), alter the controls
socket.on('statusChange', function(status){
  if( status === 'play' ) {
    $('.playback .pause').show();
    $('.playback .play').hide();
  }
  else if( status === 'pause' || status === 'stop' ) {
    $('.playback .pause').hide();
    $('.playback .play').show();
  }
});


// Notify the app when we hit the play button
$('.playback .play').on('click', function(event){
  socket.emit('play');
});

// Notify the app when we hit the pause button
$('.playback .pause').on('click', function(event){
  socket.emit('pause');
});