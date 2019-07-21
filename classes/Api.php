<?php
class Api {
    public function __construct () {
        $config = require './config/db.php';
        try {
            $this->db = new PDO($config['db'], $config['user'], $config['password']);
        } catch (PDOException $e) {
            die($e->getMessage());
        }
    }

    public function getParking() {
        $sth = $this->db->prepare("SELECT * FROM parking");
        $sth->execute();

        while ($current = $sth->fetch(PDO::FETCH_ASSOC)) {
            $result[] = [
                'type' => 'Feature',
                'id' => (int)$current['idParking'],
                'properties' => [
                    'balloonContent' => $current['descriptionParking'],
                ],
                'options' => [
                    'preset' => $current['freePlaceParking'] == 1 ? 'islands#greenIcon' : 'islands#redIcon',
                ], 
                'geometry' => [
                    'type' => 'Point',
                    'coordinates' => array_map('floatval', explode(', ',$current['coordinatesParking'])),
                ],
            ];
        }
        return $result;
    }

    public function getStatisticsOccupation () {
        $sql = 'SELECT *, COUNT(`idParkingStatisticsOccupation`) AS records, SUM(`statusStatisticsOccupation`) AS wasFree FROM `statisticsoccupation` 
        INNER JOIN `parking` ON `idParkingStatisticsOccupation` = `idParking` GROUP BY `idParkingStatisticsOccupation`';
        //формируем массив для парковок
        $parking = [];

        $sth = $this->db->prepare($sql);
        $sth->execute();

        while ($row = $sth->fetch(PDO::FETCH_ASSOC)) {
            /**
             * [idParking] - идентификатор парковки
             * [coordinatesParking] - координаты парковки
             * [records] - всего записей по парковке
             * [wasFree] - сколько раз она была вободна
             * соотношение wasFree/records определяет загруженность менее 30% зеленая, более 70% красная, остальное желтое
            */
            if ($row["wasFree"]/$row["records"] < 0.3) {
                $loadType = "islands#greenIcon";
                $loadHintText = "Загрузка: низкая";
            }
            elseif ($row["wasFree"]/$row["records"] > 0.7) {
                $loadType = "islands#redIcon";
                $loadHintText = "Загрузка: высокая";
            }
            else {
                $loadType = "islands#yellowIcon";
                $loadHintText = "Загрузка: средняя";
            }
            $parking[] = '{"type": "Feature", "id": '.$row['idParking'].', "geometry": {"type": "Point", "coordinates": ['.$row['coordinatesParking'].']}, "options": {"preset": "'.$loadType.'"}, "properties": {"balloonContentHeader": "Статистика парковки", "balloonContentBody": "<a href=\"/api.php?querytype=statisticsOccupationDetailed&idParking='.$row['idParking'].'\" target=\"_blank\">Подробная статистика</a>", "balloonContentFooter": "Краткая информация", "clusterCaption": "Парковка", "hintContent": "'.$loadHintText.'"}}';
        }
        header('Content-Type: application/json');
        echo '{"type": "FeatureCollection","features": ['.join (', ', $parking).']}';
        die ;
    }

    public function statisticsOccupationDetailed () {
        //портим жизнь злобным хацкерам
        $idParking = (int)$_GET["idParking"];
        try {
                //строка запроса
                $sql = 'SELECT * FROM `statisticsoccupation` WHERE `idParkingStatisticsOccupation` = '.$idParking;
                //формируем массив для парковок
                $parking = [];
                echo "<pre>";
                foreach ($this->db->query($sql, PDO::FETCH_ASSOC) as $row) {
                    print_r($row);
                }
                echo "</pre>";
                die;
            }
        catch(PDOException $e) {
            echo "Connection failed: " . $e->getMessage();
        }
    }

    public function setParking() {
        $stmt = $this->db->prepare("INSERT INTO parking (coordinatesParking, typeParking, descriptionParking) VALUES (:coordinatesParking,:typeParking,:descriptionParking)");
        $stmt->bindParam(':coordinatesParking', $coordinatesParking, PDO::PARAM_STR);
        $stmt->bindParam(':typeParking', $typeParking, PDO::PARAM_STR);
        $stmt->bindParam(':descriptionParking', $descriptionParking, PDO::PARAM_STR);
        
        $coordinatesParking = $_POST['coordinatesParking'];
        $typeParking = $_POST['typeParking'];
        $descriptionParking = $_POST['descriptionParking'];

        $stmt->execute();
        if ($this->db->lastInsertId() == 0) {
            return [
                'error' => 'Ошибка вставки в базу данных',
            ]; 
        } else {
            return [
                'lastInsertId' => $this->db->lastInsertId(),
            ]; 
        }
    }

    public function setParkingType() {
        $stmt = $this->db->prepare("UPDATE parking SET freePlaceParking = :freePlaceParking WHERE coordinatesParking = :coordinatesParking");
        $stmt->bindParam(':freePlaceParking', $freePlaceParking, PDO::PARAM_STR);
        $stmt->bindParam(':coordinatesParking', $coordinatesParking, PDO::PARAM_STR);
        
        $freePlaceParking = $_GET['freePlaceParking'];
        $coordinatesParking = $_GET['coordinatesParking'];
        return [
            'success' => 'Обновлено успешно',
        ]; 
    }
}