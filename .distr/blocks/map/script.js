ymaps.ready(initMap);



function initMap() {
	var myMap = new ymaps.Map('map', {
		center: [56.852593, 53.204843], // Ижевск
    zoom: 12,
    controls: []
  }, {
    searchControlProvider: 'yandex#search'
  });


	// Создадим панель маршрутизации.
  routePanelControl = new ymaps.control.RoutePanel({
    options: {
      // Добавим заголовок панели.
      showHeader: true,
      title: 'Постройте маршрут'
    }
  });


  // Пользователь сможет построить только автомобильный маршрут.
  routePanelControl.routePanel.options.set({
    types: {auto: true}
  });

  myMap.controls.add(routePanelControl);




	// Получим ссылку на маршрут.
  routePanelControl.routePanel.getRouteAsync().then(function (route) {
  	// Повесим обработчик на событие построения маршрута.
    route.model.events.add('requestsuccess', function () {
    	var activeRoute = route.getActiveRoute();
    	// Нужно дождаться ответа от сервера и только потом обрабатывать полученные результаты.
    	if (activeRoute) {
    		// Запрашиваем парковки
    		jQuery.getJSON('js/parkings.json', function (json) {
			  	var parkings,
							endPoint,
							points = route.getWayPoints(),
	        		lastPoint = points.get(1).properties.get("coordinates"); // TODO координаты определяются НЕ правильно
	        		//console.log(points.get(1).properties.geometry.getCoordinates());

			    parkings = ymaps.geoQuery({
			    	type: 'FeatureCollection',
			    	features: json
			    }).addToMap(myMap);

			    //points.get(0).options.set('preset', 'islands#redStretchyIcon');


			    // С помощью обратного геокодирования найдем ближайшую парковку.
					endPoint = ymaps.geoQuery(ymaps.geocode([lastPoint], {kind: 'street'}))
					// Будем открывать балун парковки, который ближе всего к парковке
					.then(parkings.getClosestTo(lastPoint).balloon.open());

					route.editor.start(
						{addWayPoints: true, removeWayPoints: true}
					);

					route.editor.stop();
					//console.log(parkings.getClosestTo(lastPoint).geometry.getCoordinates());
			  });

      }
    });
  });




}