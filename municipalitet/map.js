ymaps.ready(init);
    
    function init () {
    var map;
    ymaps.geolocation.get().then(function (res) {
        var mapContainer = $('#mapStatistics'),
            bounds = res.geoObjects.get(0).properties.get('boundedBy'),
            // Рассчитываем видимую область для текущей положения пользователя.
            mapState = ymaps.util.bounds.getCenterAndZoom(
                bounds,
                [mapContainer.width(), mapContainer.height()]
            );
        //меняем зум, возможно вынести под индивидуальные настройки пользователя
        mapState.zoom = 12;
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
        map = new ymaps.Map('mapStatistics', state);
        //ставим стоянки на карту
        points(map);
    }
    //выводим точки
    function points() {
        objectManager = new ymaps.ObjectManager({
            // Макет метки кластера pieChart.
            clusterIconLayout: 'default#pieChart',
            // Радиус диаграммы в пикселях.
            clusterIconPieChartRadius: 25,
            // Радиус центральной части макета.
            clusterIconPieChartCoreRadius: 10,
            // Ширина линий-разделителей секторов и внешней обводки диаграммы.
            clusterIconPieChartStrokeWidth: 3,

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
        objectManager.clusters.options.set('preset', 'default#pieChart');
        map.geoObjects.add(objectManager);
        
        $.ajax({
            url: "/api.php?querytype=getStatisticsOccupation"
        }).done(function(data) {
            objectManager.add(data);
        });
    }
}