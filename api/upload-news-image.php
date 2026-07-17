<?php
require_once __DIR__ . '/helpers.php';

require_admin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['success' => false, 'message' => 'Method not allowed.'], 405);
}

verify_csrf();

if (empty($_FILES['image']) || !is_array($_FILES['image'])) {
    json_response(['success' => false, 'message' => 'No image was uploaded.'], 400);
}

$file = $_FILES['image'];

if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
    json_response(['success' => false, 'message' => 'The image upload failed.'], 400);
}

if (($file['size'] ?? 0) > 5 * 1024 * 1024) {
    json_response(['success' => false, 'message' => 'Image must be 5MB or smaller.'], 422);
}

$tmpPath = $file['tmp_name'] ?? '';
if ($tmpPath === '' || !is_uploaded_file($tmpPath)) {
    json_response(['success' => false, 'message' => 'Invalid upload.'], 400);
}

$info = @getimagesize($tmpPath);
if ($info === false) {
    json_response(['success' => false, 'message' => 'Uploaded file is not a valid image.'], 422);
}

$mime = $info['mime'] ?? '';
$extensions = [
    'image/jpeg' => 'jpg',
    'image/png'  => 'png',
    'image/webp' => 'webp',
    'image/gif'  => 'gif',
];

if (!isset($extensions[$mime])) {
    json_response(['success' => false, 'message' => 'Use JPG, PNG, WEBP, or GIF images only.'], 422);
}

if (!is_dir(UPLOAD_DIR) && !@mkdir(UPLOAD_DIR, 0755, true)) {
    json_response(['success' => false, 'message' => 'Upload folder is not writable.'], 500);
}

$original = pathinfo($file['name'] ?? 'news-image', PATHINFO_FILENAME);
$base = slugify($original);
if ($base === '') {
    $base = 'news-image';
}

$filename = $base . '-' . date('YmdHis') . '-' . bin2hex(random_bytes(3)) . '.' . $extensions[$mime];
$target = rtrim(UPLOAD_DIR, '/') . '/' . $filename;

if (!move_uploaded_file($tmpPath, $target)) {
    json_response(['success' => false, 'message' => 'Could not save the uploaded image.'], 500);
}

@chmod($target, 0644);

json_response([
    'success' => true,
    'image' => UPLOAD_PUBLIC_PATH . '/' . $filename,
    'name' => $file['name'] ?? $filename,
]);
