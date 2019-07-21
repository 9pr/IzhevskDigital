<?php
spl_autoload_register(function($name) {
    require 'classes/'.$name.'.php';
});
 
if (isset($_GET['querytype'])) {
    $api = new Api();
    switch($_GET['querytype']) {
        case 'getParking':
        $result = $api->getParking();
        break;

        case 'setParking':
        $result = $api->setParking();
        break;

        case 'getStatisticsOccupation':
        $result = $api->getStatisticsOccupation();
        break;

        default:
        $result = [
            'error' => 'Неверный запрос'
        ];
    }
} else {
    $result = [
        'error' => 'Неверный запрос'
    ];
}

header('Content-Type: application/json');
echo json_encode($result);