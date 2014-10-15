# Building a Remote-Controlled TV with Node-Webkit

![Youtube TV](https://github.com/Aerolab/youtube-tv/blob/master/assets/youtube-tv.jpg?raw=true)

Node-Webkit is one of the most promising technologies to come out in the last few years: It lets you ship a native desktop app for Windows, Mac and Linux **just using HTML, CSS and some of Javascript**. Those are the exact same languages you use to build any web app. You basically get you very own Frameless Webkit to build your app, which is then supercharged with NodeJS, giving you access to some powerful libraries that are not available in a typical browser.

As a demo, we are going to build a Remote-Controlled Youtube App. This involves creating native app that displays YouTube videos on your computer, as well as a mobile client that will let you search and pick the videos you want to watch straight from your couch.


## Getting Started

First of all, you need to install Node.JS (a Javascript platform), which you can download from [http://nodejs.org/download/](http://nodejs.org/download/) . The installer comes bundled with NPM (the Node.JS Package Manager), which lets you install everything you need for this project.

Since we are going to be building two apps (a desktop app and a mobile app), it’s better if we get the boring HTML+CSS part out of the way, so we can concentrate on the Javascript part of the equation.

**Download the files from [https://github.com/Aerolab/youtube-tv/blob/master/assets/basics.zip](https://github.com/Aerolab/youtube-tv/blob/master/assets/basics.zip?raw=true) and put them in a new folder**. You can name the project folder youtube-tv or whatever you want. The folder should look like this:

```
- index.html   // This is the starting point for our desktop app
- css          // Our desktop app styles
- js           // This is where the magic happens
- remote       // This is where the magic happens (Part 2)
- libraries    // FFMPEG libraries, which give you H.264 support in Node-Webkit
- player       // Our youtube player
- Gruntfile.js // Build scripts
- run.bat      // run.bat runs the app on Windows
- run.sh       // sh run.sh runs the app on Mac
```

Now open the Terminal (on Mac or Linux) or a new Command Prompt (on Windows) right in that folder. Now we’ll install a couple of dependencies we need for this project, so type these commands to install node-gyp and grunt-cli. Each one will take a few seconds to download and install:

**On Mac or Linux**
```
sudo npm install node-gyp -g
sudo npm install grunt-cli -g
```

**On Windows**
```
npm install node-gyp -g
npm install grunt-cli -g
```

Leave the Terminal open. We’ll be using it again in a bit.

All Node.JS apps start with a package.json file (our manifest), which holds most of the settings for your project, including which dependencies you are using. Go ahead and create your own package.json file (right inside the project folder) with the following contents. Feel free to change anything you like, like the project name, the icon or anything else. Check out the documentation at [https://github.com/rogerwang/node-webkit/wiki/Manifest-format](https://github.com/rogerwang/node-webkit/wiki/Manifest-format).

```json
{
  "//": "The // keys in package.json are comments.",

  "//": "Your project’s name. Go ahead and change it!",
  "name": "Remote",
  "//": "A simple description of what the app does.",
  "description": "An example of node-webkit",
  "//": "This is the first html the app will load. Just leave this this way",
  "main": "app://host/index.html",
  "//": "The version number. 0.0.1 is a good start :D",
  "version": "0.0.1",

  "//": "This is used by Node-Webkit to set up your app.",
  "window": {
    "//": "The Window Title for the app",
    "title": "Remote",
    "//": "The Icon for the app",
    "icon": "css/images/icon.png",
    "//": "Do you want the File/Edit/Whatever toolbar?",
    "toolbar": false,
    "//": "Do you want a standard window around your app (a title bar and some borders)?",
    "frame": true,
    "//": "Can you resize the window?",
    "resizable": true
  },
  "webkit": {
    "plugin": false,
    "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_5) AppleWebKit/537.36 (KHTML, like Gecko) Safari/537.36"
  },

  "//": "These are the libraries we’ll be using:",
  "//": "Express is a web server, which will handle the files for the remote",
  "//": "Socket.io lets you handle events in real time, which we'll use with the remote as well.",
  "dependencies": {
    "express": "^4.9.5",
    "socket.io": "^1.1.0"
  },

  "//": "And these are just task handlers to make things easier",
  "devDependencies": {
    "grunt": "^0.4.5",
    "grunt-contrib-copy": "^0.6.0",
    "grunt-node-webkit-builder": "^0.1.21"
  }
}
```


You’ll also find Gruntfile.js, which takes care of downloading all of the node-webkit assets and building the app once we are ready to ship. Feel free to take a look into it, but it’s mostly boilerplate code.

Once you’ve set everything up, go back to the Terminal and install everything you need by typing:

```
npm install
grunt nodewebkitbuild
```

*Note:* You may run into some issues when on Mac or Linux. In that case, try using "sudo npm install" and "sudo grunt nodewebkitbuild".

**npm install** installs all of the dependencies you mentioned in package.json, both the regular dependencies and the development ones, like grunt and grunt-nodewebkitbuild, which downloads the windows and mac version of node-webkit, setting them up so they can play videos, and building the app.

Wait a bit for everything to install properly and we’re ready to get started.

*Note:* If you are using Windows, you might get a scary error related to Visual C++ when running npm install. Just ignore it.


## Building the desktop app

All web apps (or websites for that matter) start with an index.html file. We are going to be creating just that to get our app to run.

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Youtube TV</title>

  <link href='http://fonts.googleapis.com/css?family=Roboto:500,400' rel='stylesheet' type='text/css' />
  <link href="css/normalize.css" rel="stylesheet" type="text/css" />
  <link href="css/styles.css" rel="stylesheet" type="text/css" />
</head>
<body>

  <div id="serverInfo">
    <h1>Youtube TV</h1>
  </div>

  <div id="videoPlayer">
    
  </div>

  <script src="js/jquery-1.11.1.min.js"></script>

  <script src="js/youtube.js"></script>
  <script src="js/app.js"></script>

</body>
</html>
```

As you may have noticed, we are using three scripts for our app: **jQuery** (pretty well known at this point), **a Youtube video player**, and finally **app.js, which contains our app's logic**. Let’s dive into that!

First of all, we need to create the basic elements for our remote control. The easiest way of doing this is to create a basic web server and serve a small web app that can search Youtube, select a video and have some play/pause controls so we don’t have any good reasons to get up from the couch. **Open js/app.js and type the following**:

```js
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

// All the static files (css, js, html) for the remote will be served using Express.
// These assets are in the /remote folder
app.use('/', express.static('remote'));
```


On those 7 lines of code (not counting comments) we just got a neat web server working on port 8080. If you were paying attention to the code, you may have noticed that we required something called **socket.io**. This lets us use [websockets](https://developer.mozilla.org/en/docs/WebSockets) with minimal effort, which means we can communicate with from and to our remote instantly. You can learn more about Socket.io at [http://socket.io/](http://socket.io/). Let’s set that up next in app.js:

```js
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
// This is done with io.emit, which sends the same message to all the remotes
Youtube.onStatusChange = function(status) {
  io.emit('statusChange', status);
};
```

That’s the desktop part done! In a few dozen lines of code we got a web server running at http://127.0.0.1:8080 that can receive commands from a remote to Watch a specific Video, as well as handling some basic playback controls (Play and Pause). We are also notifying the remotes of the status of the player as soon as they connect so they can update their UI with the correct buttons (if it’s playing, show the pause button and vice versa). Now we just need to build the remote.



## Building the Remote Control

The server is just half of the equation: We also need to add the corresponding logic on the Remote Control, so it’s able to communicate with our app. On remote/index.html, add the following HTML:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset=“utf-8” />
  <title>TV Remote</title>

  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />

  <link rel="stylesheet" href="/css/normalize.css" />
  <link rel="stylesheet" href="/css/styles.css" />
</head>
<body>

  <div class="controls">
    <div class="search">
      <input id="searchQuery" type="search" value="" placeholder="Search on Youtube..." />
    </div>
    <div class="playback">
      <button class="play">&gt;</button>
      <button class="pause">||</button>
    </div>
  </div>

  <div id="results" class="video-list">

  </div>

  <div class="__templates" style="display:none;">
    <article class="video">
      <figure><img src="" alt="" /></figure>

      <div class="info">
        <h2></h2>
      </div>

    </article>
  </div>


  <script src="/socket.io/socket.io.js"></script>
  <script src="/js/jquery-1.11.1.min.js"></script>

  <script src="/js/search.js"></script>
  <script src="/js/remote.js"></script>

</body>
</html>
```


Again, we have a few libraries: **Socket.io** is served automatically by our desktop app at /socket.io/socket.io.js, and it manages the communication with the server. **jQuery** is somehow always there, **search.js** manages the integration with the Youtube API (you can take a look if you want), and **remote.js handles the logic for the remote**.

The remote itself is pretty simple. It can look for videos on Youtube, and when we click on a video, it connects with the app, telling it to play the video with socket.emit. Let’s dive into **remote/js/remote.js** to make this thing work:

```js
// First of all, connect to the server (our desktop app)
var socket = io.connect();

// Search youtube when the user stops typing. This gives us an automatic search.
var searchTimeout = null;
$('#searchQuery').on('keyup', function(event){
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(function(){
    searchYoutube($('#searchQuery').val());
  }, 500);
});

// When we click on a video, watch it on the App
$('#results').on('click', '.video', function(event){
  // Send an event to notify the server we want to watch this video
  socket.emit('watchVideo', $(this).data());
});


// When the server tells us that the player changed status (play/pause), alter the playback controls
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
```


This is very similar to our server, except we are using socket.emit a lot more often to send commands back to our desktop app, telling it which videos to play and handle our basic play/pause controls.

The only thing left to do is make the app run. Ready? Go to the Terminal again and type:

**If you are on a Mac:**
```
sh run.sh
```

**If you are on Windows:**
```
run.bat
```

If everything worked properly, you should be both seeing the app and if you open a web browser to **[http://127.0.0.1:8080](http://127.0.0.1:8080)** the remote client will open up. Search for a video and pick anything you like, and it’ll play in the app. This also works if you point any other device on the same network to your computer’s ip, which brings me to the next (and last) point.


## Finishing touches

There is one small improvement we can make: Print out the computer’s IP to make it easier to connect to the app from any other device on the same wifi network (like a smartphone). On **js/app.js** add the following code to find out the IP and update our UI so it’s the first thing we see when we open the app.

```js
// Find the local IP
function getLocalIP(callback) {
  require('dns').lookup( require('os').hostname(),
    function (err, add, fam) {
      typeof callback == 'function' ? callback(add) : null;
    });
}

// To make things easier, find out the machine's ip and communicate it
getLocalIP(function(ip){
  $('#serverInfo h1').html('Go to<br/><strong>http://'+ip+':'+serverPort+'</strong><br/>to open the remote');
});
```

The next time you run the app, the first thing you’ll see is the IP for your computer, so you just need to type that URL in your smartphone to open the remote and control the player from any computer, tablet or smartphone (as long as they are in the same WiFi network). That's it!

You can start expanding on this to improve the app:

• Why not open the app on fullscreen by default?

• Why not get rid of the horrible default frame and create your own? You can actually designate any div as a window handle with CSS (using -webkit-app-region: drag), so you can drag the window by that div and create your own custom title bar.

While the app has a lot of interlocking parts, it's a good first project to find out what you can achieve with Node-Webkit in just a few minutes. I hope you enjoyed this post!
