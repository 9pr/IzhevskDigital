ymaps.ready(initMap);

function initMap() {
	var myMap = new ymaps.Map("map", {
		center: [55.73, 37.75],
		zoom: 15,
		controls: ['routeButtonControl']
	}, {
		searchControlProvider: 'yandex#search'
	}),
	parkings, endPoint;



	/* Строим маршрут */
	var control = myMap.controls.get('routeButtonControl');

	// Указываем тип маршрута Автомобильный
	control.routePanel.state.set({
		type: 'auto'
	});
	control.routePanel.options.set({
		types: { auto: true }
	});

	// Зададим координаты пункта отправления с помощью геолокации.
	control.routePanel.geolocate('from');

	// Откроем панель для построения маршрутов.
  control.state.set('expanded', true);




	function findClosestObjects () {
		// Найдем в выборке кафе, ближайшее к найденной станции метро,
		// и откроем его балун.
		//parkings.getClosestTo(endPoint.get(0)).balloon.open();

		// Будем открывать балун кафе, который ближе всего к месту клика
		myMap.events.add('click', function (event) {
			parkings.getClosestTo(event.get('coords')).balloon.open();
		});
	}

	// Описания кафе можно хранить в формате JSON, а потом генерировать
	// из описания геообъекты с помощью ymaps.geoQuery.
	jQuery.getJSON('js/parkings.json', function (json) {
    parkings = ymaps.geoQuery({
    	type: 'FeatureCollection',
    	features: json
    }).addToMap(myMap);;
  });


	// С помощью обратного геокодирования найдем метро "Кропоткинская".
	endPoint = ymaps.geoQuery(ymaps.geocode([55.744828, 37.603423], {kind: 'endPoint'}))
	// Нужно дождаться ответа от сервера и только потом обрабатывать полученные результаты.
	.then(findClosestObjects);


}
