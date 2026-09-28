# PromoPlus Astro

Astro rebuild of PromoPlus combining the human-v2 navbar, home page, and pricing page with the production PromoPlus feature pages, Insights feed, assets, and demo form endpoint.

## Commands

- `npm run dev` - local Astro dev server
- `npm run build` - production build
- `npm run preview` - preview built output

The PHP demo endpoint is preserved in `public/book-demo.php`. It requires a PHP-capable production host; Astro's dev server serves it as a static file.

## Hostinger Custom Plan Submissions

Custom Plan form submissions are handled by `public/custom_sales.php`, saved to MySQL, and then sent by email when mail is configured. The admin view is available at `/admin/`.

Set these environment variables on Hostinger before using the form:

```txt
PP_DB_HOST=127.0.0.1
PP_DB_PORT=3306
PP_DB_NAME=your_database_name
PP_DB_USER=your_database_user
PP_DB_PASS=your_database_password
PP_ADMIN_USER=your_admin_name
PP_ADMIN_PASS=your_admin_password
```

The table `custom_plan_requests` is created automatically on the first valid submission or first admin load.

If your Hostinger plan does not expose environment variables to PHP, create a real `.env` file one level above `public_html` using `.env.example` as the template. Do not upload `.env` into `public_html`.

As an alternative, create `promoplus-config.php` one level above `public_html` with the same values as an array:

```php
<?php
return [
    'db_host' => '127.0.0.1',
    'db_port' => '3306',
    'db_name' => 'your_database_name',
    'db_user' => 'your_database_user',
    'db_pass' => 'your_database_password',
    'admin_user' => 'your_admin_name',
    'admin_pass' => 'your_admin_password',
];
```
