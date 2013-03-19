var express = require('express')
  , stylus = require('stylus')
  , crypto = require('crypto')
  , app = express()
  , server = app.listen(8080)
  , io = require('socket.io').listen(server)
  , files = {};

app.set('view engine', 'jade');
app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
  res.render('sender', {});
});


app.get('/get/:secure', function(req, res){
  if (files[req.params.secure]) {
    res.render('receiver', {name:files[req.params.secure].name,token:req.params.secure});
  } else {
    res.render('receiver', {name:0});
  }
});


app.get('/file/get/:secure', function(req, res){
  if (files[req.params.secure]) {
    io.sockets.emit('start', {token:req.params.secure});
    io.sockets.emit('moreData', {place:0, percent:0, token:req.params.secure});

    res.setHeader('Content-disposition', 'attachment; filename=' + files[req.params.secure].name);
    res.setHeader('Content-Length', files[req.params.secure].fileSize);

    var intervalID = setInterval(function(){
      if (files[req.params.secure].data.length){
        res.write(files[req.params.secure].data, 'binary');
        files[req.params.secure].data = '';
      }
      if (files[req.params.secure].isLoaded) {  
        res.end(); 
        clearInterval(intervalID);
        delete files[req.params.secure];
      }
    }, 1000);
  } else {
    res.redirect('/get/file-not-found')
  }
});


io.sockets.on('connection', function (socket) {

  socket.on('save', function (d) {
    crypto.randomBytes(12, function(ex, buf) {
      var token = buf.toString('hex');
      files[token] = {
        name: d.name,
        fileSize: d.size,
        data: "",
        downloaded: 0,
        isLoaded: false
      };
      socket.emit('url', {token:token});
    });
  });

  socket.on('upload', function (d){
    files[d.token].downloaded += d.data.length;
    files[d.token].data += d.data;
    
    if(files[d.token].downloaded == files[d.token].fileSize) {
      files[d.token].isLoaded = true;
      socket.emit('done', {name:files.name});
    } else {
      var place = files[d.token].downloaded / 524288
        , percent = (files[d.token].downloaded / files[d.token].fileSize) * 100;
      socket.emit('moreData', {place:place, percent:percent, token:d.token});
    }
  });
});