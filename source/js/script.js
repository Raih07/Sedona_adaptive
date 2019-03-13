document.body.onkeydown = function(event) {
  if (event.keyCode === 9) {  // TAB
    document.body.classList.add('tab-user');
    document.addEventListener('click', clickDocumentDetect);
  }
};

function clickDocumentDetect() {
  document.body.classList.remove('tab-user');
  document.removeEventListener('click', clickDocumentDetect);
}

var navToggle = document.querySelector('.main-nav__toggle');
var mainHeader = document.querySelector('.main-header');
var mainNav = document.querySelector('.main-nav');

mainNav.classList.remove('main-nav--nojs');
mainHeader.classList.remove('main-header--nojs');

navToggle.addEventListener('click', function() {
  mainHeader.classList.toggle('main-header--open');

  if (mainNav.classList.contains('main-nav--open')) {
    mainNav.classList.remove('main-nav--open');
    mainNav.classList.add('main-nav--close');
  } else {
    mainNav.classList.remove('main-nav--close');
    mainNav.classList.add('main-nav--open');
  }
});

/*******Карта в подвале*********/

var desktop_width = 1300;

if(document.getElementById('YMapsID')) {
  ymaps.ready(init);
  var myMap, myPlacemar;

  function init() {

    var width_scr = document.documentElement.clientWidth || document.body.clientWidth;

    if (width_scr >= desktop_width) {
        myMap = new ymaps.Map("YMapsID", {
        center: [59.939117, 30.319356],
        zoom: 17,
        controls: [] //убираем все кнопки управления
        });
      } else {
        myMap = new ymaps.Map("YMapsID", {
        center: [59.938812, 30.323093],
        zoom: 17,
        controls: [] //убираем все кнопки управления
        });
      }

    myMap.behaviors.disable('scrollZoom'); //отключение зума скролом колесика
    //myMap.behaviors.disable('drag');

    myMap.controls.add('zoomControl', {
      float: 'none'
    });
    myMap.controls.add('fullscreenControl', {
      float: 'right'
    });

    myMap.controls.add('typeSelector'); // Переключатель слоев карты – второй слева.
    myMap.controls.get('typeSelector').options.set('size', 'small');//принудительно выбран маленькой мконки

    myPlacemark = new ymaps.Placemark([59.938812, 30.323093], {
      hintContent: 'Cat Energy',
      balloonContent: 'Санкт-Петербург, ул. Большая Конюшенная, д. 19/8'
    }, {
      iconLayout: 'default#image', //изображение без доп текста
      iconImageHref: 'img/map-pin.png',
      iconImageSize: [124, 106],
      iconImageOffset: [-62, -93] //смещение картинки
    });

    myMap.geoObjects.add(myPlacemark);
  }
}

/*******Слайдер сравнения кошек*******/

var SLIDE_EVENT = 'slide';
var WIDTH_BEFORE = 0;
var WIDTH_AFTER = 100;

var sliderElement = document.querySelector('.compare__bar');
var pictureBeforeElement = document.querySelector('.compare__picture--before');
var buttonBefore = document.querySelector('.compare__btn--before');
var buttonAfter = document.querySelector('.compare__btn--after');

