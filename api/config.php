<?php
/**
 * Redeemers International Secondary School — API Configuration
 *
 * Set the admin credentials before deployment.
 */

// -------------------------------------------------------
// Admin account (hardcoded for now)
// -------------------------------------------------------
// Generate a hash with: php -r "echo password_hash('your_password', PASSWORD_BCRYPT);"
define('ADMIN_USERNAME', 'admin');
define('ADMIN_PASSWORD_HASH', '');

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
