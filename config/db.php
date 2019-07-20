<?php
if (file_exists('./local')) {
    $user = 'root';
    $password = '';
} else {
    $user = 'zimobox_nl';
    $password = 'HRq1xD**';
}
return [
    'db' => 'mysql:host=localhost;dbname=zimobox_nl;charset=UTF8',
    'user' => $user, 
    'password' => $password,
];