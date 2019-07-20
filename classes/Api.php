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