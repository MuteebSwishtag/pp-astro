<?php
declare(strict_types=1);

if (realpath($_SERVER['SCRIPT_FILENAME'] ?? '') === __FILE__) {
    http_response_code(404);
    exit;
}

function pp_env(string $key, string $default = ''): string
{
    $value = getenv($key);
    if ($value !== false && $value !== '') {
        return (string)$value;
    }

    if (isset($_ENV[$key]) && $_ENV[$key] !== '') {
        return (string)$_ENV[$key];
    }

    if (isset($_SERVER[$key]) && $_SERVER[$key] !== '') {
        return (string)$_SERVER[$key];
    }

    $dotenv = pp_dotenv_values();
    if (isset($dotenv[$key]) && $dotenv[$key] !== '') {
        return $dotenv[$key];
    }

    return $default;
}

function pp_dotenv_paths(): array
{
    $paths = [dirname(__DIR__) . DIRECTORY_SEPARATOR . '.env'];
    $documentRoot = $_SERVER['DOCUMENT_ROOT'] ?? '';

    if ($documentRoot !== '') {
        $paths[] = rtrim($documentRoot, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . '..' . DIRECTORY_SEPARATOR . '.env';
    }

    return array_values(array_unique($paths));
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

function pp_config_paths(): array
{
    $paths = [dirname(__DIR__) . DIRECTORY_SEPARATOR . 'promoplus-config.php'];
    $documentRoot = $_SERVER['DOCUMENT_ROOT'] ?? '';

    if ($documentRoot !== '') {
        $paths[] = rtrim($documentRoot, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . '..' . DIRECTORY_SEPARATOR . 'promoplus-config.php';
    }

    return array_values(array_unique($paths));
}

function pp_external_config(): array
{
    static $config = null;

    if ($config !== null) {
        return $config;
    }

    foreach (pp_config_paths() as $path) {
        if (is_file($path)) {
            $loaded = require $path;
            if (is_array($loaded)) {
                $config = $loaded;
                return $config;
            }
        }
    }

    $config = [];
    return $config;
}

function pp_external_config_path(): string
{
    foreach (pp_config_paths() as $path) {
        if (is_file($path)) {
            return $path;
        }
    }

    return '';
}

function pp_config_value(string $configKey, string $envKey, string $default = ''): string
{
    $config = pp_external_config();
    if (isset($config[$configKey]) && (string)$config[$configKey] !== '') {
        return (string)$config[$configKey];
    }

    return pp_env($envKey, $default);
}

function pp_config_source(string $configKey, string $envKey, string $default = ''): array
{
    $config = pp_external_config();
    if (isset($config[$configKey]) && (string)$config[$configKey] !== '') {
        return [
            'key' => $envKey,
            'config_key' => $configKey,
            'source' => 'promoplus-config.php',
            'path' => pp_external_config_path(),
            'value' => (string)$config[$configKey],
        ];
    }

    $value = getenv($envKey);
    if ($value !== false && $value !== '') {
        return [
            'key' => $envKey,
            'config_key' => $configKey,
            'source' => 'getenv',
            'path' => 'server environment',
            'value' => (string)$value,
        ];
    }

    if (isset($_ENV[$envKey]) && $_ENV[$envKey] !== '') {
        return [
            'key' => $envKey,
            'config_key' => $configKey,
            'source' => '$_ENV',
            'path' => 'server environment',
            'value' => (string)$_ENV[$envKey],
        ];
    }

    if (isset($_SERVER[$envKey]) && $_SERVER[$envKey] !== '') {
        return [
            'key' => $envKey,
            'config_key' => $configKey,
            'source' => '$_SERVER',
            'path' => 'server environment',
            'value' => (string)$_SERVER[$envKey],
        ];
    }

    $dotenv = pp_dotenv_entries();
    if (isset($dotenv[$envKey]) && (string)($dotenv[$envKey]['value'] ?? '') !== '') {
        return [
            'key' => $envKey,
            'config_key' => $configKey,
            'source' => '.env',
            'path' => (string)($dotenv[$envKey]['path'] ?? ''),
            'value' => (string)$dotenv[$envKey]['value'],
        ];
    }

    return [
        'key' => $envKey,
        'config_key' => $configKey,
        'source' => $default !== '' ? 'default' : 'missing',
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
        'config_paths' => array_map(static function (string $path): array {
            return [
                'path' => $path,
                'exists' => is_file($path),
                'readable' => is_readable($path),
            ];
        }, pp_config_paths()),
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

function pp_h(?string $value): string
{
    return htmlspecialchars((string)$value, ENT_QUOTES, 'UTF-8');
}
