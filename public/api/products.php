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
}

$maxPrice = is_numeric(getRequestParam('maxPrice')) ? (float) getRequestParam('maxPrice') : 9999.0;
$sort = getRequestParam('sort') ?: 'popular';

// Admin mutations (must run before any GET list/by-id logic)
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if (in_array($method, ['POST', 'PUT', 'DELETE'], true)) {
    $body = json_decode(file_get_contents('php://input') ?: '[]', true);
    if (!is_array($body)) {
        respond(['error' => 'Invalid JSON body'], 400);
    }

    // POST /api/products
    if ($method === 'POST') {
        $name = trim((string)($body['name'] ?? ''));
        $slug = trim((string)($body['slug'] ?? ''));
        $category = (string)($body['category'] ?? '');
        $price = isset($body['price']) ? (float)$body['price'] : null;
        $originalPrice = isset($body['originalPrice']) ? (float)$body['originalPrice'] : null;
        $stock = isset($body['stock']) ? (int)$body['stock'] : null;

        if ($name === '' || $slug === '' || $category === '' || $price === null || $originalPrice === null || $stock === null) {
            respond(['error' => 'Missing required fields'], 400);
        }

        $stmt = $pdo->prepare('INSERT INTO products (slug, name, brand, brandColor, category, platform, region, duration, price, originalPrice, rating, reviews, sold, stock, instant, description, includes, activation, faqs) VALUES (:slug,:name,:brand,:brandColor,:category,:platform,:region,:duration,:price,:originalPrice,:rating,:reviews,:sold,:stock,:instant,:description,:includes,:activation,:faqs)');

        $stmt->execute([
            'slug' => $slug,
            'name' => $name,
            'brand' => (string)($body['brand'] ?? 'Custom'),
            'brandColor' => (string)($body['brandColor'] ?? '#6d5dfc'),
            'category' => $category,
            'platform' => (string)($body['platform'] ?? 'Web'),
            'region' => (string)($body['region'] ?? 'Global'),
            'duration' => (string)($body['duration'] ?? 'Instant'),
            'price' => $price,
            'originalPrice' => $originalPrice,
            'rating' => isset($body['rating']) ? (float)$body['rating'] : 5,
            'reviews' => isset($body['reviews']) ? (int)$body['reviews'] : 0,
            'sold' => isset($body['sold']) ? (int)$body['sold'] : 0,
            'stock' => $stock,
            'instant' => isset($body['instant']) ? (int)(bool)$body['instant'] : 1,
            'description' => (string)($body['description'] ?? ''),
            'includes' => json_encode((array)($body['includes'] ?? []), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            'activation' => json_encode((array)($body['activation'] ?? []), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            'faqs' => json_encode((array)($body['faqs'] ?? []), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        ]);

        $newId = (string)$pdo->lastInsertId();
        $stmt2 = $pdo->prepare('SELECT * FROM products WHERE id = :id LIMIT 1');
        $stmt2->execute(['id' => $newId]);
        $created = $stmt2->fetch();
        if (!$created) {
            respond(['error' => 'Failed to load created product'], 500);
        }
        respond(castProduct($created), 201);
    }

    // PUT /api/products
    if ($method === 'PUT') {
        $id = $body['id'] ?? null;
        $slug = isset($body['slug']) ? trim((string)$body['slug']) : null;

        if ($id === null || $slug === null || (string)$id === '') {
            respond(['error' => 'Missing required fields: id and slug'], 400);
        }

        $name = trim((string)($body['name'] ?? ''));
        $category = (string)($body['category'] ?? '');
        $price = isset($body['price']) ? (float)$body['price'] : null;
        $originalPrice = isset($body['originalPrice']) ? (float)$body['originalPrice'] : null;
        $stock = isset($body['stock']) ? (int)$body['stock'] : null;

        if ($name === '' || $category === '' || $price === null || $originalPrice === null || $stock === null) {
            respond(['error' => 'Missing required fields'], 400);
        }

        $stmt = $pdo->prepare('UPDATE products SET slug=:slug, name=:name, brand=:brand, brandColor=:brandColor, category=:category, platform=:platform, region=:region, duration=:duration, price=:price, originalPrice=:originalPrice, rating=:rating, reviews=:reviews, sold=:sold, stock=:stock, instant=:instant, description=:description, includes=:includes, activation=:activation, faqs=:faqs WHERE id=:id');

        $stmt->execute([
            'id' => (string)$id,
            'slug' => $slug,
            'name' => $name,
            'brand' => (string)($body['brand'] ?? 'Custom'),
            'brandColor' => (string)($body['brandColor'] ?? '#6d5dfc'),
            'category' => $category,
            'platform' => (string)($body['platform'] ?? 'Web'),
            'region' => (string)($body['region'] ?? 'Global'),
            'duration' => (string)($body['duration'] ?? 'Instant'),
            'price' => $price,
            'originalPrice' => $originalPrice,
            'rating' => isset($body['rating']) ? (float)$body['rating'] : 5,
            'reviews' => isset($body['reviews']) ? (int)$body['reviews'] : 0,
            'sold' => isset($body['sold']) ? (int)$body['sold'] : 0,
            'stock' => $stock,
            'instant' => isset($body['instant']) ? (int)(bool)$body['instant'] : 1,
            'description' => (string)($body['description'] ?? ''),
            'includes' => json_encode((array)($body['includes'] ?? []), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            'activation' => json_encode((array)($body['activation'] ?? []), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            'faqs' => json_encode((array)($body['faqs'] ?? []), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        ]);

        if ($stmt->rowCount() === 0) {
            respond(['error' => 'Product not found'], 404);
        }

        $stmt2 = $pdo->prepare('SELECT * FROM products WHERE id = :id LIMIT 1');
        $stmt2->execute(['id' => (string)$id]);
        $updated = $stmt2->fetch();
        if (!$updated) {
            respond(['error' => 'Failed to load updated product'], 500);
        }

        respond(castProduct($updated));
    }

    // DELETE /api/products (optional)
    if ($method === 'DELETE') {
        $id = $body['id'] ?? null;
        if ($id === null || (string)$id === '') {
            respond(['error' => 'Missing required field: id'], 400);
        }

        $stmt = $pdo->prepare('DELETE FROM products WHERE id = :id');
        $stmt->execute(['id' => (string)$id]);

        if ($stmt->rowCount() === 0) {
            respond(['error' => 'Product not found'], 404);
        }

        respond(['ok' => true]);
    }
}

$minPrice = is_numeric(getRequestParam('minPrice')) ? (float) getRequestParam('minPrice') : 0;

$filters = [];
$params = [];

$category = getRequestParam('category') ?: 'All';
$platform = getRequestParam('platform') ?: 'All';
$region = getRequestParam('region') ?: 'All';
$duration = getRequestParam('duration') ?: 'All';
$brand = getRequestParam('brand') ?: 'All';
$inStock = getRequestParam('inStock');

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

exit;

