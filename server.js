#!/usr/bin/env node

var app = require('express')(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    port = 9090,
    url  = 'http://localhost:' + port + '/';

if (process.env.SUBDOMAIN) {
  url = 'http://' + process.env.SUBDOMAIN + '.jit.su/';
}

server.listen(port);
console.log("Express server listening on port " + port);
console.log(url);

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

app.get('/item/:number', function (req, res) {
  res.sendfile(__dirname + '/items/' + req.param("number") + '.json');
});

var comments = {
  1: [], 2: [], 3: [], 4: [], 5: [], 6: []
};

io.sockets.on('connection', function (socket) {

  socket.on('listcomments', function(data) {
    if (typeof data.number === "undefined" || typeof comments[data.number] === "undefined") {
      return;
    }
    var number = data.number;
    socket.emit('comments', { data: comments[number] });
  });

  socket.on('addcomment', function (data) {
    if (typeof data.number === "undefined" || typeof comments[data.number] === "undefined") {
      return;
    }
    var number = data.number;

    comments[number].push({
      number: data.number,
      username: data.username,
      comment: data.comment,
      avatar: data.avatar,
      created: new Date()
    });
    
    console.log("Comment added to : " + data.number + " ", data);
    io.sockets.emit('commentupdated', { data: data });
  });

});
