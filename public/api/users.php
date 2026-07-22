<?php
require_once __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'POST') {
    $body = json_decode(file_get_contents('php://input') ?: '[]', true);
    if (!is_array($body)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON body']);
        exit;
    }

    $name = isset($body['name']) ? trim((string)$body['name']) : '';
    $email = isset($body['email']) ? trim((string)$body['email']) : '';
    $password = isset($body['password']) ? (string)$body['password'] : '';

    if ($name === '' || $email === '') {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required fields: name and email']);
        exit;
    }

    $hashedPassword = $password !== '' ? password_hash($password, PASSWORD_DEFAULT) : null;

    $stmt = $pdo->prepare('INSERT INTO users (name, email, plan, orders, status, password) VALUES (:name, :email, :plan, :orders, :status, :password)
        ON DUPLICATE KEY UPDATE name = VALUES(name), password = COALESCE(VALUES(password), password)');
    $stmt->execute([
        'name' => $name,
        'email' => $email,
        'plan' => 'Starter',
        'orders' => 0,
        'status' => 'Active',
        'password' => $hashedPassword,
    ]);

    $stmt2 = $pdo->prepare('SELECT id, name, email, plan, orders, status, DATE_FORMAT(joined_at, "%Y-%m-%d") AS joined FROM users WHERE email = :email LIMIT 1');
    $stmt2->execute(['email' => $email]);
    $user = $stmt2->fetch();

    echo json_encode($user, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

$stmt = $pdo->query('SELECT id, name, email, plan, orders, status, DATE_FORMAT(joined_at, "%Y-%m-%d") AS joined FROM users ORDER BY id ASC');
$users = $stmt->fetchAll();
echo json_encode($users, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
