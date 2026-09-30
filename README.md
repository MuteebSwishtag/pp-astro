# PromoPlus Astro

Astro rebuild of PromoPlus combining the human-v2 navbar, home page, and pricing page with the production PromoPlus feature pages, Insights feed, assets, and demo form endpoint.

## Commands

- `npm run dev` - local Astro dev server
- `npm run build` - production build
- `npm run preview` - preview built output

The PHP demo endpoint is preserved in `public/book-demo.php`. It requires a PHP-capable production host; Astro's dev server serves it as a static file.

## Hostinger Custom Plan Submissions

Custom Plan form submissions are handled by `public/custom_sales.php`, saved to MySQL, and then sent by email when mail is configured. The admin view is available at `/admin/`.

Create a real `.env` file one level above `public_html` before using the form:

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

The PHP endpoints intentionally read these values only from `.env` files, not Hostinger runtime environment variables or `promoplus-config.php`. Do not upload `.env` into `public_html`.
