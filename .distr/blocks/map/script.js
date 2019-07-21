ymaps.ready(init);


function test(){
    var map;
    ymaps.geolocation.get().then(function (res) {
        var mapContainer = $('#map__widget'),
            bounds = res.geoObjects.get(0).properties.get('boundedBy'),
            // Рассчитываем видимую область для текущей положения пользователя.
            mapState = ymaps.util.bounds.getCenterAndZoom(
                bounds,
                [mapContainer.width(), mapContainer.height()]
            );
            console.log(bounds);
        createMap(mapState);
    }, function (e) {
        // Если местоположение невозможно получить, то просто создаем карту.
        createMap({
            center: [55.751574, 37.573856],
            zoom: 18
        });
    });

    function createMap (state) {
        map = new ymaps.Map('map__widget', state);
    }
}


function init() {
    var userPosition,
        myMap = new ymaps.Map('map__widget', {
        center: [56.852593, 53.204843], // Ижевск
        zoom: 18,
        controls: ['zoomControl']
    }, {
            searchControlProvider: 'yandex#search'
        });


    // Геолокация и позиционирование карты
    ymaps.geolocation.get().then(function (result) {
        var mapContainer = $('#map__widget'),
            bounds = result.geoObjects.get(0).properties.get('boundedBy');
        userPosition = result.geoObjects.position;
        myMap.setCenter(userPosition);
        result.geoObjects.options.set({
            preset: 'islands#redCircleIcon'
        });
        myMap.geoObjects.add(result.geoObjects);
    });

    // Добавляю блок поиска на сайт
    var mySearchControl = new ymaps.control.SearchControl({
        options: {
            noPlacemark: true
        }
    });
    myMap.controls.add(mySearchControl);


    // Запрашиваю парковки
    jQuery.getJSON('js/parkings.json', function (json) {
        var parkings,
            parking;

        // parkings = new ymaps.ObjectManager({
        //     // Чтобы метки начали кластеризоваться, выставляем опцию.
        //     clusterize: true,
        //     // ObjectManager принимает те же опции, что и кластеризатор.
        //     gridSize: 32,
        //     clusterDisableClickZoom: false
        // });
        // parkings.add(json);
        // myMap.geoObjects.add(parkings);


        // Вывожу парковки на карте
        parkings = ymaps.geoQuery({
            type: 'FeatureCollection',
            features: json
        }).addToMap(myMap);

        // Получаю координаты поиска
        mySearchControl.events.add('resultselect', function (e) {
            var index = e.get('index');
            mySearchControl.getResult(index).then(function (res) {
                var routetEnd = res.geometry.getCoordinates();

                // С помощью обратного геокодирования найдем ближайшую парковку
                parking = ymaps.geoQuery(ymaps.geocode(routetEnd, {kind: 'street'}))
                // Нужно дождаться ответа от сервера и только потом обрабатывать полученные результаты.
                .then( function(){

                    parkings.getClosestTo(routetEnd).balloon.open();
                    console.log(parkings.getClosestTo(routetEnd));

                    var parkingPoint = parkings.getClosestTo(routetEnd).geometry.getCoordinates();

                    // Строю маршрут
                    var multiRoute = new ymaps.multiRouter.MultiRoute({
                        referencePoints: [
                            userPosition,
                            parkingPoint,
                            routetEnd
                        ],
                        params: {
                            routingMode: 'auto'
                        }
                    });

                    // Добавляем мультимаршрут на карту.
                    myMap.geoObjects.add(multiRoute);

                });

            });
        });


        // Клик по кнопкам
        $('.user-panel__btn').on('click', function(){
            var newUserPosition,
                parkingStatus = $(this).data('point-status'),
                parkingStatusInt;
            // По клику на кнопки определяю новое местоположение пользователя
            ymaps.geolocation.get().then(function (result) {
                var mapContainer = $('#map__widget');
                newUserPosition = result.geoObjects.position;

                // Ищу ближайшую парковку
                nearParking = ymaps.geoQuery(ymaps.geocode(newUserPosition, {kind: 'street'})).then( function(){

                    var parkingPoint = parkings.getClosestTo(newUserPosition).geometry.getCoordinates();


                    // В зависимости от занятости парковки меняю ее цвет
                    if(parkingStatus == 'on') {
                        parkings.getClosestTo(newUserPosition).options.set('preset', 'islands#yellowIcon');
                        parkingStatusInt = 1;
                    }
                    if(parkingStatus == 'off') {
                        parkings.getClosestTo(newUserPosition).options.set('preset', 'islands#redIcon');
                        parkingStatusInt = 1;
                    }

                    $.ajax({
                      url: "https://nlevel.yodata.ru/api.php?querytype=setParkingType&freePlaceParking="+parkingStatusInt+"&coordinatesParking="+parkingPoint
                    }).done(function( data ) {
                      alert(data);
                  });
                });
            });

        });

    });
}