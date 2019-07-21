<?php
header('Content-Type: text/html; charset=utf-8');

$servername = "localhost";
$username = "root";
$myDB = "nextlevel";
$password = "";

try {
    $conn = new PDO("mysql:host=$servername;dbname=$myDB;charset=UTF8", $username, $password);
    // set the PDO error mode to exception
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    //строка запроса
    $sql = 'SELECT *, COUNT(`idParkingStatisticsOccupation`) AS records, SUM(`statusStatisticsOccupation`) AS wasFree FROM `statisticsoccupation` 
    INNER JOIN `parking` ON `idParkingStatisticsOccupation` = `idParking` GROUP BY `idParkingStatisticsOccupation`';
    //формируем массив для парковок
    $parking = [];
    foreach ($conn->query($sql, PDO::FETCH_ASSOC) as $row) {
        /**
         * [idParking] - идентификатор парковки
         * [coordinatesParking] - координаты парковки
         * [records] - всего записей по парковке
         * [wasFree] - сколько раз она была вободна
         * соотношение wasFree/records определяет загруженность менее 30% зеленая, более 70% красная, остальное желтое
        */
        if ($row["wasFree"]/$row["records"] < 0.3) {
            $loadType = "islands#greenIcon";
        }
        elseif ($row["wasFree"]/$row["records"] > 0.7) {
            $loadType = "islands#redIcon";
        }
        else {
            $loadType = "islands#yellowIcon";
        }
        $parking[] = '{"type": "Feature", "id": '.$row['idParking'].', "geometry": {"type": "Point", "coordinates": ['.$row['coordinatesParking'].']}, "options": {"preset": "'.$loadType.'"}, "properties": {"balloonContentHeader": "Заголовок балуна", "balloonContentBody": "<a href=\"statisticsOccupationDetailed.php?idParking='.$row['idParking'].'\" target=\"_blank\">Подробная статистика</a>", "balloonContentFooter": "Контент балуна подвал", "clusterCaption": "Метка", "hintContent": "Текст подсказки"}}';
    }
    //выводим json с данными по загруженности парковок
    echo '{"type": "FeatureCollection","features": ['.join (', ', $parking).']}';

}
catch(PDOException $e) {
    echo "Connection failed: " . $e->getMessage();
}
?>