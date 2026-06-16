<?php
// Prevent PHP from outputting warnings or notices as HTML/text to stdout
ini_set('display_errors', '0');
error_reporting(E_ALL);

// Start clean output buffering
if (!ob_get_level()) {
    ob_start();
}

/**
 * 📊 Dar'ee Application - database connection configurations
 * Implements standard MySQL/PDO connection with Arabic language support (utf8mb4).
 */

$dsn  = 'mysql:host=localhost;dbname=books;charset=utf8mb4';
$user = 'root';
$pass = '';

try {
    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ]);
} catch (PDOException $e) {
    // Clear buffer to prevent double output
    if (ob_get_length()) ob_clean();
    // Return structured JSON error for full compatibility with React frontend
    header('Content-Type: application/json; charset=utf-8');
    http_response_code(500);
    echo json_encode([
        'success'   => false,
        'error'     => 'الخادم لم يتمكن من الاتصال بقاعدة بيانات MySQL المحددة (تأكد من إنشاء قاعدة بيانات باسم books وتفعيل MySQL بأباكسي): ' . $e->getMessage(),
        'indicator' => 'LOCAL_JSON_FALLBACK'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}
