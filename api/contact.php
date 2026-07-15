<?php
require_once __DIR__ . '/helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['success' => false, 'message' => 'Method not allowed.'], 405);
}

$body = json_decode(file_get_contents('php://input'), true);
if (!is_array($body)) {
    json_response(['success' => false, 'message' => 'Invalid request.'], 400);
}

function contact_text(array $body, string $key, int $max = 500): string {
    $value = trim(strip_tags(strval($body[$key] ?? '')));
    $value = preg_replace('/[\r\n]+/', ' ', $value);
    return substr($value, 0, $max);
}

if (contact_text($body, 'website') !== '') {
    json_response(['success' => true, 'message' => 'Thank you. The school office will review your enquiry.']);
}

$type = contact_text($body, 'type', 40) === 'admission' ? 'Admission enquiry' : 'Website message';
$name = contact_text($body, 'name', 120);
$contact = contact_text($body, 'contact', 160);
$classLevel = contact_text($body, 'classLevel', 120);
$subject = contact_text($body, 'subject', 160);
$message = trim(strip_tags(strval($body['message'] ?? '')));
$message = substr($message, 0, 3000);

$errors = [];
if ($name === '') $errors[] = 'Name is required.';
if ($contact === '') $errors[] = 'Email or phone is required.';
if ($type !== 'Admission enquiry' && $message === '') $errors[] = 'Message is required.';

if (!empty($errors)) {
    json_response(['success' => false, 'message' => implode(' ', $errors)], 400);
}

$mailSubject = $type . ' from ' . $name;
if ($subject !== '') {
    $mailSubject .= ': ' . $subject;
}

$lines = [
    $type,
    '',
    'Name: ' . $name,
    'Contact: ' . $contact,
];

if ($classLevel !== '') {
    $lines[] = 'Class of interest: ' . $classLevel;
}

if ($subject !== '') {
    $lines[] = 'Subject: ' . $subject;
}

$lines[] = '';
$lines[] = 'Message:';
$lines[] = $message !== '' ? $message : 'No extra message was provided.';
$lines[] = '';
$lines[] = 'Sent from the ' . SCHOOL_NAME . ' website.';

$headers = [
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'From: ' . SCHOOL_NAME . ' <' . SCHOOL_EMAIL . '>',
];

if (filter_var($contact, FILTER_VALIDATE_EMAIL)) {
    $headers[] = 'Reply-To: ' . $name . ' <' . $contact . '>';
}

$sent = @mail(SCHOOL_EMAIL, $mailSubject, implode("\n", $lines), implode("\r\n", $headers));

if (!$sent) {
    json_response(['success' => false, 'message' => 'The message could not be sent right now. Please call or email the school directly.'], 500);
}

json_response(['success' => true, 'message' => 'Thank you. The school office will review your enquiry.']);
