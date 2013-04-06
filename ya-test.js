//v1
function v1(arr) {
  var freq = {}, uniq=[], hash={};
  //Обходим массив и создаем объект, в котором имена свойств - это элементы массива, а значения - количество "попаданий" каждого элемента
  //На выходе получим объект freq = {button:3, link:5, input:2...}
  arr.forEach(function(v,i){
      freq[v] = freq.hasOwnProperty(v)?freq[v]+1:1;
  });

  //Обходим объект freq и создаем массив объектов uniq
  //На выходе получим массив [{n:"link", v:5}, {n:"button", v:3}...]
  for (var c in freq) {
      if (freq.hasOwnProperty(c)) {
          uniq.push({'n':c,'v':freq[c]})
      }
  }
    
  uniq
    //Сортируем массив объектов
    .sort(function(a,b){return b.v-a.v;})
    //Преобразовываем его в массив значений
    .map(function(e){return e.n;})
    //Обходим новый массив
    .forEach(function(v,i){
      //Свойством объекта hash будет элемент массива, а его значение формируется по следующему алгоритму:
      //- числовой индекс преобразовывается в 26-ричную систему
      //- каждый символ полученного значения преобразовывается в соответствии с паттерном pattern
        hash[v] = Array.prototype.map.call((i+1).toString(26), function(e){return pattern[e];}).join('');
    });

    return hash;
}

//v2
//Тут и далее будут прокомментированы только изменения по отношению к предыдущему примеру
function v2(arr){
  var freq, uniq, hash={};
  //Попытка применить методы из ECMAScript 5
  //"Сворачваем" массив в объект с помощью метода reduce
  //На выходе получим объект freq = {button:3, link:5, input:2...}
  freq = arr.reduce(function(d,i) {
      d[i] = -~d[i];
      return d;
  }, {});

  //Избавляемся от лишнего цикла. Нужное преобразование объекта в массив получаем с помощью Object.keys() и сортируем его
  uniq = Object.keys(freq).sort(function(a,b) {
      return freq[b]-freq[a];
  });

  //Обходим массив и получаем объект hash по новому алгоритму:
  //Теперь нам не нужен объект pattern. Нужные нам преобразования можно получить с помощью смещения ASCII кода символа.
  //Если это цифра(код 48-57), то смещение будет +48 пунктов, если это символ, то смещение будет +9 пунктов
  //Преобразовываем символ в код, задаем смещение и преобразовываем обратно в символ.
  uniq.forEach(function(v,i){
      hash[v] = Array.prototype.map.call((i+1).toString(26), function(e){
        chCode = e.charCodeAt(0);
        return String.fromCharCode(chCode+(chCode<58?48:9));
      }).join('');
  });

  return hash;
}

//v3
//Тестируем на быстродействие и объединяем v1 и v2
function v3(arr) {
  var freq = {}, hash={};
  //Выявлено, что forEach работает быстрее, чем reduce. Возвращаем его.
  arr.forEach(function(v,i){
      freq[v] = freq.hasOwnProperty(v)?freq[v]+1:1;
  });
    
  //А поиск по паттерну быстрее алгоритма с преобразованиями ASCII кода
  Object.keys(freq).sort(function(a,b){return freq[b]-freq[a];}).forEach(function(v,i){
      hash[v] = Array.prototype.map.call((i+1).toString(26), function(e){return pattern[e];}).join('');
  });
   
  return hash;
}

//v4
/*
Оптимизация:
-freq.hasOwnProperty(v) заменено на Object.prototype.hasOwnProperty.call(freq,v) для случая, когда будет существовать класс hasOwnProperty;
-методы forEach заменены на более быстрые циклы while
-Object.prototype.hasOwnProperty закешировано
-Array.prototype.map закешировано
*/
function v4(arr) {
  var freq = {}, hash = {}, s_arr = [], i = arr.length, e;

  while (i--) {e = arr[i];freq[e] = hasOwn.call(freq,e)?freq[e]+1:1;}

  s_arr = Object.keys(freq).sort(function(a,b){return freq[b]-freq[a];});

  i = s_arr.length;
  while (i--) hash[s_arr[i]] = map.call((i+1).toString(26), function(el){return pattern[el];}).join('');

  return hash;
}

var classes = ['link', 'block', 'hide', 'link', 'menu', 'block', 'content', 'link', 'footer', 'img', 'img', 'link', 'modal', 'button', 'form', 'input', 'button', 'input', 'link', 'toString', 'valueOf', 'button']
  , pattern = {1:'a', 2:'b', 3:'c', 4:'d', 5:'e', 6:'f', 7:'g', 8:'h', 9:'i', a:'j', b:'k', c:'l', d:'m', e:'n', f:'o', g:'p', h:'q', i:'r', j:'s', k:'t', l:'u', m:'v', n:'w', o:'x', p:'y', q:'z'}
  , hasOwn = Object.prototype.hasOwnProperty
  , map = Array.prototype.map;

//пример работы v4 http://jsfiddle.net/AYvhE/

//тесты http://jsperf.com/ya-test
//В браузерах Chrome и Firefox v4 работает на 30-40% быстрее v1 и v2
//Немного неожиданные результаты показал IE10, где все версии работают одинаково

