<?php
declare(strict_types=1);

if (realpath($_SERVER['SCRIPT_FILENAME'] ?? '') === __FILE__) {
    http_response_code(404);
    exit;
}

function pp_env(string $key, string $default = ''): string
{
    $dotenv = pp_dotenv_values();
    if (isset($dotenv[$key]) && $dotenv[$key] !== '') {
        return $dotenv[$key];
    }

    return $default;
}

function pp_dotenv_paths(): array
{
    $documentRoot = $_SERVER['DOCUMENT_ROOT'] ?? '';

    if ($documentRoot === '') {
        return [];
    }

    return [
        dirname(rtrim($documentRoot, DIRECTORY_SEPARATOR)) . DIRECTORY_SEPARATOR . '.env',
    ];
}

function pp_dotenv_entries(): array
{
    static $entries = null;

    if ($entries !== null) {
        return $entries;
    }

    $entries = [];

    foreach (pp_dotenv_paths() as $path) {
        if (!is_file($path) || !is_readable($path)) {
            continue;
        }

        $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        if ($lines === false) {
            continue;
        }

        foreach ($lines as $line) {
            $line = trim($line);
            if ($line === '' || str_starts_with($line, '#') || !str_contains($line, '=')) {
                continue;
            }

            [$name, $value] = array_map('trim', explode('=', $line, 2));
            if ($name === '') {
                continue;
            }

            if (
                (str_starts_with($value, '"') && str_ends_with($value, '"'))
                || (str_starts_with($value, "'") && str_ends_with($value, "'"))
            ) {
                $value = substr($value, 1, -1);
            }

            $entries[$name] = [
                'value' => $value,
                'path' => $path,
            ];
        }
    }

    return $entries;
}

function pp_dotenv_values(): array
{
    static $values = null;

    if ($values !== null) {
        return $values;
    }

    $values = [];

    foreach (pp_dotenv_entries() as $name => $entry) {
        $values[$name] = (string)($entry['value'] ?? '');
    }

    return $values;
}

function pp_source_file(string $path): string
{
    if ($path === '') {
        return '';
    }

    return basename($path);
}

function pp_config_value(string $configKey, string $envKey, string $default = ''): string
{
    return pp_env($envKey, $default);
}

function pp_config_source(string $configKey, string $envKey, string $default = ''): array
{
    $dotenv = pp_dotenv_entries();
    if (isset($dotenv[$envKey]) && (string)($dotenv[$envKey]['value'] ?? '') !== '') {
        $path = (string)($dotenv[$envKey]['path'] ?? '');
        return [
            'key' => $envKey,
            'config_key' => $configKey,
            'source' => '.env',
            'file' => pp_source_file($path),
            'path' => $path,
            'value' => (string)$dotenv[$envKey]['value'],
        ];
    }

    return [
        'key' => $envKey,
        'config_key' => $configKey,
        'source' => $default !== '' ? 'default' : 'missing',
        'file' => '',
        'path' => '',
        'value' => $default,
    ];
}

function pp_config_debug_snapshot(): array
{
    return [
        'document_root' => $_SERVER['DOCUMENT_ROOT'] ?? '',
        'dotenv_paths' => array_map(static function (string $path): array {
            return [
                'path' => $path,
                'exists' => is_file($path),
                'readable' => is_readable($path),
            ];
        }, pp_dotenv_paths()),
        'values' => [
            pp_config_source('admin_user', 'PP_ADMIN_USER'),
            pp_config_source('admin_pass', 'PP_ADMIN_PASS'),
            pp_config_source('admin_pass_hash', 'PP_ADMIN_PASS_HASH'),
            pp_config_source('db_host', 'PP_DB_HOST', '127.0.0.1'),
            pp_config_source('db_port', 'PP_DB_PORT', '3306'),
            pp_config_source('db_name', 'PP_DB_NAME'),
            pp_config_source('db_user', 'PP_DB_USER'),
            pp_config_source('db_pass', 'PP_DB_PASS'),
            pp_config_source('db_charset', 'PP_DB_CHARSET', 'utf8mb4'),
        ],
    ];
}

