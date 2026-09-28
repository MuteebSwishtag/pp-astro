<?php
declare(strict_types=1);

require_once dirname(__DIR__) . '/promoplus-server.php';

$isSecure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off');
session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/',
    'secure' => $isSecure,
    'httponly' => true,
    'samesite' => 'Lax',
]);
session_start();

$adminUser = pp_config_value('admin_user', 'PP_ADMIN_USER');
$adminPass = pp_config_value('admin_pass', 'PP_ADMIN_PASS');
$adminPassHash = pp_config_value('admin_pass_hash', 'PP_ADMIN_PASS_HASH');
$isConfigured = $adminUser !== '' && ($adminPass !== '' || $adminPassHash !== '');
$loginError = '';

if (isset($_GET['logout'])) {
    $_SESSION = [];
    session_destroy();
    header('Location: /admin/');
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $isConfigured) {
    $username = trim((string)($_POST['username'] ?? ''));
    $password = (string)($_POST['password'] ?? '');
    $passwordOk = $adminPassHash !== ''
        ? password_verify($password, $adminPassHash)
        : hash_equals($adminPass, $password);

    if (hash_equals($adminUser, $username) && $passwordOk) {
        session_regenerate_id(true);
        $_SESSION['promoplus_admin'] = true;
        header('Location: /admin/');
        exit;
    }

    $loginError = 'Those credentials did not match.';
}

$isAuthed = !empty($_SESSION['promoplus_admin']);
$rows = [];
$stats = ['total' => 0, 'new_count' => 0, 'latest' => null];
$adminError = '';
$query = trim((string)($_GET['q'] ?? ''));

