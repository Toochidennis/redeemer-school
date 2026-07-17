<?php
/**
 * Redeemers International Secondary School — API Helpers
 */

require_once __DIR__ . '/config.php';

function json_response($data, int $status = 200): void {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

function require_admin(): void {
    if (empty($_SESSION['admin_logged_in'])) {
        json_response(['success' => false, 'message' => 'Unauthorized.'], 401);
    }
}

function verify_csrf(): void {
    $token = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    if (empty($_SESSION['csrf_token']) || !hash_equals($_SESSION['csrf_token'], $token)) {
        json_response(['success' => false, 'message' => 'Invalid or missing CSRF token.'], 403);
    }
}

function read_news(): array {
    if (!file_exists(NEWS_FILE)) {
        write_news(get_default_posts());
        return get_default_posts();
    }

    $raw = @file_get_contents(NEWS_FILE);
    if ($raw === false || trim($raw) === '') {
        return [];
    }

    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function write_news(array $posts): bool {
    if (!is_dir(DATA_DIR)) {
        @mkdir(DATA_DIR, 0755, true);
    }

    $json = json_encode(array_values($posts), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    if ($json === false) {
        return false;
    }

    $fp = @fopen(NEWS_FILE, 'c');
    if (!$fp) {
        return false;
    }

    if (flock($fp, LOCK_EX)) {
        ftruncate($fp, 0);
        fwrite($fp, $json);
        fflush($fp);
        flock($fp, LOCK_UN);
    }
    fclose($fp);

    return true;
}

function slugify(string $value): string {
    $value = strtolower(trim($value));
    $value = preg_replace('/[^a-z0-9\s-]/', '', $value);
    $value = preg_replace('/[\s]+/', '-', $value);
    return preg_replace('/-+/', '-', $value);
}

function unique_slug(string $slug, array $posts, ?string $ignoreId = null): string {
    $base = $slug;
    $counter = 1;
    while (true) {
        $collision = false;
        foreach ($posts as $post) {
            if (($post['slug'] ?? '') === $slug && ($ignoreId === null || ($post['id'] ?? '') !== $ignoreId)) {
                $collision = true;
                break;
            }
        }
        if (!$collision) {
            return $slug;
        }
        $slug = $base . '-' . $counter;
        $counter++;
    }
}

function normalize_image_path(string $image): string {
    return ltrim(trim($image), '/');
}

function sanitize_post(array $input): array {
    return [
        'title'   => trim(strip_tags($input['title'] ?? '')),
        'slug'    => trim(strip_tags($input['slug'] ?? '')),
        'category'=> trim(strip_tags($input['category'] ?? 'Notice')),
        'summary' => trim(strip_tags($input['summary'] ?? '')),
        'content' => trim($input['content'] ?? ''),
        'image'   => normalize_image_path(strip_tags($input['image'] ?? '')),
        'status'  => trim(strip_tags($input['status'] ?? 'draft')),
    ];
}

function is_allowed_image(string $image): bool {
    $image = normalize_image_path($image);
    $allowed = [
        'redeemers/optimized/campus.webp',
        'redeemers/optimized/school-block.webp',
        'redeemers/optimized/classroom.webp',
        'redeemers/optimized/laboratory.webp',
        'redeemers/optimized/practical-learning.webp',
        'redeemers/optimized/excursion.webp',
        'redeemers/optimized/skills-workshop.webp',
        'redeemers/optimized/badge.webp',
    ];
    if (in_array($image, $allowed, true)) {
        return true;
    }
    if (!preg_match('/^uploads\/news\/[a-z0-9][a-z0-9._-]*\.(jpe?g|png|webp|gif)$/i', $image)) {
        return false;
    }
    $fullPath = __DIR__ . '/../' . $image;
    return is_file($fullPath);
}

function validate_post(array $post): array {
    $errors = [];
    if (empty($post['title'])) $errors[] = 'Title is required.';
    if (empty($post['slug'])) $errors[] = 'Slug is required.';
    if (empty($post['category'])) $errors[] = 'Category is required.';
    if (empty($post['summary'])) $errors[] = 'Summary is required.';
    if (empty($post['content'])) $errors[] = 'Content is required.';
    if (!is_allowed_image($post['image'])) $errors[] = 'Image must be selected from the allowed list.';
    return $errors;
}

function new_news_id(): string {
    return 'news_' . strval(intval(microtime(true) * 1000));
}

function get_default_posts(): array {
    return [];
}
