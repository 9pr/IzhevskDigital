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
            $result[$current['idParking']] = [
                'all' => $current,
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
            }
            elseif ($row["wasFree"]/$row["records"] > 0.7) {
                $loadType = "islands#redIcon";
            }
            else {
                $loadType = "islands#yellowIcon";
            }
            $parking[] = '{"type": "Feature", "id": '.$row['idParking'].', "geometry": {"type": "Point", "coordinates": ['.$row['coordinatesParking'].']}, "options": {"preset": "'.$loadType.'"}, "properties": {"balloonContentHeader": "Заголовок балуна", "balloonContentBody": "<a href=\"statisticsOccupationDetailed.php?idParking='.$row['idParking'].'\" target=\"_blank\">Подробная статистика</a>", "balloonContentFooter": "Контент балуна подвал", "clusterCaption": "Метка", "hintContent": "Текст подсказки"}}';






            // print_r($current);
        }

        // foreach ($this->db->query($sql, PDO::FETCH_ASSOC) as $row) {

        // }
        echo '{"type": "FeatureCollection","features": ['.join (', ', $parking).']}';
        return '';
        return $result;
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
}