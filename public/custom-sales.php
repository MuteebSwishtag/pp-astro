<?php
declare(strict_types=1);

$isJson = strpos($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json') !== false
    || strtolower($_SERVER['HTTP_X_REQUESTED_WITH'] ?? '') === 'xmlhttprequest';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(false, 'Invalid request method.', 405);
}

function respond(bool $ok, string $message, int $status = 200, string $field = ''): void
{
    global $isJson;
    http_response_code($status);

    if ($isJson) {
        header('Content-Type: application/json; charset=UTF-8');
        $payload = ['ok' => $ok, 'message' => $message];
        if ($field !== '') {
            $payload['field'] = $field;
        }
        echo json_encode($payload, JSON_UNESCAPED_SLASHES);
        exit;
    }

    $state = $ok ? 'sent' : 'error';
    header('Location: pricing.html?custom_sales=' . $state . '#custom-plan-form');
    exit;
}

function clean_input(string $key, int $limit = 1200): string
{
    $value = trim((string)($_POST[$key] ?? ''));
    $value = preg_replace('/[^\P{C}\t\r\n]/u', '', $value) ?? '';
    return substr($value, 0, $limit);
}

function fail_validation(string $message, string $field): void
{
    respond(false, $message, 422, $field);
}

function visible_length(string $value): int
{
    return (int)preg_match_all('/./us', $value, $matches);
}

function validate_text_field(string $value, string $field, string $label, int $min, int $max): void
{
    $length = visible_length($value);
    if ($length < $min) {
        fail_validation($label . ' must be at least ' . $min . ' characters.', $field);
    }
    if ($length > $max) {
        fail_validation($label . ' must be ' . $max . ' characters or fewer.', $field);
    }
}

function clean_header(string $value): string
{
    return trim(str_replace(["\r", "\n"], ' ', $value));
}

function mailbox(string $name, string $email): string
{
    $email = clean_header($email);
    $name = clean_header($name);
    if ($name === '') {
        return '<' . $email . '>';
    }

    return '=?UTF-8?B?' . base64_encode($name) . '?= <' . $email . '>';
}

