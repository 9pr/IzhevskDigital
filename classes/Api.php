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
}