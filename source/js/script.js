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

if (document.getElementById('YMapsID')) {
  ymaps.ready(init);
  var myMap,
      myPlacemar;

  function init() {
    myMap = new ymaps.Map("YMapsID", {
      center: [34.870874, -111.762654],
      zoom: 10,
      controls: [] //убираем все кнопки управления

    });
    myMap.behaviors.disable('scrollZoom'); //отключение зума скролом колесика
    //myMap.behaviors.disable('drag');

    myMap.controls.add('zoomControl');

    //myMap.controls.add('geolocationControl'); //геолокация
    myMap.controls.add('fullscreenControl'); //полноэкранный режим
    myMap.controls.add('typeSelector'); //тип карты(спутник, карта, гибрид)
    myMap.controls.get('typeSelector').options.set('size', 'small');//принудительно выбран маленькой мконки

    myPlacemark = new ymaps.Placemark([34.870874, -111.762654], {
      hintContent: 'Sedona',
      balloonContent: ''
    }, {
      iconLayout: 'default#image', //изображение без доп текста
      iconImageHref: 'img/icon-map-marker.svg',
      iconImageSize: [27, 27],
      iconImageOffset: [-6, -6] //смещение картинки
    });

    myMap.geoObjects.add(myPlacemark);
  }
}

/*******Ползунок видеоплеера*******/

var SLIDE_EVENT = 'slide';

var progressBarElement = document.querySelector('.video-player__progress-bar');

if (progressBarElement) {
  var progressBar = new Slider({
    elem: progressBarElement,
    max: 100
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
    var thumbElem = elem.querySelector('.video-player__thumb');

    var max = options.max || 100;
    var sliderCoords, thumbCoords, shiftX, pixelsPerValue;

    pixelsPerValue = (elem.offsetWidth - thumbElem.offsetWidth) / max;

    elem.ondragstart = function() {
      return false;
    };

    elem.ontouchstart = elem.onmousedown = function(event) {
      //console.log(event.target.className);
      if (event.target.classList.contains('video-player__thumb')) {
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

      //thumbElem.style.left = newLeft + 'px';  //версия в пикселях
      thumbElem.style.left = (newLeft / elem.offsetWidth) * 100 + '%';  //версия в процентах
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
      //thumbElem.style.left = pos + 'px';  //версия в пикселях
      thumbElem.style.left = (pos / elem.offsetWidth) * 100 + '%';  //версия в процентах
      setEvent(SLIDE_EVENT, pos);
    }

    this.setValue = setValue;
  }
}

/*******Открытии и закрытие попапов*******/

var popupSuccess = document.querySelector('.popup--success');
var popupError = document.querySelector('.popup--error');
var reviewsForm= document.querySelector(".reviews__form");
var userName = document.getElementById('user_name');
var userFam = document.getElementById('user_fam');
var phone = document.getElementById('tel');
var email = document.getElementById('mail');
var storageName = localStorage.getItem('user_name');
var storageFam = localStorage.getItem('user_fam');
var storagePhone = localStorage.getItem('phone');
var storageEmail = localStorage.getItem('email');

if (reviewsForm) {
  if (storageName) {
    userName.value = storageName;
  }

  if (storageFam) {
    userFam.value = storageFam;
  }

  if (storagePhone) {
    phone.value = storagePhone;
  }

  if (storageEmail) {
    email.value = storageEmail;
  }

  function showPopup(popup, form) {
    popup.classList.remove('popup--close');
    popup.classList.add('popup--open');

    var btnСlose= popup.querySelector(".popup__btn");

    btnСlose.addEventListener('click', function() {
      if (popup.classList.contains('popup--success')) {
        form.submit();
      }

      closePopup(popup);
    });

    document.addEventListener('keydown', function(evt) {
      if (evt.keyCode === 27) { // escape
        closePopup(popup);
      }
    });
  }

  function closePopup(popup) {
    popup.classList.remove('popup--open');
    popup.classList.add('popup--close');
  }

  var onFormInvaliv = function (evt) {
    showPopup(popupError);
    var errorInput = evt.target;
    errorInput.classList.add('reviews__field--error');

    errorInput.addEventListener('focus', function () {
      errorInput.classList.remove('reviews__field--error');
    });
  };

  reviewsForm.addEventListener('invalid', onFormInvaliv, true);

  reviewsForm.addEventListener('submit', function (evt) {
    /*
    if (userName.value == '' || userFam.value == '' || phone.value == '' || email.value == '') {
      showPopup(popupError);
      event.preventDefault();
    }
    else {*/
      showPopup(popupSuccess, reviewsForm);
      localStorage.setItem('user_name', userName.value);
      localStorage.setItem('user_fam', userFam.value);
      localStorage.setItem('phone', phone.value);
      localStorage.setItem('email', email.value);
      evt.preventDefault();
    //}
  });
}
