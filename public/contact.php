<?php
/**
 * FinOracles enquiry form handler (Hostinger web hosting).
 *
 * The website is static HTML; the contact / call-back forms POST here. Each valid
 * enquiry is emailed to NOTIFY_TO and appended to a CSV file kept OUTSIDE public_html,
 * so no lead is lost even if an email goes to spam.
 *
 * Edit the settings below if the addresses change. FROM_EMAIL should be a mailbox on
 * your own domain (create it in hPanel → Emails), otherwise mail may be rejected.
 */

const NOTIFY_TO   = 'connect@finoracles.com';
const FROM_EMAIL  = 'no-reply@finoracles.com';
const FROM_NAME   = 'FinOracles Website';
const MAX_PER_10_MIN = 5;

// Leads are saved one level above public_html (not reachable from the web).
$dataDir = dirname(__DIR__) . '/finoracles-enquiries';

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

function respond(int $code, array $body): void {
    http_response_code($code);
    echo json_encode($body, JSON_UNESCAPED_UNICODE);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    respond(405, ['status' => 'error', 'message' => 'Method not allowed.']);
}

// Only accept submissions from this site's own pages.
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$host   = $_SERVER['HTTP_HOST'] ?? '';
if ($origin !== '' && parse_url($origin, PHP_URL_HOST) !== preg_replace('/:\d+$/', '', $host)) {
    respond(403, ['status' => 'error', 'message' => 'Request not allowed.']);
}

$field = function (string $name, int $max): string {
    $v = trim((string)($_POST[$name] ?? ''));
    $v = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $v) ?? '';
    return mb_substr($v, 0, $max);
};
// Header-safe single-line value (blocks email header injection).
$line = fn(string $v): string => trim(str_replace(["\r", "\n"], ' ', $v));

$values = [
    'name'         => $line($field('name', 120)),
    'phone'        => $line($field('phone', 20)),
    'email'        => $line($field('email', 200)),
    'interest'     => $line($field('interest', 120)),
    'callbackTime' => $line($field('callbackTime', 60)),
    'message'      => $field('message', 5000),
    'page'         => $line($field('page', 300)),
];
$consent = ($_POST['consent'] ?? '') === 'on';
$success = ['status' => 'success', 'message' => 'Thank you! Your request has been received. Our team will call you back shortly.'];

// Honeypot: real visitors never see or fill this field.
if ($field('website', 200) !== '') respond(200, $success);

$errors = [];
if (mb_strlen($values['name']) < 2) $errors['name'] = 'Please enter your name.';
$digits = preg_replace('/\D/', '', $values['phone']);
if (strlen($digits) < 10 || strlen($digits) > 13) $errors['phone'] = 'Please enter a valid mobile number.';
if ($values['email'] !== '' && !filter_var($values['email'], FILTER_VALIDATE_EMAIL)) $errors['email'] = 'Please enter a valid email address.';
if (!$consent) $errors['consent'] = 'Please agree so we can contact you.';
if ($errors) respond(422, ['status' => 'error', 'message' => 'Please correct the highlighted fields.', 'errors' => $errors]);

if (!is_dir($dataDir)) @mkdir($dataDir, 0750, true);
if (is_dir($dataDir) && !file_exists("$dataDir/.htaccess")) @file_put_contents("$dataDir/.htaccess", "Require all denied\n");

// Simple per-IP throttle.
$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$throttleFile = (is_dir($dataDir) ? $dataDir : sys_get_temp_dir()) . '/throttle-' . md5($ip) . '.json';
$now  = time();
$hits = array_filter((array)json_decode((string)@file_get_contents($throttleFile), true), fn($t) => is_int($t) && $now - $t < 600);
$hits[] = $now;
@file_put_contents($throttleFile, json_encode(array_values($hits)), LOCK_EX);
if (count($hits) > MAX_PER_10_MIN) {
    respond(429, ['status' => 'error', 'message' => 'Too many requests. Please try again in a few minutes, or call us.']);
}

$date = (new DateTime('now', new DateTimeZone('Asia/Kolkata')))->format('Y-m-d H:i:s');

// 1) Save to CSV (backup of every lead).
$saved = false;
if (is_dir($dataDir)) {
    $csv = "$dataDir/enquiries.csv";
    $isNew = !file_exists($csv);
    if ($fh = @fopen($csv, 'a')) {
        flock($fh, LOCK_EX);
        if ($isNew) fputcsv($fh, ['Date (IST)', 'Name', 'Phone', 'Email', 'Interested in', 'Best time to call', 'Message', 'Page', 'IP']);
        // Prefix values that spreadsheets would treat as formulas.
        $safe = array_map(fn($v) => preg_match('/^[=+\-@]/', $v) ? "'$v" : $v, array_values($values));
        fputcsv($fh, array_merge([$date], array_slice($safe, 0, 6), [$values['page'], $ip]));
        flock($fh, LOCK_UN);
        fclose($fh);
        $saved = true;
    }
}

// 2) Email the team.
$subject = 'New website enquiry: ' . $values['name'] . ($values['interest'] ? ' (' . $values['interest'] . ')' : '');
$body = "New enquiry from the FinOracles website\n\n"
    . "Name:              {$values['name']}\n"
    . "Phone:             {$values['phone']}\n"
    . "Email:             " . ($values['email'] ?: '-') . "\n"
    . "Interested in:     " . ($values['interest'] ?: '-') . "\n"
    . "Best time to call: " . ($values['callbackTime'] ?: '-') . "\n"
    . "Page:              " . ($values['page'] ?: '-') . "\n"
    . "Received:          $date IST\n\n"
    . "Message:\n" . ($values['message'] ?: '-') . "\n";

$headers = [
    'From: ' . FROM_NAME . ' <' . FROM_EMAIL . '>',
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'X-Mailer: PHP/' . PHP_VERSION,
];
if ($values['email'] !== '') $headers[] = 'Reply-To: ' . $values['email'];

$mailed = @mail(NOTIFY_TO, '=?UTF-8?B?' . base64_encode($subject) . '?=', $body, implode("\r\n", $headers), '-f' . FROM_EMAIL);

if ($mailed || $saved) respond(200, $success);

error_log('[finoracles enquiry] could not send mail or save CSV');
respond(500, ['status' => 'error', 'message' => 'Sorry, something went wrong. Please call or WhatsApp us instead.']);
