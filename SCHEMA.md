# Editing and verifying structured data

## Shared facts

Edit `src/data/sharedSchema.json` for company information, social profiles,
software description, image, features, and pricing range. `src/data/schema.ts`
uses these definitions when rendering the homepage, and the shared software
definition wherever an existing page graph includes SoftwareApplication
(the feature pages and pricing page). Shared definitions override the older
copies in `pageSchema.json`, including after running the legacy importer.

Organization and WebSite are fully defined on the homepage. Other pages link
to their stable IDs: `https://promoplus.io/#organization` and
`https://promoplus.io/#website`. The existing contact page keeps its additional
Organization contact information.

Homepage FAQ questions and answers come from `src/data/homeFaqs.ts`, which
also renders the visible FAQs. Update this file once to change both.
The homepage emits one JSON-LD graph with six sibling entities, preserving
WebPage and BreadcrumbList alongside the four types in the new brief.

## Add or update another page

1. Add an entry in `src/data/pageSchema.json` keyed by its path without a trailing
   slash, for example `/features/new-feature`. Copy a similar existing page entry.
2. Change its WebPage name, description, URL, and all page-specific IDs,
   breadcrumb items, and FAQ text. Keep company and website IDs pointing home.
3. Use `BaseLayout` for the page. It automatically looks up the route and renders
   its schema, canonical URL, title, and description. No script needs pasting.
4. If a software definition is needed, add `{ "@type": "SoftwareApplication" }`
   to the page's `@graph`; the resolver expands it from the shared file.
5. Keep FAQ schema consistent with visible answers. Feature and pricing FAQs
   already read from the registry. For homepage FAQs, use `homeFaqs.ts`.

Articles use `src/data/articleSchema.ts` and the existing article template,
which generates WebPage, BreadcrumbList, and BlogPosting from article data.

## Verify locally and after deployment

Run:

```sh
npm run build
npm run verify:schema
npm run check
```

The schema check parses built JSON-LD, compares shared definitions, rejects
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
