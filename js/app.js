/**
 * This is going to be the core of our desktop app.
 */

// Show the Developer Tools. And yes, Node-Webkit has developer tools built in! Uncomment it to open it automatically
//require('nw.gui').Window.get().showDevTools();

// Express is a web server, will will allow us to create a small web app with which to control the player
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

// We'll be opening up our web server on Port 8080 (which doesn't require root privileges)
// You can access this server at http://127.0.0.1:8080
var serverPort = 8080;
server.listen(serverPort);

// The web server will serve the assets needed for our remote control.
// These assets are in the remote folder
app.use('/', express.static('remote'));


// Socket.io handles the communication between the remote and our app in real time, 
// so we can instantly send commands from a computer to our remote and back
io.on('connection', function (socket) {

  // When a remote connects to the app, let it know immediately the current status of the video (play/pause)
  socket.emit('statusChange', Youtube.status);

  // This is what happens when we receive the watchVideo command (picking a video from the list)
  socket.on('watchVideo', function (video) {
    // video contains a bit of info about our video (id, title, thumbnail)
    // Order our Youtube Player to watch that video
    Youtube.watchVideo(video);
  });

  // These are playback controls. They receive the “play” and “pause” events from the remote
  socket.on('play', function () {
    Youtube.playVideo();
  });
  socket.on('pause', function () {
    Youtube.pauseVideo();
  });

});


// Notify all the remotes when the playback status changes (play/pause)
// This is done with io.emit, which sends a message to all the remotes
Youtube.onStatusChange = function(status) {
  io.emit('statusChange', status);
};


// To make things easier, find out the machine's ip and show if to the user so it's easier to connect to the app.
// Just make sure you are on the same WiFi Network.
// BTW, this is one of the few cases when a QR Code actually becomes a good idea.
function getLocalIP(callback) {
  require('dns').lookup( require('os').hostname(),
    function (err, add, fam) {
      typeof callback == 'function' ? callback(add) : null;
    });
}

getLocalIP(function(ip){
  $('#serverInfo h1').html('Go to<br/><strong>http://'+ip+':'+serverPort+'</strong><br/>to open the remote');
});

