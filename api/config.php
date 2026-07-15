<?php
define('ADMIN_USERNAME', 'admin');
define('ADMIN_PASSWORD_HASH', '');
define('SCHOOL_EMAIL', 'redeemersschoolenugu@gmail.com');
define('SCHOOL_NAME', 'Redeemers International Secondary School');

define('DATA_DIR', __DIR__ . '/../data');
define('NEWS_FILE', DATA_DIR . '/news.json');

ini_set('session.cookie_samesite', 'Lax');
ini_set('session.cookie_httponly', '1');
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
