// This is how the player communicates with the app to Watch/Play/Pause Videos due to the Youtube Embed Restrictions
// It has an exclusive server/websocket

var socket = io.connect();

socket.on('watchVideo', function(video){
  watchVideo(video);
});

socket.on('play', function(){
  playVideo();
});

socket.on('pause', function(){
  pauseVideo();
});

socket.on('stop', function(){
  stopVideo();
});


// Load the Youtube Iframe API
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

function onYouTubeIframeAPIReady() {

}
function onPlayerReady(event) {
  event.target.playVideo();
}
function onPlayerStateChange(event) {
  if( event.data === YT.PlayerState.PLAYING ) {
    socket.emit('nowPlaying');
  }
  else if( event.data === YT.PlayerState.PAUSED ) {
    socket.emit('nowPaused');
  }
  else if( event.data === YT.PlayerState.BUFFERING ) {
    socket.emit('nowBuffering');
  }
  else if( event.data === YT.PlayerState.ENDED ) {
    socket.emit('nowStopped');
  }
  
  else if( event.data === YT.PlayerState.CUED ) {
    // Cued is when the video is ready to play
    socket.emit('nowPaused');
  }
  else if( event.data === -1 ) {
    // -1 Means "Unstarted" (Loading)
    socket.emit('nowLoading');
  }
}


var player = null;
function watchVideo(video) {
  if( player === null ) {
    player = new YT.Player('player', {
      height: '100%',
      width: '100%',
      origin: 'http://127.0.0.1',
      videoId: video.id,
      autoplay: 1, // Autoplay!
      enablejsapi: 1, // JS API
      modestbranding: 1, // Hide the Youtube Logo as much as possible
      rel: 0, // No related videos
      showinfo: 1, // Show uploader info
      autohide: 1, // Hide the controls on blur
      controls: 2, // Faster controls
      fs: 0, // No fullscreen
      iv_load_policy: 3, // No annotations
      loop: 0, // No looping
      events: {
        'onReady': onPlayerReady,
        'onStateChange': onPlayerStateChange
      }
    });
  }
  else {
    player.loadVideoById(video.id);
  }
}

function playVideo() {
  player.playVideo();
}
function pauseVideo() {
  player.pauseVideo();
}
function stopVideo() {
  player.stopVideo();
}