if ($isAuthed) {
    try {
        $pdo = pp_pdo();
        pp_ensure_custom_plan_table($pdo);

        $stats = $pdo->query("
            SELECT
                COUNT(*) AS total,
                COALESCE(SUM(status = 'new'), 0) AS new_count,
                MAX(created_at) AS latest
            FROM custom_plan_requests
        ")->fetch() ?: $stats;

        $where = '';
        $params = [];
        if ($query !== '') {
            $where = "WHERE name LIKE :query OR email LIKE :query OR company LIKE :query OR needs LIKE :query";
            $params[':query'] = '%' . $query . '%';
        }

        $statement = $pdo->prepare("
            SELECT id, source_plan, name, email, company, phone, needs, status, ip_address, user_agent, created_at
            FROM custom_plan_requests
            {$where}
            ORDER BY created_at DESC, id DESC
            LIMIT 200
        ");
        $statement->execute($params);
        $rows = $statement->fetchAll();
    } catch (Throwable $error) {
        error_log('[PromoPlus admin] ' . $error->getMessage());
        $adminError = 'The admin page could not reach the submissions database.';
    }
}

function admin_date(?string $value): string
{
    if (!$value) {
        return 'None yet';
    }

    $time = strtotime($value);
    return $time ? date('M j, Y H:i', $time) : $value;
}
?>
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex,nofollow">
    <title>Custom Plan Requests | PromoPlus</title>
    <link rel="icon" type="image/svg+xml" href="/favicon.svg">
    <style>
        @font-face{font-family:"Plus Jakarta Sans";src:url("/assets/fonts/PlusJakartaSans-Variable.woff2") format("woff2");font-weight:200 800;font-style:normal;font-display:swap}
        :root{--ink:#211f24;--paper:#f7f6f2;--muted:#766b75;--line:rgba(32,32,36,.12);--primary:#765bd6;--primary-dark:#6248bf;--lavender:#d9d1ff;--lime:#e5f3bc;--peach:#ffd4c0;--white:#fff;--shadow:0 24px 70px rgba(32,32,36,.10)}
        *{box-sizing:border-box}
        body{margin:0;background:radial-gradient(circle at 10% 0,rgba(217,209,255,.42),transparent 28%),radial-gradient(circle at 90% 18%,rgba(255,212,192,.5),transparent 30%),var(--paper);color:var(--ink);font-family:"Plus Jakarta Sans",ui-sans-serif,system-ui,sans-serif}
        a{color:inherit;text-decoration:none}
        button,input{font:inherit}
        .admin-shell{width:min(1180px,calc(100% - 32px));margin:0 auto;padding:34px 0 48px}
        .admin-top{display:flex;align-items:center;justify-content:space-between;gap:18px;margin-bottom:38px}
        .brand{display:inline-flex;align-items:center;gap:10px;font-weight:800;letter-spacing:-.04em;font-size:22px}
        .brand span{display:grid;place-items:center;width:32px;height:32px;border-radius:10px;background:var(--ink);color:var(--lime)}
        .top-actions{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
        .ghost-link,.logout-link{border:1px solid var(--line);background:rgba(255,255,255,.62);border-radius:999px;padding:10px 14px;color:var(--muted);font-size:12px;font-weight:750}
        .logout-link{background:var(--ink);color:#fff;border-color:var(--ink)}
        .hero{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(280px,.65fr);gap:18px;align-items:stretch;margin-bottom:18px}
        .hero-main,.metric,.panel,.login-card{border:1px solid var(--line);background:rgba(255,255,255,.78);backdrop-filter:blur(18px);border-radius:22px;box-shadow:var(--shadow)}
        .hero-main{padding:34px}
        .eyebrow{margin:0 0 14px;color:var(--primary);font-size:11px;font-weight:800;letter-spacing:.12em;text-transform:uppercase}
        h1{max-width:720px;margin:0;font-size:clamp(38px,5vw,72px);line-height:.95;letter-spacing:-.06em;font-weight:760}
        .hero-main p:last-child{max-width:640px;margin:20px 0 0;color:var(--muted);font-size:15px;line-height:1.7}
        .metrics{display:grid;grid-template-columns:1fr;gap:12px}
        .metric{padding:22px}
        .metric small{display:block;color:var(--muted);font-size:11px;font-weight:750;text-transform:uppercase;letter-spacing:.08em}
        .metric strong{display:block;margin-top:8px;font-size:34px;letter-spacing:-.05em}
        .toolbar{display:flex;justify-content:space-between;align-items:center;gap:14px;margin:22px 0 14px}
        .search{display:flex;gap:8px;flex:1;max-width:520px}
        .search input{width:100%;border:1px solid var(--line);background:#fff;border-radius:12px;padding:13px 14px;color:var(--ink);outline:none}
        .search input:focus{border-color:var(--primary);box-shadow:0 0 0 3px rgba(118,91,214,.16)}
        .search button,.login-card button{border:0;border-radius:12px;background:var(--primary);color:#fff;font-weight:800;padding:13px 18px}
        .search a{align-self:center;color:var(--muted);font-size:12px;font-weight:750}
        .panel{overflow:hidden}
        .table-wrap{overflow:auto}
        table{width:100%;border-collapse:collapse;min-width:900px;background:#fff}
        th,td{padding:17px 18px;border-bottom:1px solid rgba(32,32,36,.08);text-align:left;vertical-align:top}
        th{background:#fbfaf7;color:#6d6670;font-size:11px;text-transform:uppercase;letter-spacing:.08em}
        td{font-size:13px;line-height:1.55}
        .person strong{display:block;font-size:14px}
        .person a{color:var(--primary-dark);font-weight:750}
        .needs{max-width:390px;white-space:pre-wrap;color:#4c474f}
        .muted{color:var(--muted)}
        .badge{display:inline-flex;align-items:center;border-radius:999px;background:var(--lime);color:var(--ink);padding:7px 10px;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.06em}
        .empty,.notice{padding:28px;color:var(--muted);text-align:center}
        .notice{border:1px solid rgba(167,53,64,.25);background:#fff0f1;color:#8b2430;border-radius:16px;text-align:left;margin-bottom:18px}
        .login-page{min-height:100vh;display:grid;place-items:center;padding:26px}
        .login-card{width:min(460px,100%);padding:30px}
        .login-card h1{font-size:42px;margin-top:10px}
        .login-card p{color:var(--muted);line-height:1.6}
        .field{display:grid;gap:8px;margin-top:16px}
        .field label{font-size:12px;font-weight:800;color:#37323a}
        .field input{width:100%;height:48px;border:1px solid var(--line);border-radius:12px;padding:0 13px;background:#fff}
        .field input:focus{outline:3px solid rgba(118,91,214,.18);border-color:var(--primary)}
        .login-card button{width:100%;margin-top:22px;height:50px}
        .error{margin:14px 0 0;color:#a73540;font-size:13px}
        .setup{border-color:rgba(167,53,64,.25);background:#fff0f1}
        @media(max-width:760px){.admin-shell{width:min(100% - 24px,1180px);padding-top:22px}.admin-top,.toolbar{align-items:flex-start;flex-direction:column}.hero{grid-template-columns:1fr}.hero-main{padding:26px}.search{max-width:none;width:100%;flex-wrap:wrap}.search button{flex:1}.metrics{grid-template-columns:1fr 1fr}.metric{padding:18px}.metric strong{font-size:28px}}
    </style>
</head>
<body>
<?php if (!$isAuthed): ?>
    <main class="login-page">
        <section class="login-card <?php echo !$isConfigured ? 'setup' : ''; ?>">
            <a class="brand" href="/"><span>+</span>PromoPlus</a>
            <p class="eyebrow">Admin</p>
            <h1>Custom plan requests</h1>
            <?php if (!$isConfigured): ?>
                <p>Set <strong>PP_ADMIN_USER</strong> and <strong>PP_ADMIN_PASS</strong> in the Hostinger environment before this page can be used.</p>
            <?php else: ?>
                <p>Sign in to view saved Custom Plan submissions.</p>
                <form method="post" action="/admin/">
                    <div class="field">
                        <label for="username">Name</label>
                        <input id="username" name="username" autocomplete="username" required>
                    </div>
                    <div class="field">
                        <label for="password">Password</label>
                        <input id="password" name="password" type="password" autocomplete="current-password" required>
                    </div>
                    <button type="submit">Open Admin</button>
                    <?php if ($loginError !== ''): ?><p class="error"><?php echo pp_h($loginError); ?></p><?php endif; ?>
                </form>
            <?php endif; ?>
        </section>
    </main>
<?php else: ?>
    <main class="admin-shell">
        <header class="admin-top">
            <a class="brand" href="/"><span>+</span>PromoPlus</a>
            <nav class="top-actions" aria-label="Admin actions">
                <a class="ghost-link" href="/pricing#custom-plan-form">View Form</a>
                <a class="logout-link" href="/admin/?logout=1">Log Out</a>
            </nav>
        </header>

        <section class="hero">
            <div class="hero-main">
                <p class="eyebrow">Custom Plan Admin</p>
                <h1>Sales requests, captured cleanly.</h1>
                <p>Review every Custom Plan submission from the pricing form. The latest 200 requests are shown, newest first.</p>
            </div>
            <div class="metrics">
                <article class="metric"><small>Total requests</small><strong><?php echo pp_h((string)($stats['total'] ?? 0)); ?></strong></article>
                <article class="metric"><small>New</small><strong><?php echo pp_h((string)($stats['new_count'] ?? 0)); ?></strong></article>
                <article class="metric"><small>Latest</small><strong style="font-size:18px;line-height:1.35"><?php echo pp_h(admin_date($stats['latest'] ?? null)); ?></strong></article>
            </div>
        </section>

        <?php if ($adminError !== ''): ?><div class="notice"><?php echo pp_h($adminError); ?></div><?php endif; ?>

        <section class="toolbar" aria-label="Submission tools">
            <form class="search" method="get" action="/admin/">
                <input name="q" value="<?php echo pp_h($query); ?>" placeholder="Search name, email, company, or needs">
                <button type="submit">Search</button>
                <?php if ($query !== ''): ?><a href="/admin/">Clear</a><?php endif; ?>
            </form>
        </section>

        <section class="panel" aria-labelledby="requests-title">
            <div class="table-wrap">
                <table>
                    <thead>
                        <tr>
                            <th scope="col">Request</th>
                            <th scope="col">Contact</th>
                            <th scope="col">Company</th>
                            <th scope="col">Needs</th>
                            <th scope="col">Submitted</th>
                            <th scope="col">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                    <?php foreach ($rows as $row): ?>
                        <tr>
                            <td>#<?php echo pp_h((string)$row['id']); ?><br><span class="muted"><?php echo pp_h($row['source_plan']); ?></span></td>
                            <td class="person">
                                <strong><?php echo pp_h($row['name']); ?></strong>
                                <a href="mailto:<?php echo pp_h($row['email']); ?>"><?php echo pp_h($row['email']); ?></a>
                                <?php if (!empty($row['phone'])): ?><br><span class="muted"><?php echo pp_h($row['phone']); ?></span><?php endif; ?>
                            </td>
                            <td><?php echo pp_h($row['company']); ?><br><span class="muted"><?php echo pp_h($row['ip_address']); ?></span></td>
                            <td class="needs"><?php echo pp_h($row['needs'] ?: 'Not provided'); ?></td>
                            <td><?php echo pp_h(admin_date($row['created_at'])); ?></td>
                            <td><span class="badge"><?php echo pp_h($row['status']); ?></span></td>
                        </tr>
                    <?php endforeach; ?>
                    </tbody>
                </table>
                <?php if ($rows === [] && $adminError === ''): ?>
                    <div class="empty">No custom plan submissions found<?php echo $query !== '' ? ' for this search' : ''; ?>.</div>
                <?php endif; ?>
            </div>
        </section>
    </main>
<?php endif; ?>
</body>
</html>
