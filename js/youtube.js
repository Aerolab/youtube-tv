/**
 * This handles the Youtube Embed, since it's very fiddly with app://host and tends to break or just not work.
 * We basically create an iframe and serve another client inside that with a "normal" url.
 */

// Our own "Youtube API" to camouflage this hack
var Youtube = new (function() {

  var status = 'stop';
  this.onStatusChange = null;

  // Watch a specific video (args is an object with id, title and thumbnail of the video)
  this.watchVideo = function(video) {
    this.setStatus('play');
    ytIo.emit('watchVideo', video);
  };

  // These are simple playback controls
  this.playVideo = function() {
    this.setStatus('play');
    ytIo.emit('play');
  };
  this.pauseVideo = function() {
    this.setStatus('pause');
    ytIo.emit('pause');
  };
  this.stopVideo = function() {
    this.setStatus('stop');
    ytIo.emit('stop');
  };


  this.setStatus = function(status) {
    this.status = status;
    if( typeof this.onStatusChange === 'function' ) {
      this.onStatusChange(status);
    }
  };
  this.getStatus = function() {
    return status;
  };

});


// The web server will serve the assets needed for our video player
window.ytExpress = require('express');
window.ytApp = ytExpress();
window.ytServer = require('http').Server(ytApp);
window.ytServerPort = 9090;
window.ytIo = require('socket.io')(ytServer);
ytServer.listen(ytServerPort);

ytApp.use('/', ytExpress.static('player'));


$('#videoPlayer').html('<iframe src="http://127.0.0.1:'+ ytServerPort +'" nwfaketop></iframe>')


// We can receive status events from the player (usually play/pause)
ytIo.on('connection', function (socket) {

  socket.on('nowPlaying', function (video) {
    Youtube.setStatus('play');
  });

  socket.on('nowPaused', function (video) {
    Youtube.setStatus('pause');
  });

  socket.on('nowStopped', function (video) {
    Youtube.setStatus('stop');
  });

});
