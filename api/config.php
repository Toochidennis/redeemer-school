<?php
define('ADMIN_USERNAME', 'admin');
define('ADMIN_PASSWORD_HASH', '');

define('DATA_DIR', __DIR__ . '/../data');
define('NEWS_FILE', DATA_DIR . '/news.json');
define('UPLOAD_DIR', __DIR__ . '/../uploads/news');
define('UPLOAD_PUBLIC_PATH', 'uploads/news');

ini_set('session.cookie_samesite', 'Lax');
ini_set('session.cookie_httponly', '1');
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
