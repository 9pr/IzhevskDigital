ymaps.ready(function () {
    var map;
    ymaps.geolocation.get().then(function (res) {
        var mapContainer = $('#map'),
            bounds = res.geoObjects.get(0).properties.get('boundedBy'),
            // Рассчитываем видимую область для текущей положения пользователя.
            mapState = ymaps.util.bounds.getCenterAndZoom(
                bounds,
                [mapContainer.width(), mapContainer.height()]
            );
        //меняем зум, возможно вынести под индивидуальные настройки пользователя
        mapState.zoom = 13;
        createMap(mapState);
    }, function (e) {
        // Если местоположение невозможно получить, то просто создаем карту.
        createMap({
            center: [55.751574, 37.573856],
            zoom: 2
        });
    });
    //создаем карту
    function createMap (state) {
        map = new ymaps.Map('map', state);
        //ставим стоянки на карту
        points(map);
    }
    //выводим точки
    function points() {
        objectManager = new ymaps.ObjectManager({
            // Чтобы метки начали кластеризоваться, выставляем опцию.
            clusterize: true,
            // ObjectManager принимает те же опции, что и кластеризатор.
            //задаем размер кластера, возможно вынести под индивидуальные настройки пользователя
            gridSize: 32,
            clusterDisableClickZoom: true
        });
        // Чтобы задать опции одиночным объектам и кластерам,
        // обратимся к дочерним коллекциям ObjectManager.
        objectManager.objects.options.set('preset', 'islands#greenDotIcon');
        objectManager.clusters.options.set('preset', 'islands#greenClusterIcons');
        map.geoObjects.add(objectManager);
        
        $.ajax({
            url: "/api.php?querytype=getStatisticsOccupation"
        }).done(function(data) {
            objectManager.add(data);
        });
    }

    // Функция, которая по состоянию чекбоксов в меню
    // показывает или скрывает геообъекты из выборки.
    /*
    function checkState () {
        var shownObjects,
            byColor = new ymaps.GeoQueryResult(),
            byShape = new ymaps.GeoQueryResult();
        
        // Отберем объекты по цвету. 
        if ($('#red').prop('checked')) {
            // Будем искать по двум параметрам:
            // - для точечных объектов по полю preset;
            // - для контурных объектов по цвету заливки.
            byColor = myObjects.search('options.fillColor = "#ff1000"')
                .add(myObjects.search('options.preset = "islands#redIcon"'));
                console.log (byColor);
        }
        if ($('#green').prop('checked')) {
            byColor = myObjects.search('options.fillColor = "#00ff00"')
                .add(myObjects.search('options.preset = "islands#greenIcon"'))
                // После того, как мы нашли все зеленые объекты, добавим к ним
                // объекты, найденные на предыдущей итерации.
                .add(byColor);
        }
        if ($('#yellow').prop('checked')) {
            byColor = myObjects.search('options.fillColor = "#ffcc00"')
                .add(myObjects.search('options.preset = "islands#yellowIcon"'))
                .add(byColor);
        }
        
        // Мы отобрали объекты по цвету и по форме. Покажем на карте объекты,
        // которые совмещают нужные признаки.
        shownObjects = byColor.intersect(byShape).addToMap(map);
        // Объекты, которые не попали в выборку, нужно убрать с карты.
        myObjects.remove(shownObjects).removeFromMap(map);
    }
    
    $('#red').click(checkState);
    $('#green').click(checkState);
    $('#yellow').click(checkState);
    $('#point').click(checkState);
    $('#polygon').click(checkState);
    $('#circle').click(checkState);
    */

});