<?php
header('Content-Type: text/html; charset=utf-8');

$servername = "localhost";
$username = "root";
$myDB = "nextlevel";
$password = "";

if (isset($_GET["idParking"])) {
    //портим жизнь злобным хацкерам
    $idParking = (int)$_GET["idParking"];
    try {
            $conn = new PDO("mysql:host=$servername;dbname=$myDB;charset=UTF8", $username, $password);
            // set the PDO error mode to exception
            $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            //строка запроса
            $sql = 'SELECT * FROM `statisticsoccupation` WHERE `idParkingStatisticsOccupation` = '.$idParking;
            //формируем массив для парковок
            $parking = [];
            echo "<pre>";
            foreach ($conn->query($sql, PDO::FETCH_ASSOC) as $row) {
                print_r($row);
            }
            echo "</pre>";
        }
    catch(PDOException $e) {
        echo "Connection failed: " . $e->getMessage();
    }
}
?>