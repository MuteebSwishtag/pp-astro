# Editing and verifying structured data

## Shared facts

Edit `src/data/sharedSchema.json` for company information, social profiles,
software description, image, features, and pricing range. `src/data/schema.ts`
uses these definitions when rendering the homepage and any software node with
the homepage software ID. Page-specific software IDs keep their own complete
definitions: pricing has plan-level monthly offers, and industry pages have
their own audience, description, image, and price range.

Organization and WebSite are fully defined on the homepage. Other pages link
to their stable IDs: `https://promoplus.io/#organization` and
`https://promoplus.io/#website`. The existing contact page keeps its additional
Organization contact information.

Homepage FAQ questions and answers come from `src/data/homeFaqs.ts`, which
also renders the visible FAQs. Update this file once to change both.
The homepage emits exactly the four entities in `schema-home.txt`:
Organization, WebSite, SoftwareApplication, and FAQPage. Its canonical and
metadata are still rendered by BaseLayout without requiring a WebPage entity.

## Import the authoritative briefs

The eight `schema-*.txt` files in `.tmp` are the source of truth for their URLs.
Run `npm run import:schema -- .tmp` after updating them, then build and verify.
The importer replaces those page graphs and updates shared homepage facts and
homepage FAQ content. Pages without a new brief retain their existing graphs.
Use this importer instead of the legacy `scripts/import-schema.mjs`, which
imports the superseded all-pages document.

Pricing FAQ content is preserved in `src/data/pricingFaqs.json`; its new brief
does not include FAQPage markup. Industry visible FAQ answers are rendered
directly from the imported page graph to prevent conflicting copies.

## Add or update another page

1. Add an entry in `src/data/pageSchema.json` keyed by its path without a trailing
   slash, for example `/features/new-feature`. Copy a similar existing page entry.
2. Change its WebPage name, description, URL, and all page-specific IDs,
   breadcrumb items, and FAQ text. Keep company and website IDs pointing home.
3. Use `BaseLayout` for the page. It automatically looks up the route and renders
   its schema, canonical URL, title, and description. No script needs pasting.
4. For shared software, add `{ "@type": "SoftwareApplication" }` to `@graph`;
   the resolver expands it from the shared file. For a page-specific software
   definition, provide its full node with a unique `<page URL>#software` ID.
5. Keep FAQ schema consistent with visible answers. Feature and industry FAQs
   read from the registry. For homepage FAQs, use `homeFaqs.ts`.

Articles use `src/data/articleSchema.ts` and the existing article template,
which generates WebPage, BreadcrumbList, and BlogPosting from article data.

## Verify locally and after deployment

Run:

```sh
npm run build
npm run verify:schema
npm run check
```

The schema check compares generated graphs with the authoritative `.tmp`
briefs when present, parses built JSON-LD, compares shared definitions, rejects
duplicate entity IDs, checks homepage entity coverage, and checks existing
FAQ text, canonical URLs, and article metadata. Newly registered pages are
automatically included; extend the FAQ policy in the script for new page types.

After deploying, test each changed live URL at https://validator.schema.org/.
Expand WebPage: the validator may display linked entities nested even though
they are siblings in the source graph. On the homepage, verify parentOrganization,
address, contactPoint, six sameAs links, software image, eight featureList entries,
and AggregateOffer (lowPrice 30, highPrice 100, offerCount 2).
Use View Source and search for `application/ld+json` to inspect the actual graph.
Also test https://search.google.com/test/rich-results for Google-supported
features; its results are not a complete inventory of Schema.org entities.

Local changes do not update the live site until deployed.
