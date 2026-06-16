<?php
/**
 * 🚀 Dar'ee Application - PHP Integration Handler API (MySQL Backed)
 * Resolves actions: status, books, articles, thoughts, reviews, users, welcome-audio, sync.
 */

// 1. Configure CORS and response context Headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=utf-8");

// Handle OPTIONS requests (Prefly checks by standard browsers)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 2. Import SQL driver configuration. Falls back gracefully if database.sql is not run yet.
require_once __DIR__ . '/db_connect.php';

// Safe variables retrieval
$action = isset($_GET['action']) ? trim($_GET['action']) : '';
if (empty($action) && isset($_REQUEST['action'])) {
    $action = trim($_REQUEST['action']);
}
$id = isset($_GET['id']) ? trim($_GET['id']) : '';

$method = $_SERVER['REQUEST_METHOD'];

// Helper to decode raw JSON bodies
function getJsonPayload() {
    $raw = file_get_contents('php://input');
    return json_decode($raw, true);
}

try {
    switch ($action) {
        
        // --- STATUS MONITOR ---
        case 'status':
            // Verify if tables exist
            try {
                $check = $pdo->query("SELECT 1 FROM `books` LIMIT 1");
                $initialized = true;
            } catch (Exception $e) {
                $initialized = false;
            }
            echo json_encode([
                'success' => true,
                'initialized' => $initialized,
                'database' => 'MySQL (External Server Connection)',
                'php_version' => PHP_VERSION,
                'status' => $initialized ? 'ready' : 'tables_missing_please_import_sql'
            ], JSON_UNESCAPED_UNICODE);
            exit;

        // --- BOOKS CRUD ---
        case 'books':
            if ($method === 'GET') {
                if (!empty($id)) {
                    $stmt = $pdo->prepare("SELECT * FROM `books` WHERE `id` = ?");
                    $stmt->execute([$id]);
                    $book = $stmt->fetch();
                    if ($book) {
                        $book['isFree'] = (bool)$book['is_free'];
                        $book['price'] = (int)$book['price'];
                        $book['rating'] = (float)$book['rating'];
                        $book['views'] = (int)$book['views'];
                        $book['publishDate'] = $book['publish_date'];
                        $book['readTime'] = $book['read_time'];
                        $book['coverStyle'] = json_decode($book['cover_style'], true);
                        $book['content'] = json_decode($book['content'], true);
                        if ($book['free_copy_content']) $book['freeCopyContent'] = $book['free_copy_content'];
                        if ($book['drive_pdf_url']) $book['drivePdfUrl'] = $book['drive_pdf_url'];
                        if ($book['cover_image']) $book['coverImage'] = $book['cover_image'];
                        echo json_encode($book, JSON_UNESCAPED_UNICODE);
                    } else {
                        http_response_code(404);
                        echo json_encode(['error' => 'Book not found'], JSON_UNESCAPED_UNICODE);
                    }
                } else {
                    $stmt = $pdo->query("SELECT * FROM `books` ORDER BY `created_at` DESC");
                    $books = [];
                    while ($row = $stmt->fetch()) {
                        $row['isFree'] = (bool)$row['is_free'];
                        $row['price'] = (int)$row['price'];
                        $row['rating'] = (float)$row['rating'];
                        $row['views'] = (int)$row['views'];
                        $row['publishDate'] = $row['publish_date'];
                        $row['readTime'] = $row['read_time'];
                        $row['coverStyle'] = json_decode($row['cover_style'], true);
                        $row['content'] = json_decode($row['content'], true);
                        if ($row['free_copy_content']) $row['freeCopyContent'] = $row['free_copy_content'];
                        if ($row['drive_pdf_url']) $row['drivePdfUrl'] = $row['drive_pdf_url'];
                        if ($row['cover_image']) $row['coverImage'] = $row['cover_image'];
                        $books[] = $row;
                    }
                    echo json_encode($books, JSON_UNESCAPED_UNICODE);
                }
            } elseif ($method === 'POST' || $method === 'PUT') {
                $payload = getJsonPayload();
                if (!$payload || !isset($payload['id'])) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'error' => 'Invalid book metadata'], JSON_UNESCAPED_UNICODE);
                    exit;
                }
                
                $bookId = isset($payload['id']) ? $payload['id'] : $id;
                
                $stmt = $pdo->prepare("
                    INSERT INTO `books` (
                        `id`, `title`, `author`, `editor`, `category`, `description`, 
                        `publish_date`, `read_time`, `is_free`, `price`, `rating`, `views`, 
                        `cover_image`, `cover_style`, `content`, `free_copy_content`, `drive_pdf_url`
                    ) VALUES (
                        :id, :title, :author, :editor, :category, :description, 
                        :publish_date, :read_time, :is_free, :price, :rating, :views, 
                        :cover_image, :cover_style, :content, :free_copy_content, :drive_pdf_url
                    ) ON DUPLICATE KEY UPDATE 
                        `title` = :title1, `author` = :author1, `editor` = :editor1, 
                        `category` = :category1, `description` = :description1, 
                        `publish_date` = :publish_date1, `read_time` = :read_time1, 
                        `is_free` = :is_free1, `price` = :price1, `rating` = :rating1, `views` = :views1, 
                        `cover_image` = :cover_image1, `cover_style` = :cover_style1, 
                        `content` = :content1, `free_copy_content` = :free_copy_content1, `drive_pdf_url` = :drive_pdf_url1
                ");
                
                $stmt->execute([
                    'id' => $bookId,
                    'title' => $payload['title'],
                    'author' => $payload['author'],
                    'editor' => isset($payload['editor']) ? $payload['editor'] : null,
                    'category' => $payload['category'],
                    'description' => $payload['description'],
                    'publish_date' => isset($payload['publishDate']) ? $payload['publishDate'] : '',
                    'read_time' => isset($payload['readTime']) ? $payload['readTime'] : '',
                    'is_free' => (isset($payload['isFree']) && $payload['isFree'] === false) ? 0 : 1,
                    'price' => isset($payload['price']) ? (int)$payload['price'] : 0,
                    'rating' => isset($payload['rating']) ? (float)$payload['rating'] : 5.0,
                    'views' => isset($payload['views']) ? (int)$payload['views'] : 0,
                    'cover_image' => isset($payload['coverImage']) ? $payload['coverImage'] : null,
                    'cover_style' => json_encode(isset($payload['coverStyle']) ? $payload['coverStyle'] : []),
                    'content' => json_encode(isset($payload['content']) ? $payload['content'] : []),
                    'free_copy_content' => isset($payload['freeCopyContent']) ? $payload['freeCopyContent'] : null,
                    'drive_pdf_url' => isset($payload['drivePdfUrl']) ? $payload['drivePdfUrl'] : null,
                    
                    'title1' => $payload['title'],
                    'author1' => $payload['author'],
                    'editor1' => isset($payload['editor']) ? $payload['editor'] : null,
                    'category1' => $payload['category'],
                    'description1' => $payload['description'],
                    'publish_date1' => isset($payload['publishDate']) ? $payload['publishDate'] : '',
                    'read_time1' => isset($payload['readTime']) ? $payload['readTime'] : '',
                    'is_free1' => (isset($payload['isFree']) && $payload['isFree'] === false) ? 0 : 1,
                    'price1' => isset($payload['price']) ? (int)$payload['price'] : 0,
                    'rating1' => isset($payload['rating']) ? (float)$payload['rating'] : 5.0,
                    'views1' => isset($payload['views']) ? (int)$payload['views'] : 0,
                    'cover_image1' => isset($payload['coverImage']) ? $payload['coverImage'] : null,
                    'cover_style1' => json_encode(isset($payload['coverStyle']) ? $payload['coverStyle'] : []),
                    'content1' => json_encode(isset($payload['content']) ? $payload['content'] : []),
                    'free_copy_content1' => isset($payload['freeCopyContent']) ? $payload['freeCopyContent'] : null,
                    'drive_pdf_url1' => isset($payload['drivePdfUrl']) ? $payload['drivePdfUrl'] : null
                ]);
                
                echo json_encode(['success' => true, 'book' => $payload], JSON_UNESCAPED_UNICODE);
            } elseif ($method === 'DELETE') {
                $targetId = !empty($id) ? $id : (isset($_GET['id']) ? $_GET['id'] : '');
                if (!$targetId) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Missing book ID'], JSON_UNESCAPED_UNICODE);
                    exit;
                }
                $stmt = $pdo->prepare("DELETE FROM `books` WHERE `id` = ?");
                $stmt->execute([$targetId]);
                echo json_encode(['success' => true], JSON_UNESCAPED_UNICODE);
            }
            break;

        // --- ARTICLES CRUD ---
        case 'articles':
            if ($method === 'GET') {
                if (!empty($id)) {
                    $stmt = $pdo->prepare("SELECT * FROM `articles` WHERE `id` = ?");
                    $stmt->execute([$id]);
                    $art = $stmt->fetch();
                    if ($art) {
                        $art['views'] = (int)$art['views'];
                        $art['likes'] = (int)$art['likes'];
                        $art['rating'] = (float)$art['rating'];
                        $art['readTime'] = $art['read_time'];
                        $art['coverImage'] = $art['cover_image'];
                        $art['imageStyle'] = json_decode($art['image_style'], true);
                        $art['content'] = json_decode($art['content'], true);
                        if ($art['rich_content']) $art['richContent'] = json_decode($art['rich_content'], true);
                        echo json_encode($art, JSON_UNESCAPED_UNICODE);
                    } else {
                        http_response_code(404);
                        echo json_encode(['error' => 'Article not found'], JSON_UNESCAPED_UNICODE);
                    }
                } else {
                    $stmt = $pdo->query("SELECT * FROM `articles` ORDER BY `created_at` DESC");
                    $articles = [];
                    while ($row = $stmt->fetch()) {
                        $row['views'] = (int)$row['views'];
                        $row['likes'] = (int)$row['likes'];
                        $row['rating'] = (float)$row['rating'];
                        $row['readTime'] = $row['read_time'];
                        $row['coverImage'] = $row['cover_image'];
                        $row['imageStyle'] = json_decode($row['image_style'], true);
                        $row['content'] = json_decode($row['content'], true);
                        if ($row['rich_content']) $row['richContent'] = json_decode($row['rich_content'], true);
                        $articles[] = $row;
                    }
                    echo json_encode($articles, JSON_UNESCAPED_UNICODE);
                }
            } elseif ($method === 'POST' || $method === 'PUT') {
                $payload = getJsonPayload();
                if (!$payload || !isset($payload['id'])) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'error' => 'Invalid article metadata'], JSON_UNESCAPED_UNICODE);
                    exit;
                }
                
                $artId = isset($payload['id']) ? $payload['id'] : $id;
                
                $stmt = $pdo->prepare("
                    INSERT INTO `articles` (
                        `id`, `title`, `author`, `category`, `description`, `cover_image`, 
                        `image_style`, `content`, `rich_content`, `read_time`, `date`, `views`, `likes`, `rating`
                    ) VALUES (
                        :id, :title, :author, :category, :description, :cover_image, 
                        :image_style, :content, :rich_content, :read_time, :date, :views, :likes, :rating
                    ) ON DUPLICATE KEY UPDATE
                        `title` = :title1, `author` = :author1, `category` = :category1, 
                        `description` = :description1, `cover_image` = :cover_image1, `image_style` = :image_style1, 
                        `content` = :content1, `rich_content` = :rich_content1, `read_time` = :read_time1, 
                        `date` = :date1, `views` = :views1, `likes` = :likes1, `rating` = :rating1
                ");
                
                $stmt->execute([
                    'id' => $artId,
                    'title' => $payload['title'],
                    'author' => $payload['author'],
                    'category' => $payload['category'],
                    'description' => isset($payload['description']) ? $payload['description'] : null,
                    'cover_image' => isset($payload['coverImage']) ? $payload['coverImage'] : null,
                    'image_style' => json_encode(isset($payload['imageStyle']) ? $payload['imageStyle'] : []),
                    'content' => json_encode(isset($payload['content']) ? $payload['content'] : []),
                    'rich_content' => isset($payload['richContent']) ? json_encode($payload['richContent']) : null,
                    'read_time' => isset($payload['readTime']) ? $payload['readTime'] : '',
                    'date' => isset($payload['date']) ? $payload['date'] : '',
                    'views' => isset($payload['views']) ? (int)$payload['views'] : 0,
                    'likes' => isset($payload['likes']) ? (int)$payload['likes'] : 0,
                    'rating' => isset($payload['rating']) ? (float)$payload['rating'] : 5.0,
                    
                    'title1' => $payload['title'],
                    'author1' => $payload['author'],
                    'category1' => $payload['category'],
                    'description1' => isset($payload['description']) ? $payload['description'] : null,
                    'cover_image1' => isset($payload['coverImage']) ? $payload['coverImage'] : null,
                    'image_style1' => json_encode(isset($payload['imageStyle']) ? $payload['imageStyle'] : []),
                    'content1' => json_encode(isset($payload['content']) ? $payload['content'] : []),
                    'rich_content1' => isset($payload['richContent']) ? json_encode($payload['richContent']) : null,
                    'read_time1' => isset($payload['readTime']) ? $payload['readTime'] : '',
                    'date1' => isset($payload['date']) ? $payload['date'] : '',
                    'views1' => isset($payload['views']) ? (int)$payload['views'] : 0,
                    'likes1' => isset($payload['likes']) ? (int)$payload['likes'] : 0,
                    'rating1' => isset($payload['rating']) ? (float)$payload['rating'] : 5.0
                ]);
                echo json_encode(['success' => true, 'article' => $payload], JSON_UNESCAPED_UNICODE);
            } elseif ($method === 'DELETE') {
                $targetId = !empty($id) ? $id : (isset($_GET['id']) ? $_GET['id'] : '');
                if (!$targetId) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Missing article ID'], JSON_UNESCAPED_UNICODE);
                    exit;
                }
                $stmt = $pdo->prepare("DELETE FROM `articles` WHERE `id` = ?");
                $stmt->execute([$targetId]);
                echo json_encode(['success' => true], JSON_UNESCAPED_UNICODE);
            }
            break;

        // --- THOUGHTS CRUD ---
        case 'thoughts':
            if ($method === 'GET') {
                $stmt = $pdo->query("SELECT * FROM `thoughts` ORDER BY `created_at` DESC");
                $thoughts = [];
                while ($row = $stmt->fetch()) {
                    $row['likes'] = (int)$row['likes'];
                    $row['views'] = isset($row['views']) ? (int)$row['views'] : 0;
                    $row['rating'] = isset($row['rating']) ? (float)$row['rating'] : 5.0;
                    $thoughts[] = $row;
                }
                echo json_encode($thoughts, JSON_UNESCAPED_UNICODE);
            } elseif ($method === 'POST') {
                $payload = getJsonPayload();
                if (!$payload || !isset($payload['id'])) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'error' => 'Invalid thought metadata'], JSON_UNESCAPED_UNICODE);
                    exit;
                }
                
                $stmt = $pdo->prepare("
                    INSERT INTO `thoughts` (`id`, `title`, `content`, `author`, `category`, `date`, `likes`, `rating`, `views`)
                    VALUES (:id, :title, :content, :author, :category, :date, :likes, :rating, :views)
                    ON DUPLICATE KEY UPDATE
                        `title` = :title1, `content` = :content1, `author` = :author1, 
                        `category` = :category1, `date` = :date1, `likes` = :likes1, `rating` = :rating1, `views` = :views1
                ");
                $stmt->execute([
                    'id' => $payload['id'],
                    'title' => isset($payload['title']) ? $payload['title'] : null,
                    'content' => $payload['content'],
                    'author' => $payload['author'],
                    'category' => $payload['category'],
                    'date' => $payload['date'],
                    'likes' => isset($payload['likes']) ? (int)$payload['likes'] : 0,
                    'rating' => isset($payload['rating']) ? (float)$payload['rating'] : 5.0,
                    'views' => isset($payload['views']) ? (int)$payload['views'] : 0,
                    
                    'title1' => isset($payload['title']) ? $payload['title'] : null,
                    'content1' => $payload['content'],
                    'author1' => $payload['author'],
                    'category1' => $payload['category'],
                    'date1' => $payload['date'],
                    'likes1' => isset($payload['likes']) ? (int)$payload['likes'] : 0,
                    'rating1' => isset($payload['rating']) ? (float)$payload['rating'] : 5.0,
                    'views1' => isset($payload['views']) ? (int)$payload['views'] : 0
                ]);
                echo json_encode(['success' => true, 'thought' => $payload], JSON_UNESCAPED_UNICODE);
            } elseif ($method === 'DELETE') {
                $targetId = !empty($id) ? $id : (isset($_GET['id']) ? $_GET['id'] : '');
                if (!$targetId) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Missing thought ID'], JSON_UNESCAPED_UNICODE);
                    exit;
                }
                $stmt = $pdo->prepare("DELETE FROM `thoughts` WHERE `id` = ?");
                $stmt->execute([$targetId]);
                echo json_encode(['success' => true], JSON_UNESCAPED_UNICODE);
            }
            break;

        // --- REVIEWS CRUD ---
        case 'reviews':
            if ($method === 'GET') {
                $stmt = $pdo->query("SELECT * FROM `reviews` ORDER BY `created_at` DESC");
                $reviews = [];
                while ($row = $stmt->fetch()) {
                    $row['itemId'] = $row['item_id'];
                    $row['authorName'] = $row['author_name'];
                    $row['userId'] = $row['user_id'];
                    $row['rating'] = $row['rating'] !== null ? (int)$row['rating'] : null;
                    $row['replies'] = json_decode($row['replies'], true);
                    $reviews[] = $row;
                }
                echo json_encode($reviews, JSON_UNESCAPED_UNICODE);
            } elseif ($method === 'POST') {
                $payload = getJsonPayload();
                if (!$payload || !isset($payload['id'])) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'error' => 'Invalid review metadata'], JSON_UNESCAPED_UNICODE);
                    exit;
                }
                
                $stmt = $pdo->prepare("
                    INSERT INTO `reviews` (`id`, `item_id`, `author_name`, `content`, `rating`, `date`, `user_id`, `replies`)
                    VALUES (:id, :item_id, :author_name, :content, :rating, :date, :user_id, :replies)
                    ON DUPLICATE KEY UPDATE
                        `item_id` = :item_id1, `author_name` = :author_name1, `content` = :content1, 
                        `rating` = :rating1, `date` = :date1, `user_id` = :user_id1, `replies` = :replies1
                ");
                $stmt->execute([
                    'id' => $payload['id'],
                    'item_id' => $payload['itemId'],
                    'author_name' => $payload['authorName'],
                    'content' => $payload['content'],
                    'rating' => isset($payload['rating']) ? (int)$payload['rating'] : null,
                    'date' => $payload['date'],
                    'user_id' => $payload['userId'],
                    'replies' => isset($payload['replies']) ? json_encode($payload['replies']) : null,
                    
                    'item_id1' => $payload['itemId'],
                    'author_name1' => $payload['authorName'],
                    'content1' => $payload['content'],
                    'rating1' => isset($payload['rating']) ? (int)$payload['rating'] : null,
                    'date1' => $payload['date'],
                    'user_id1' => $payload['userId'],
                    'replies1' => isset($payload['replies']) ? json_encode($payload['replies']) : null
                ]);
                echo json_encode(['success' => true, 'review' => $payload], JSON_UNESCAPED_UNICODE);
            } elseif ($method === 'DELETE') {
                $targetId = !empty($id) ? $id : (isset($_GET['id']) ? $_GET['id'] : '');
                if (!$targetId) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Missing review ID'], JSON_UNESCAPED_UNICODE);
                    exit;
                }
                $stmt = $pdo->prepare("DELETE FROM `reviews` WHERE `id` = ?");
                $stmt->execute([$targetId]);
                echo json_encode(['success' => true], JSON_UNESCAPED_UNICODE);
            }
            break;

        // --- USERS CRUD (MAP STRUCTURE) ---
        case 'users':
            if ($method === 'GET') {
                $stmt = $pdo->query("SELECT * FROM `users`");
                $usersMap = [];
                while ($row = $stmt->fetch()) {
                    $usersMap[$row['username']] = [
                        'username' => $row['username'],
                        'email' => $row['email'],
                        'password' => $row['password'],
                        'name' => $row['name'],
                        'role' => $row['role'],
                        'avatarSeed' => $row['avatar_seed']
                    ];
                }
                echo json_encode($usersMap, JSON_UNESCAPED_UNICODE);
            } elseif ($method === 'POST') {
                $payload = getJsonPayload(); // expects map { username: user }
                if ($payload && is_array($payload)) {
                    foreach ($payload as $username => $u) {
                        $stmt = $pdo->prepare("
                            INSERT INTO `users` (`username`, `email`, `password`, `name`, `role`, `avatar_seed`)
                            VALUES (:username, :email, :password, :name, :role, :avatar_seed)
                            ON DUPLICATE KEY UPDATE
                                `email` = :email1, `password` = :password1, `name` = :name1, 
                                `role` = :role1, `avatar_seed` = :avatar_seed1
                        ");
                        $stmt->execute([
                            'username' => $username,
                            'email' => $u['email'],
                            'password' => isset($u['password']) ? $u['password'] : '123456',
                            'name' => $u['name'],
                            'role' => isset($u['role']) ? $u['role'] : 'user',
                            'avatar_seed' => isset($u['avatarSeed']) ? $u['avatarSeed'] : 'user-default',
                            
                            'email1' => $u['email'],
                            'password1' => isset($u['password']) ? $u['password'] : '123456',
                            'name1' => $u['name'],
                            'role1' => isset($u['role']) ? $u['role'] : 'user',
                            'avatar_seed1' => isset($u['avatarSeed']) ? $u['avatarSeed'] : 'user-default'
                        ]);
                    }
                }
                echo json_encode(['success' => true], JSON_UNESCAPED_UNICODE);
            }
            break;

        // --- WELCOME AUDIO OBJECT ---
        case 'welcome-audio':
            if ($method === 'GET') {
                $stmt = $pdo->query("SELECT * FROM `welcome_audio` ORDER BY `id` DESC LIMIT 1");
                $audioObj = $stmt->fetch();
                if ($audioObj) {
                    echo json_encode([
                        'audio' => $audioObj['audio'],
                        'filename' => $audioObj['filename']
                    ], JSON_UNESCAPED_UNICODE);
                } else {
                    echo json_encode(['audio' => null, 'filename' => null], JSON_UNESCAPED_UNICODE);
                }
            } elseif ($method === 'POST') {
                $payload = getJsonPayload();
                if (!$payload || !isset($payload['audio'])) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Missing audio binary string'], JSON_UNESCAPED_UNICODE);
                    exit;
                }
                // Truncate previous audios to keep database clean
                $pdo->exec("TRUNCATE TABLE `welcome_audio`");
                
                $stmt = $pdo->prepare("INSERT INTO `welcome_audio` (`audio`, `filename`) VALUES (?, ?)");
                $stmt->execute([$payload['audio'], isset($payload['filename']) ? $payload['filename'] : 'audio.mp3']);
                echo json_encode(['success' => true], JSON_UNESCAPED_UNICODE);
            } elseif ($method === 'DELETE') {
                $pdo->exec("TRUNCATE TABLE `welcome_audio`");
                echo json_encode(['success' => true], JSON_UNESCAPED_UNICODE);
            }
            break;

        // --- MASS DATA BOOTSTRAP / SYNCHRONIZER (Node style) ---
        case 'bootstrap':
        case 'sync':
            if ($method === 'POST') {
                $payload = getJsonPayload();
                if (!$payload) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Payload is empty'], JSON_UNESCAPED_UNICODE);
                    exit;
                }

                // If books are sent in sync
                if (isset($payload['books']) && is_array($payload['books'])) {
                    foreach ($payload['books'] as $b) {
                        $stmt = $pdo->prepare("
                            INSERT INTO `books` (
                                `id`, `title`, `author`, `editor`, `category`, `description`, 
                                `publish_date`, `read_time`, `is_free`, `price`, `rating`, `views`, 
                                `cover_image`, `cover_style`, `content`, `free_copy_content`, `drive_pdf_url`
                            ) VALUES (
                                :id, :title, :author, :editor, :category, :description, 
                                :publish_date, :read_time, :is_free, :price, :rating, :views, 
                                :cover_image, :cover_style, :content, :free_copy_content, :drive_pdf_url
                            ) ON DUPLICATE KEY UPDATE 
                                `title` = :title1, `author` = :author1, `editor` = :editor1, 
                                `category` = :category1, `description` = :description1, 
                                `publish_date` = :publish_date1, `read_time` = :read_time1, 
                                `is_free` = :is_free1, `price` = :price1, `rating` = :rating1, `views` = :views1, 
                                `cover_image` = :cover_image1, `cover_style` = :cover_style1, 
                                `content` = :content1, `free_copy_content` = :free_copy_content1, `drive_pdf_url` = :drive_pdf_url1
                        ");
                        $stmt->execute([
                            'id' => $b['id'],
                            'title' => $b['title'],
                            'author' => $b['author'],
                            'editor' => isset($b['editor']) ? $b['editor'] : null,
                            'category' => $b['category'],
                            'description' => $b['description'],
                            'publish_date' => isset($b['publishDate']) ? $b['publishDate'] : '',
                            'read_time' => isset($b['readTime']) ? $b['readTime'] : '',
                            'is_free' => (isset($b['isFree']) && $b['isFree'] === false) ? 0 : 1,
                            'price' => isset($b['price']) ? (int)$b['price'] : 0,
                            'rating' => isset($b['rating']) ? (float)$b['rating'] : 5.0,
                            'views' => isset($b['views']) ? (int)$b['views'] : 0,
                            'cover_image' => isset($b['coverImage']) ? $b['coverImage'] : null,
                            'cover_style' => json_encode(isset($b['coverStyle']) ? $b['coverStyle'] : []),
                            'content' => json_encode(isset($b['content']) ? $b['content'] : []),
                            'free_copy_content' => isset($b['freeCopyContent']) ? $b['freeCopyContent'] : null,
                            'drive_pdf_url' => isset($b['drivePdfUrl']) ? $b['drivePdfUrl'] : null,
                            
                            'title1' => $b['title'],
                            'author1' => $b['author'],
                            'editor1' => isset($b['editor']) ? $b['editor'] : null,
                            'category1' => $b['category'],
                            'description1' => $b['description'],
                            'publish_date1' => isset($b['publishDate']) ? $b['publishDate'] : '',
                            'read_time1' => isset($b['readTime']) ? $b['readTime'] : '',
                            'is_free1' => (isset($b['isFree']) && $b['isFree'] === false) ? 0 : 1,
                            'price1' => isset($b['price']) ? (int)$b['price'] : 0,
                            'rating1' => isset($b['rating']) ? (float)$b['rating'] : 5.0,
                            'views1' => isset($b['views']) ? (int)$b['views'] : 0,
                            'cover_image1' => isset($b['coverImage']) ? $b['coverImage'] : null,
                            'cover_style1' => json_encode(isset($b['coverStyle']) ? $b['coverStyle'] : []),
                            'content1' => json_encode(isset($b['content']) ? $b['content'] : []),
                            'free_copy_content1' => isset($b['freeCopyContent']) ? $b['freeCopyContent'] : null,
                            'drive_pdf_url1' => isset($b['drivePdfUrl']) ? $b['drivePdfUrl'] : null
                        ]);
                    }
                }

                // If articles are sent in sync
                if (isset($payload['articles']) && is_array($payload['articles'])) {
                    foreach ($payload['articles'] as $a) {
                        $stmt = $pdo->prepare("
                            INSERT INTO `articles` (
                                `id`, `title`, `author`, `category`, `description`, `cover_image`, 
                                `image_style`, `content`, `rich_content`, `read_time`, `date`, `views`, `likes`, `rating`
                            ) VALUES (
                                :id, :title, :author, :category, :description, :cover_image, 
                                :image_style, :content, :rich_content, :read_time, :date, :views, :likes, :rating
                            ) ON DUPLICATE KEY UPDATE
                                `title` = :title1, `author` = :author1, `category` = :category1, 
                                `description` = :description1, `cover_image` = :cover_image1, `image_style` = :image_style1, 
                                `content` = :content1, `rich_content` = :rich_content1, `read_time` = :read_time1, 
                                `date` = :date1, `views` = :views1, `likes` = :likes1, `rating` = :rating1
                        ");
                        $stmt->execute([
                            'id' => $a['id'],
                            'title' => $a['title'],
                            'author' => $a['author'],
                            'category' => $a['category'],
                            'description' => isset($a['description']) ? $a['description'] : null,
                            'cover_image' => isset($a['coverImage']) ? $a['coverImage'] : null,
                            'image_style' => json_encode(isset($a['imageStyle']) ? $a['imageStyle'] : []),
                            'content' => json_encode(isset($a['content']) ? $a['content'] : []),
                            'rich_content' => isset($a['richContent']) ? json_encode($a['richContent']) : null,
                            'read_time' => isset($a['readTime']) ? $a['readTime'] : '',
                            'date' => isset($a['date']) ? $a['date'] : '',
                            'views' => isset($a['views']) ? (int)$a['views'] : 0,
                            'likes' => isset($a['likes']) ? (int)$a['likes'] : 0,
                            'rating' => isset($a['rating']) ? (float)$a['rating'] : 5.0,
                            
                            'title1' => $a['title'],
                            'author1' => $a['author'],
                            'category1' => $a['category'],
                            'description1' => isset($a['description']) ? $a['description'] : null,
                            'cover_image1' => isset($a['coverImage']) ? $a['coverImage'] : null,
                            'image_style1' => json_encode(isset($a['imageStyle']) ? $a['imageStyle'] : []),
                            'content1' => json_encode(isset($a['content']) ? $a['content'] : []),
                            'rich_content1' => isset($a['richContent']) ? json_encode($a['richContent']) : null,
                            'read_time1' => isset($a['readTime']) ? $a['readTime'] : '',
                            'date1' => isset($a['date']) ? $a['date'] : '',
                            'views1' => isset($a['views']) ? (int)$a['views'] : 0,
                            'likes1' => isset($a['likes']) ? (int)$a['likes'] : 0,
                            'rating1' => isset($a['rating']) ? (float)$a['rating'] : 5.0
                        ]);
                    }
                }

                // If thoughts are sent in sync
                if (isset($payload['thoughts']) && is_array($payload['thoughts'])) {
                    foreach ($payload['thoughts'] as $t) {
                        $stmt = $pdo->prepare("
                            INSERT INTO `thoughts` (`id`, `title`, `content`, `author`, `category`, `date`, `likes`, `rating`, `views`)
                            VALUES (:id, :title, :content, :author, :category, :date, :likes, :rating, :views)
                            ON DUPLICATE KEY UPDATE
                                `title` = :title1, `content` = :content1, `author` = :author1, 
                                `category` = :category1, `date` = :date1, `likes` = :likes1, `rating` = :rating1, `views` = :views1
                        ");
                        $stmt->execute([
                            'id' => $t['id'],
                            'title' => isset($t['title']) ? $t['title'] : null,
                            'content' => $t['content'],
                            'author' => $t['author'],
                            'category' => $t['category'],
                            'date' => $t['date'],
                            'likes' => isset($t['likes']) ? (int)$t['likes'] : 0,
                            'rating' => isset($t['rating']) ? (float)$t['rating'] : 5.0,
                            'views' => isset($t['views']) ? (int)$t['views'] : 0,
                            
                            'title1' => isset($t['title']) ? $t['title'] : null,
                            'content1' => $t['content'],
                            'author1' => $t['author'],
                            'category1' => $t['category'],
                            'date1' => $t['date'],
                            'likes1' => isset($t['likes']) ? (int)$t['likes'] : 0,
                            'rating1' => isset($t['rating']) ? (float)$t['rating'] : 5.0,
                            'views1' => isset($t['views']) ? (int)$t['views'] : 0
                        ]);
                    }
                }

                // If reviews are sent in sync
                if (isset($payload['reviews']) && is_array($payload['reviews'])) {
                    foreach ($payload['reviews'] as $r) {
                        $stmt = $pdo->prepare("
                            INSERT INTO `reviews` (`id`, `item_id`, `author_name`, `content`, `rating`, `date`, `user_id`, `replies`)
                            VALUES (:id, :item_id, :author_name, :content, :rating, :date, :user_id, :replies)
                            ON DUPLICATE KEY UPDATE
                                `item_id` = :item_id1, `author_name` = :author_name1, `content` = :content1, 
                                `rating` = :rating1, `date` = :date1, `user_id` = :user_id1, `replies` = :replies1
                        ");
                        $stmt->execute([
                            'id' => $r['id'],
                            'item_id' => $r['itemId'],
                            'author_name' => $r['authorName'],
                            'content' => $r['content'],
                            'rating' => isset($r['rating']) ? (int)$r['rating'] : null,
                            'date' => $r['date'],
                            'user_id' => $r['userId'],
                            'replies' => isset($r['replies']) ? json_encode($r['replies']) : null,
                            
                            'item_id1' => $r['itemId'],
                            'author_name1' => $r['authorName'],
                            'content1' => $r['content'],
                            'rating1' => isset($r['rating']) ? (int)$r['rating'] : null,
                            'date1' => $r['date'],
                            'user_id1' => $r['userId'],
                            'replies1' => isset($r['replies']) ? json_encode($r['replies']) : null
                        ]);
                    }
                }

                // If users map is sent in sync
                if (isset($payload['users']) && is_array($payload['users'])) {
                    foreach ($payload['users'] as $username => $u) {
                        $stmt = $pdo->prepare("
                            INSERT INTO `users` (`username`, `email`, `password`, `name`, `role`, `avatar_seed`)
                            VALUES (:username, :email, :password, :name, :role, :avatar_seed)
                            ON DUPLICATE KEY UPDATE
                                `email` = :email1, `password` = :password1, `name` = :name1, 
                                `role` = :role1, `avatar_seed` = :avatar_seed1
                        ");
                        $stmt->execute([
                            'username' => $username,
                            'email' => $u['email'],
                            'password' => isset($u['password']) ? $u['password'] : '123456',
                            'name' => $u['name'],
                            'role' => isset($u['role']) ? $u['role'] : 'user',
                            'avatar_seed' => isset($u['avatarSeed']) ? $u['avatarSeed'] : 'user-default',
                            
                            'email1' => $u['email'],
                            'password1' => isset($u['password']) ? $u['password'] : '123456',
                            'name1' => $u['name'],
                            'role1' => isset($u['role']) ? $u['role'] : 'user',
                            'avatar_seed1' => isset($u['avatarSeed']) ? $u['avatarSeed'] : 'user-default'
                        ]);
                    }
                }

                echo json_encode(['success' => true], JSON_UNESCAPED_UNICODE);
            }
            break;

        default:
            http_response_code(400);
            echo json_encode(['error' => 'Invalid or empty endpoint action requested'], JSON_UNESCAPED_UNICODE);
            break;
    }
} catch (Exception $e) {
    if (ob_get_length()) ob_clean();
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'خطأ معالجة PDO خارجي: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