function config_paths(): array
{
    $paths = [dirname(__DIR__) . DIRECTORY_SEPARATOR . 'swishtag-mail-config.php'];
    $documentRoot = $_SERVER['DOCUMENT_ROOT'] ?? '';

    if ($documentRoot !== '') {
        $paths[] = rtrim($documentRoot, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . '..' . DIRECTORY_SEPARATOR . 'swishtag-mail-config.php';
    }

    return array_values(array_unique($paths));
}

function load_mail_config(): array
{
    foreach (config_paths() as $path) {
        if (is_file($path)) {
            $config = require $path;
            if (is_array($config)) {
                return $config;
            }
        }
    }

    return [];
}

function smtp_read($socket, array $expectedCodes): string
{
    $message = '';

    while (($line = fgets($socket, 515)) !== false) {
        $message .= $line;
        if (strlen($line) >= 4 && $line[3] === ' ') {
            $code = (int)substr($line, 0, 3);
            if (!in_array($code, $expectedCodes, true)) {
                throw new RuntimeException('SMTP error: ' . trim($message));
            }
            return $message;
        }
    }

    throw new RuntimeException('SMTP connection closed unexpectedly.');
}

function smtp_command($socket, string $command, array $expectedCodes): string
{
    fwrite($socket, $command . "\r\n");
    return smtp_read($socket, $expectedCodes);
}

function smtp_data(string $message): string
{
    $lines = preg_split('/\r\n|\r|\n/', $message);
    $safe = array_map(static function (string $line): string {
        return substr($line, 0, 1) === '.' ? '.' . $line : $line;
    }, $lines ?: []);

    return implode("\r\n", $safe);
}

function send_smtp_mail(array $config, array $recipients, string $subject, string $body, string $replyToEmail, string $replyToName): void
{
    $host = (string)($config['host'] ?? '');
    $port = (int)($config['port'] ?? 587);
    $username = (string)($config['username'] ?? '');
    $password = (string)($config['password'] ?? '');
    $fromAddress = (string)($config['from_address'] ?? $username);
    $fromName = (string)($config['from_name'] ?? $config['app_name'] ?? 'PromoPlus');
    $encryption = strtolower((string)($config['encryption'] ?? 'tls'));

    if ($host === '' || $username === '' || $password === '' || !filter_var($fromAddress, FILTER_VALIDATE_EMAIL)) {
        throw new RuntimeException('Mail configuration is incomplete.');
    }

    $socket = stream_socket_client('tcp://' . $host . ':' . $port, $errno, $errstr, 20, STREAM_CLIENT_CONNECT);
    if (!$socket) {
        throw new RuntimeException('Could not connect to SMTP server: ' . $errstr);
    }

    stream_set_timeout($socket, 20);
    smtp_read($socket, [220]);
    smtp_command($socket, 'EHLO ' . ($_SERVER['SERVER_NAME'] ?? 'localhost'), [250]);

    if ($encryption === 'tls') {
        smtp_command($socket, 'STARTTLS', [220]);
        if (!stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
            throw new RuntimeException('Could not start TLS encryption.');
        }
        smtp_command($socket, 'EHLO ' . ($_SERVER['SERVER_NAME'] ?? 'localhost'), [250]);
    }

    smtp_command($socket, 'AUTH LOGIN', [334]);
    smtp_command($socket, base64_encode($username), [334]);
    smtp_command($socket, base64_encode($password), [235]);
    smtp_command($socket, 'MAIL FROM:<' . $fromAddress . '>', [250]);

    foreach ($recipients as $recipient) {
        smtp_command($socket, 'RCPT TO:<' . $recipient . '>', [250, 251]);
    }

    $headers = [
        'From: ' . mailbox($fromName, $fromAddress),
        'To: ' . implode(', ', array_map(static function (string $email): string {
            return '<' . clean_header($email) . '>';
        }, $recipients)),
        'Reply-To: ' . mailbox($replyToName, $replyToEmail),
        'Subject: =?UTF-8?B?' . base64_encode(clean_header($subject)) . '?=',
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: 8bit',
    ];

    smtp_command($socket, 'DATA', [354]);
    fwrite($socket, smtp_data(implode("\r\n", $headers) . "\r\n\r\n" . $body) . "\r\n.\r\n");
    smtp_read($socket, [250]);
    smtp_command($socket, 'QUIT', [221]);
    fclose($socket);
}

function send_native_mail(array $config, array $recipients, string $subject, string $body, string $replyToEmail, string $replyToName): void
{
    $fromAddress = (string)($config['from_address'] ?? 'hello@promoplus.app');
    $fromName = (string)($config['from_name'] ?? $config['app_name'] ?? 'PromoPlus');
    $headers = [
        'From: ' . mailbox($fromName, $fromAddress),
        'Reply-To: ' . mailbox($replyToName, $replyToEmail),
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
    ];

    $sent = mail(implode(',', $recipients), '=?UTF-8?B?' . base64_encode(clean_header($subject)) . '?=', $body, implode("\r\n", $headers));
    if (!$sent) {
        throw new RuntimeException('Native mail() failed.');
    }
}

try {
    if (clean_input('website', 120) !== '') {
        respond(true, 'Thanks. Your custom plan request was sent successfully.');
    }

    $name = clean_input('name', 500);
    $email = clean_input('email', 500);
    $company = clean_input('company', 500);
    $phone = clean_input('phone', 80);
    $needs = clean_input('needs', 3000);
    $sourcePlan = clean_input('source_plan', 120) ?: 'Custom Plan';

    if ($name === '') {
        fail_validation('Please enter your full name.', 'name');
    }

    if ($email === '') {
        fail_validation('Please enter your work email.', 'email');
    }

    if ($company === '') {
        fail_validation('Please enter your company name.', 'company');
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        fail_validation('Please enter a valid work email address.', 'email');
    }

    validate_text_field($name, 'name', 'Full name', 2, 120);
    validate_text_field($email, 'email', 'Work email', 6, 180);
    validate_text_field($company, 'company', 'Company name', 2, 160);

    if ($phone !== '' && !preg_match('/^\+?[0-9\s().-]{7,32}$/', $phone)) {
        fail_validation('Please enter a valid phone number using digits, spaces, +, dashes, or parentheses.', 'phone');
    }

    if (visible_length($needs) > 1800) {
        fail_validation('Please keep your message to 1800 characters or fewer.', 'needs');
    }

    $config = load_mail_config();
    $rawRecipients = $config['to'] ?? 'hello@promoplus.app';
    $recipients = is_array($rawRecipients) ? $rawRecipients : preg_split('/[,;]/', (string)$rawRecipients);
    $recipients = array_values(array_filter(array_map('trim', $recipients ?: []), static function (string $email): bool {
        return (bool)filter_var($email, FILTER_VALIDATE_EMAIL);
    }));

    if ($recipients === []) {
        throw new RuntimeException('No valid recipient is configured.');
    }

    $subject = 'PromoPlus custom plan request from ' . $company;
    $body = implode("\n", [
        'New PromoPlus custom plan request',
        '',
        'Plan: ' . $sourcePlan,
        'Name: ' . $name,
        'Work email: ' . $email,
        'Company: ' . $company,
        'Phone: ' . ($phone !== '' ? $phone : 'Not provided'),
        '',
        'What they need:',
        $needs !== '' ? $needs : 'Not provided',
        '',
        'Submitted: ' . gmdate('Y-m-d H:i:s') . ' UTC',
        'IP: ' . ($_SERVER['REMOTE_ADDR'] ?? 'Unknown'),
    ]);

    if (($config['host'] ?? '') !== '') {
        send_smtp_mail($config, $recipients, $subject, $body, $email, $name);
    } else {
        send_native_mail($config, $recipients, $subject, $body, $email, $name);
    }

    respond(true, 'Thanks. Your custom plan request was sent successfully.');
} catch (Throwable $error) {
    error_log('[PromoPlus custom-sales] ' . $error->getMessage());
    respond(false, 'Something went wrong while sending. Please try again.', 500);
}
