<?php
/**
 * Redeemers International School — API Configuration
 *
 * Change the admin credentials before production.
 */

// -------------------------------------------------------
// Admin account (hardcoded for now)
// -------------------------------------------------------
// Generate a new hash with: php -r "echo password_hash('your_password', PASSWORD_BCRYPT);"
// Change this password before production!
define('ADMIN_USERNAME', 'admin');
define('ADMIN_PASSWORD_HASH', '$2y$12$jaOPSG/Du3aT5q8DIpVLfeH78S3vn7oH9LstKcdvELD38ojnDZUPq'); // admin123

// -------------------------------------------------------
// Data file paths
// -------------------------------------------------------
define('DATA_DIR', __DIR__ . '/../data');
define('NEWS_FILE', DATA_DIR . '/news.json');

// -------------------------------------------------------
// CORS / session
// -------------------------------------------------------
ini_set('session.cookie_samesite', 'Lax');
ini_set('session.cookie_httponly', '1');
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
