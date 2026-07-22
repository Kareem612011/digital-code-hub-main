<?php
require_once __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

$pdo->exec("
    CREATE TABLE IF NOT EXISTS admins (
      id INT PRIMARY KEY AUTO_INCREMENT,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
");

$stmt = $pdo->prepare('SELECT COUNT(*) AS count FROM admins');
$stmt->execute();
$count = (int)($stmt->fetch()['count'] ?? 0);
if ($count === 0) {
    $hash = password_hash('admin123', PASSWORD_DEFAULT);
    $pdo->prepare('INSERT INTO admins (email, password, name) VALUES (?, ?, ?)')
       ->execute(['admin@substore.com', $hash, 'Admin']);
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'POST') {
    $body = json_decode(file_get_contents('php://input') ?: '[]', true);
    if (!is_array($body)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON body']);
        exit;
    }

    $email = isset($body['email']) ? trim((string)$body['email']) : '';
    $password = isset($body['password']) ? trim((string)$body['password']) : '';

    if ($email === '' || $password === '') {
        http_response_code(400);
        echo json_encode(['error' => 'Email and password are required']);
        exit;
    }

    $stmt = $pdo->prepare('SELECT id, name, email, password FROM admins WHERE email = :email LIMIT 1');
    $stmt->execute(['email' => $email]);
    $admin = $stmt->fetch();

    if (!$admin || !password_verify($password, $admin['password'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid admin credentials']);
        exit;
    }

    unset($admin['password']);
    echo json_encode(['ok' => true, 'admin' => $admin]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
