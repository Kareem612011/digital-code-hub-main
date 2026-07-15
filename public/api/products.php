<?php
require_once __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

function respond($data, int $status = 200): void {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function getRequestParam(string $key, $default = null) {
    return isset($_GET[$key]) ? trim($_GET[$key]) : $default;
}

function castProduct(array $product): array {
    $product['includes'] = json_decode($product['includes'], true) ?: [];
    $product['activation'] = json_decode($product['activation'], true) ?: [];
    $product['faqs'] = json_decode($product['faqs'], true) ?: [];
    $product['instant'] = (bool) $product['instant'];
    $product['featured'] = (bool) $product['featured'];
    $product['bestSeller'] = (bool) $product['bestSeller'];
    $product['newArrival'] = (bool) $product['newArrival'];
    $product['flashDeal'] = (bool) $product['flashDeal'];
    $product['price'] = isset($product['price']) ? (float) $product['price'] : 0.0;
    $product['originalPrice'] = isset($product['originalPrice']) ? (float) $product['originalPrice'] : 0.0;
    $product['rating'] = isset($product['rating']) ? (float) $product['rating'] : 0.0;
    $product['reviews'] = isset($product['reviews']) ? (int) $product['reviews'] : 0;
    $product['sold'] = isset($product['sold']) ? (int) $product['sold'] : 0;
    $product['stock'] = isset($product['stock']) ? (int) $product['stock'] : 0;
    $product['flashEndsAt'] = isset($product['flashEndsAt']) && $product['flashEndsAt'] !== null ? (int) $product['flashEndsAt'] : null;

    return $product;
}

$id = getRequestParam('id');
$pathInfo = $_SERVER['PATH_INFO'] ?? '';
if (!$id && $pathInfo) {
    $pathSegments = explode('/', trim($pathInfo, '/'));
    if (count($pathSegments) > 0 && $pathSegments[0] !== '') {
        $id = $pathSegments[0];
    }
}

if ($id) {
    $stmt = $pdo->prepare('SELECT * FROM products WHERE id = :id OR slug = :id LIMIT 1');
    $stmt->execute(['id' => $id]);
    $product = $stmt->fetch();

    if (!$product) {
        respond(['error' => 'Product not found'], 404);
    }

    respond(castProduct($product));
$maxPrice = is_numeric(getRequestParam('maxPrice')) ? (float) getRequestParam('maxPrice') : 9999.0;
$sort = getRequestParam('sort') ?: 'popular';

$filters = [];
$params = [];

if ($category && $category !== 'All') {
    $filters[] = 'category = :category';
    $params['category'] = $category;
}
if ($platform && $platform !== 'All') {
    $filters[] = 'platform = :platform';
    $params['platform'] = $platform;
}
if ($region && $region !== 'All') {
    $filters[] = 'region = :region';
    $params['region'] = $region;
}
if ($duration && $duration !== 'All') {
    $filters[] = 'duration = :duration';
    $params['duration'] = $duration;
}
if ($brand && $brand !== 'All') {
    $filters[] = 'brand = :brand';
    $params['brand'] = $brand;
}
if ($inStock === 'true' || $inStock === '1') {
    $filters[] = 'stock > 0';
}
$filters[] = 'price BETWEEN :minPrice AND :maxPrice';
$params['minPrice'] = $minPrice;
$params['maxPrice'] = $maxPrice;

$orderBy = 'sold DESC';
switch ($sort) {
    case 'priceAsc':
        $orderBy = 'price ASC';
        break;
    case 'priceDesc':
        $orderBy = 'price DESC';
        break;
    case 'rating':
        $orderBy = 'rating DESC';
        break;
    case 'newest':
        $orderBy = 'flashEndsAt DESC';
        break;
}

$whereClause = count($filters) ? 'WHERE ' . implode(' AND ', $filters) : '';
$stmt = $pdo->prepare("SELECT * FROM products $whereClause ORDER BY $orderBy");
$stmt->execute($params);
$products = $stmt->fetchAll();

foreach ($products as &$product) {
    $product = castProduct($product);
}

respond($products);
