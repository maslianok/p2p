var socket = io.connect('http://localhost:8080/');
var FReader, token, selectedFile;

$(function(){
  if(window.File && window.FileReader){ 
    $('#uploadbutton').click(function(){
      if($('#filebox').val() != "") {
        FReader = new FileReader();
        FReader.onload = function(evnt){
          socket.emit('upload', {name:selectedFile.name, data:evnt.target.result, token:token});
        }
        socket.emit('save', {name:selectedFile.name, size:selectedFile.size});
      } else {
        alert("Выберите файл");
      }
    })

    $('#filebox').change(function(e){
      selectedFile = e.target.files[0];
    });
  } else {
    $('#uploadarea').text('Ваш браузер не поддерживает File API');
  }
})

socket.on('url', function (d){
  token = d.token;
  var link = 'http://'+window.location.hostname+(location.port?':'+location.port:'')+'/get/'+d.token;
  $('#uploadarea').html('<span>Ссылка на скачивание файла: <a href="'+link+'" target="_blank">'+link+'</a></span>');
});

socket.on('start', function (d){
  if (token == d.token) {
    $('#uploadarea')
      .empty()
      .append($('<span/>').attr('id','NameArea').text('Отправка '+selectedFile.name))
      .append($('<div/>').attr('id','progressContainer').append($('<div/>').attr('id','progressBar')))
      .append($('<span/>').attr('id','percent').text('0%'))
      .append('<span id="Uploaded"> - <span id="MB">0</span>/'+Math.round(selectedFile.size/1048576)+'MB</span>');
  }
});

socket.on('moreData', function (d){
  if (token == d.token) {
    updateBar(d.percent);
    var place = d.place * 524288
      , newFile;
    selectedFile.slice = selectedFile.slice || selectedFile.mozSlice;
    newFile = selectedFile.slice(place, place + Math.min(524288, (selectedFile.size-place)));
    FReader.readAsBinaryString(newFile);
  }
});

socket.on('done', function (d){
  $('#uploadarea').html("Файл передан. <button type='button' name='upload' value='' id='restart' class='btn'>Отправить еще</button>")
  $('#restart').css('left','20px').click(function(){
    location.reload(true);
  });
});

function updateBar(percent){
  $('#progressBar').css('width', percent+'%');
  $('#percent').html((Math.round(percent*100)/100)+'%');
  $('#MB').html(Math.round(((percent/100.0)*selectedFile.size)/1048576));
}