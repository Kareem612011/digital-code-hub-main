<?php
require_once __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

$stmt = $pdo->query('SELECT id, name, email, plan, orders, status, DATE_FORMAT(joined_at, "%Y-%m-%d") AS joined FROM users ORDER BY id ASC');
$users = $stmt->fetchAll();

echo json_encode($users, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