if (sliderElement) {
  var sliderCompare = new Slider({
    elem: sliderElement,
    max: 100
  });

  document.addEventListener(SLIDE_EVENT, function(evt) {
    pictureBeforeElement.style.width = 100 - evt.detail.pos + '%';
    //console.log(evt.detail.pos);
  });

  buttonBefore.addEventListener('click', function () {
    sliderCompare.setValue(WIDTH_BEFORE);
  });

  buttonAfter.addEventListener('click', function () {
    sliderCompare.setValue(WIDTH_AFTER);
  });

  //полифилл для включения CustomEvent в IE9+
  try {
    new CustomEvent("IE has CustomEvent, but doesn't support constructor");
  } catch (e) {
    window.CustomEvent = function (event, params) {
      var evt;
      params = params || {
        bubbles: false,
        cancelable: false,
        detail: undefined
      };
      evt = document.createEvent("CustomEvent");
      evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
      return evt;
    };
    CustomEvent.prototype = Object.create(window.Event.prototype);
  }

  function Slider(options) {
    var elem = options.elem;
    var thumbElem = elem.querySelector('.compare__toggle');

    var max = options.max || 100;
    var sliderCoords, thumbCoords, shiftX, pixelsPerValue;

    pixelsPerValue = (elem.offsetWidth - thumbElem.offsetWidth) / max;

    elem.ondragstart = function() {
      return false;
    };

    elem.ontouchstart = elem.onmousedown = function(event) {
      //console.log(event.target.className);
      if (event.target.classList.contains('compare__toggle')) {
        var clientX = event.clientX || event.touches[0].clientX;
        var clientY = event.clientY || event.touches[0].clientY;

        //console.log('pixelsPerValue ' + pixelsPerValue);
        startDrag(clientX, clientY);
        return false;
      }
    }

    function startDrag(startClientX, startClientY) {
      thumbCoords = thumbElem.getBoundingClientRect();
      sliderCoords = elem.getBoundingClientRect();

      shiftX = startClientX - thumbCoords.left;

      document.addEventListener('mousemove', onDocumentMouseMove);
      document.addEventListener('mouseup', onDocumentMouseUp);

      document.addEventListener('touchmove', onDocumentMouseMove);
      document.addEventListener('touchend', onDocumentMouseUp);
    }

    function moveTo(clientX) {
      var newLeft = clientX - shiftX - sliderCoords.left;

      if (newLeft < 0) {
        newLeft = 0;
      }

      var rightEdge = elem.offsetWidth - thumbElem.offsetWidth;
      if (newLeft > rightEdge) {
        newLeft = rightEdge;
      }

      thumbElem.style.left = newLeft + 'px';  //версия в пикселях
      //thumbElem.style.left = (newLeft / elem.offsetWidth) * 100 + '%';  //версия в процентах
      setEvent(SLIDE_EVENT, newLeft);
    }

    function setEvent(events, data) {
      elem.dispatchEvent(new CustomEvent(events, {
        bubbles: true,
        detail: { pos: positionToValue(data), filt_type: events }
      }));
    }

    function positionToValue(left) {
      return Math.round(left / pixelsPerValue);
    }

    function valueToPosition(value) {
      return pixelsPerValue * value;
    }

    function onDocumentMouseMove(e) {
      var clientX = e.clientX || e.touches[0].clientX;
      moveTo(clientX);
    }

    function onDocumentMouseUp() {
      endDrag();
    }

    function endDrag() {
      document.removeEventListener('mousemove', onDocumentMouseMove);
      document.removeEventListener('mouseup', onDocumentMouseUp);

      document.removeEventListener('touchmove', onDocumentMouseMove);
      document.removeEventListener('touchend', onDocumentMouseUp);
    }

    function setValue(value) {
      var pos = valueToPosition(value);
      console.log(value + ', ' + pos);
      thumbElem.style.left = pos + 'px';  //версия в пикселях
      //thumbElem.style.left = (pos / elem.offsetWidth) * 100 + '%';  //версия в процентах
      setEvent(SLIDE_EVENT, pos);
    }

    this.setValue = setValue;
  }
}

/*******Открытии и закрытие попапов*******/

var pop_sucs = document.getElementById('popup_success');
var pop_err = document.getElementById('popup_error');
var form_contest= document.getElementsByClassName("questionnaire__form")[0];
var first_name = document.getElementById('first_name');
var second_name = document.getElementById('surname');
var email = document.getElementById('mail');
var storage_name = localStorage.getItem('first_name');
var storage_second_name = localStorage.getItem('second_name');
var storage_email = localStorage.getItem('email');

if (form_contest) {
  if (storage_name) {
    first_name.value = storage_name;
    //console.log('first_name ' + storage_name);
  }

  if (storage_second_name) {
    second_name.value = storage_second_name;
    //console.log('second_name ' + storage_second_name);
  }

  if (storage_email) {
    email.value = storage_email;
    //console.log('email ' + storage_email);
  }

  function showPopup(popup, form_contest) {
    popup.classList.remove('popup--close');
    popup.classList.add('popup--open');

    var btn_close= popup.getElementsByClassName("popup__btn")[0];

    btn_close.onclick = function() {
      if (popup.classList.contains('popup--success')) {
        form_contest.submit();
      }
      closePopup(popup);
    }

    document.onkeydown = function (event) {
      if (event.keyCode === 27) { // escape
        closePopup(popup);
      }
    };
  }

  function closePopup(popup) {
    popup.classList.remove('popup--open');
    popup.classList.add('popup--close');
  }

  form_contest.addEventListener('submit', function (event) {
    if (first_name.value == '' || second_name.value == '' ||email.value == '') {
      showPopup(pop_err);
      //console.log('error');
      event.preventDefault();
    }
    else {
      showPopup(pop_sucs, form_contest);
      //console.log('suc');
      localStorage.setItem('first_name', first_name.value);
      localStorage.setItem('second_name', second_name.value);
      localStorage.setItem('email', email.value);
      event.preventDefault();
    }
  });
}
