ymaps.ready(init);

function init() {
    var geolocation = ymaps.geolocation,
        myMap = new ymaps.Map('map__widget', {
        center: [56.852593, 53.204843], // Ижевск
        zoom: 18,
        controls: ['zoomControl', 'geolocationControl']
    }, {
            searchControlProvider: 'yandex#search'
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

                    var parkingPoint = parkings.getClosestTo(routetEnd).geometry.getCoordinates()

                    //console.log(parkingPoint);
                    // Строю маршрут
                    var userPosition = [56.852593, 53.204843]; // TODO починить геолокацию
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

                    ymaps.modules.require([
                        'MultiRouteColorizer'
                    ], function (MultiRouteColorizer) {
                        // Создаем объект, раскрашивающий линии сегментов маршрута.
                        new MultiRouteColorizer(multiRoute);
                    });


                    // Добавляем мультимаршрут на карту.
                    myMap.geoObjects.add(multiRoute);


                    // Геолокация
                    geolocation.get({
                        provider: 'browser',
                        mapStateAutoApply: true
                    }).then(function (result) {
                        console.log(result);
                        var userPosition = result.geoObjects.position;
                        //console.log(userPosition, parking, routetEnd);


                        // Сюда вставляем маршрут - строки 48-68

                    });

                } );




            });


        });


    });
}