function pp_pdo(): PDO
{
    static $pdo = null;

    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $host = pp_config_value('db_host', 'PP_DB_HOST', '127.0.0.1');
    $port = pp_config_value('db_port', 'PP_DB_PORT', '3306');
    $database = pp_config_value('db_name', 'PP_DB_NAME');
    $username = pp_config_value('db_user', 'PP_DB_USER');
    $password = pp_config_value('db_pass', 'PP_DB_PASS');
    $charset = pp_config_value('db_charset', 'PP_DB_CHARSET', 'utf8mb4');

    if ($database === '' || $username === '') {
        throw new RuntimeException('Database configuration is missing.');
    }

    $dsn = sprintf('mysql:host=%s;port=%s;dbname=%s;charset=%s', $host, $port, $database, $charset);
    $pdo = new PDO($dsn, $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);

    return $pdo;
}

function pp_ensure_custom_plan_table(PDO $pdo): void
{
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS custom_plan_requests (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            source_plan VARCHAR(120) NOT NULL DEFAULT 'Custom Plan',
            name VARCHAR(120) NOT NULL,
            email VARCHAR(180) NOT NULL,
            company VARCHAR(160) NOT NULL,
            phone VARCHAR(80) NULL,
            needs TEXT NULL,
            status VARCHAR(32) NOT NULL DEFAULT 'new',
            ip_address VARCHAR(45) NULL,
            user_agent VARCHAR(255) NULL,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            INDEX idx_custom_plan_created_at (created_at),
            INDEX idx_custom_plan_status (status),
            INDEX idx_custom_plan_email (email)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
}

function pp_store_custom_plan_request(array $submission): int
{
    $pdo = pp_pdo();
    pp_ensure_custom_plan_table($pdo);

    $statement = $pdo->prepare("
        INSERT INTO custom_plan_requests
            (source_plan, name, email, company, phone, needs, status, ip_address, user_agent)
        VALUES
            (:source_plan, :name, :email, :company, :phone, :needs, 'new', :ip_address, :user_agent)
    ");

    $statement->execute([
        ':source_plan' => $submission['source_plan'] ?? 'Custom Plan',
        ':name' => $submission['name'] ?? '',
        ':email' => $submission['email'] ?? '',
        ':company' => $submission['company'] ?? '',
        ':phone' => ($submission['phone'] ?? '') !== '' ? $submission['phone'] : null,
        ':needs' => ($submission['needs'] ?? '') !== '' ? $submission['needs'] : null,
        ':ip_address' => substr((string)($submission['ip_address'] ?? ''), 0, 45) ?: null,
        ':user_agent' => substr((string)($submission['user_agent'] ?? ''), 0, 255) ?: null,
    ]);

    return (int)$pdo->lastInsertId();
}

function pp_ensure_contact_request_table(PDO $pdo): void
{
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS contact_requests (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            inquiry_type VARCHAR(120) NOT NULL DEFAULT 'Contact Form',
            name VARCHAR(120) NOT NULL,
            email VARCHAR(180) NOT NULL,
            company VARCHAR(160) NULL,
            phone VARCHAR(80) NULL,
            message TEXT NOT NULL,
            status VARCHAR(32) NOT NULL DEFAULT 'new',
            ip_address VARCHAR(45) NULL,
            user_agent VARCHAR(255) NULL,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            INDEX idx_contact_created_at (created_at),
            INDEX idx_contact_status (status),
            INDEX idx_contact_email (email)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
}

function pp_store_contact_request(array $submission): int
{
    $pdo = pp_pdo();
    pp_ensure_contact_request_table($pdo);

    $statement = $pdo->prepare("
        INSERT INTO contact_requests
            (inquiry_type, name, email, company, phone, message, status, ip_address, user_agent)
        VALUES
            (:inquiry_type, :name, :email, :company, :phone, :message, 'new', :ip_address, :user_agent)
    ");

    $statement->execute([
        ':inquiry_type' => $submission['inquiry_type'] ?? 'Contact Form',
        ':name' => $submission['name'] ?? '',
        ':email' => $submission['email'] ?? '',
        ':company' => ($submission['company'] ?? '') !== '' ? $submission['company'] : null,
        ':phone' => ($submission['phone'] ?? '') !== '' ? $submission['phone'] : null,
        ':message' => $submission['message'] ?? '',
        ':ip_address' => substr((string)($submission['ip_address'] ?? ''), 0, 45) ?: null,
        ':user_agent' => substr((string)($submission['user_agent'] ?? ''), 0, 255) ?: null,
    ]);

    return (int)$pdo->lastInsertId();
}

function pp_h(?string $value): string
{
    return htmlspecialchars((string)$value, ENT_QUOTES, 'UTF-8');
}
