<?php
require_once __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

$stmt = $pdo->query('SELECT * FROM reviews ORDER BY id DESC');
$reviews = $stmt->fetchAll();
echo json_encode($reviews, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
