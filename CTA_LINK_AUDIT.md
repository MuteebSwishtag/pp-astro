# PromoPlus CTA and Link Audit

Generated from the Astro source and static public files in this repo.

## Scope

Audited routes:

| Page | Source |
| --- | --- |
| `/` | `src/pages/index.astro` |
| `/features/` | `src/pages/features/index.astro` |
| `/features/product-catalog-integration` | `src/pages/features/product-catalog-integration.astro` |
| `/features/online-mockup-designer` | `src/pages/features/online-mockup-designer.astro` |
| `/features/artwork-version-control` | `src/pages/features/artwork-version-control.astro` |
| `/features/customer-approval-portal` | `src/pages/features/customer-approval-portal.astro` |
| `/features/centralized-project-workspace` | `src/pages/features/centralized-project-workspace.astro` |
| `/features/team-collaboration` | `src/pages/features/team-collaboration.astro` |
| `/features/workflow-progress-dashboard` | `src/pages/features/workflow-progress-dashboard.astro` |
| `/features/production-ready-file-generation` | `src/pages/features/production-ready-file-generation.astro` |
| `/industries/` | `src/pages/industries/index.astro` |
| `/industries/promotional-products-distributor-software` | `src/pages/industries/promotional-products-distributor-software.astro` |
| `/industries/promotional-products-supplier-software` | `src/pages/industries/promotional-products-supplier-software.astro` |
| `/industries/promotional-products-decorator-software` | `src/pages/industries/promotional-products-decorator-software.astro` |
| `/insights/` | `src/pages/insights/index.astro` |
| `/insights/[slug]/` | `src/pages/insights/[slug].astro` |
| `/pricing` | `src/pages/pricing.astro` |
| `/contact` | `src/pages/contact.astro` |
| `/login` | `src/pages/login.astro` |
| `/signup` | `src/pages/signup.astro` |
| `/post` | `src/pages/post.astro` |
| `/hello-world/` | `src/pages/hello-world/index.astro` |
| `/how-promotional-product-mockup-software-speeds-up-client-approvals/` | `src/pages/how-promotional-product-mockup-software-speeds-up-client-approvals/index.astro` |
| `/post.html` | `public/post.html` |

## Global Header Links

These appear on pages that render `src/components/Header.astro`: home, feature pages, industry pages, insights pages, pricing, contact, `/post`, and the two legacy article routes. They do not appear on `/login`, `/signup`, or `public/post.html`.

| Button or Link Text | Redirects To | Notes |
| --- | --- | --- |
| PromoPlus logo | `/` | Home link |
| Features | `/features/` | Main nav link |
| Choose Product | `/features/product-catalog-integration` | Features dropdown |
| Create Mockup | `/features/online-mockup-designer` | Features dropdown |
| Revise Artwork | `/features/artwork-version-control` | Features dropdown |
| Approve Design | `/features/customer-approval-portal` | Features dropdown |
| Organize Project | `/features/centralized-project-workspace` | Features dropdown |
| Collaborate | `/features/team-collaboration` | Features dropdown |
| Monitor Progress | `/features/workflow-progress-dashboard` | Features dropdown |
| Produce Files | `/features/production-ready-file-generation` | Features dropdown |
| Industries | `/industries/` | Main nav link |
| For Distributors | `/industries/promotional-products-distributor-software` | Industries dropdown |
| For Suppliers | `/industries/promotional-products-supplier-software` | Industries dropdown |
| For Decorators | `/industries/promotional-products-decorator-software` | Industries dropdown |
| Insights | `/insights/` | Main nav link |
| Pricing | `/pricing` | Main nav link |
| Contact | `/contact` | Main nav link |
| Login | `https://app.promoplus.io/login` | Desktop and mobile auth link |
| Sign Up | `https://app.promoplus.io/signup` | Desktop and mobile auth link |
| Menu | No redirect | Mobile menu toggle button |

## Global Footer Links

| Pages | Button or Link Text | Redirects To |
| --- | --- | --- |
| Pages using `Footer` with default props | Back to top | `#top` |
| Feature, industry, insights, and article pages using `top="#main-content"` | Back to top | `#main-content` |

## Home Page CTAs

Page: `/`

| Button or Link Text | Redirects To | Source |
| --- | --- | --- |
| Try it Free | `https://app.promoplus.io` | Hero CTA |
| Download production PDF | `/assets/promoplus/sample-production-proof.pdf` | Workflow story download, initially hidden |
| Download the original two-page PDF | `/assets/promoplus/sample-production-proof.pdf` | Production proof section |
| Start 30-Day Free Trial | `https://app.promoplus.io/signup` | Pricing block |
| Choose Pro | `https://app.promoplus.io/signup` | Pricing block |
| Talk to Sales | `/contact` | Pricing block |
| Talk to Our Team | `/contact` | Contextual production handoff CTA |
| Talk to Sales | `/contact` | Final CTA |
| Explore Features | `/features` | Final CTA |
| Talk to Sales | `/contact` | Mobile quick CTA from `ChromeEffects` |

UI-only buttons on this page include workflow tabs, previous/next story controls, and testimonial controls. Those do not redirect.

## Features Overview Page CTAs

Page: `/features/`

| Button or Link Text | Redirects To |
| --- | --- |
| Talk to Sales | `/contact` |
| Product Catalog / Choose Product | `/features/product-catalog-integration` |
| Mockup Designer / Create Mockup | `/features/online-mockup-designer` |
| Version Control / Revise Artwork | `/features/artwork-version-control` |
| Approval Portal / Approve Design | `/features/customer-approval-portal` |
| Project Workspace / Organize Project | `/features/centralized-project-workspace` |
| Team Collaboration / Collaborate | `/features/team-collaboration` |
| Workflow Dashboard / Monitor Progress | `/features/workflow-progress-dashboard` |
| Production Files / Produce Files | `/features/production-ready-file-generation` |
| Talk to Sales | `/contact` |
| View Pricing | `/pricing` |

## Feature Detail Page CTAs

All feature detail pages use `FeatureWorkflowPage`. The connected workflow buttons push browser history to the related feature route.

| Workflow Button | Redirects To |
| --- | --- |
| Choose | `/features/product-catalog-integration` |
| Create | `/features/online-mockup-designer` |
| Revise | `/features/artwork-version-control` |
| Approve | `/features/customer-approval-portal` |
| Organize | `/features/centralized-project-workspace` |
| Collaborate | `/features/team-collaboration` |
| Monitor | `/features/workflow-progress-dashboard` |
| Produce | `/features/production-ready-file-generation` |
| Previous feature arrow | Previous feature route in the workflow |
| Next feature arrow | Next feature route in the workflow |

### `/features/product-catalog-integration`

| Button or Link Text | Redirects To |
| --- | --- |
| Talk to Sales | `/contact` |
| Continue with Online Mockup Designer | `/features/online-mockup-designer` |
| Keep the record in Centralized Project Workspace | `/features/centralized-project-workspace` |
| Talk to Sales | `/contact` |

UI-only buttons: Drinkware, Apparel, Bags.

### `/features/online-mockup-designer`

| Button or Link Text | Redirects To |
| --- | --- |
| Talk to Sales | `/contact` |
| Continue with Artwork Version Control | `/features/artwork-version-control` |
| Send it through Customer Approval Portal | `/features/customer-approval-portal` |
| Talk to Sales | `/contact` |

UI-only buttons: Front, Back, Sleeve, Generate Mockup.

### `/features/artwork-version-control`

| Button or Link Text | Redirects To |
| --- | --- |
| Talk to Sales | `/contact` |
| Create each revision in Online Mockup Designer | `/features/online-mockup-designer` |
| Move the final version to Customer Approval Portal | `/features/customer-approval-portal` |
| Talk to Sales | `/contact` |

UI-only button/card: Approved version / Locked record.

### `/features/customer-approval-portal`

| Button or Link Text | Redirects To |
| --- | --- |
| Talk to Sales | `/contact` |
| Review the right revision with Artwork Version Control | `/features/artwork-version-control` |
| Send the approved design to Production Ready Files | `/features/production-ready-file-generation` |
| Talk to Sales | `/contact` |

UI-only buttons: numbered review pins, Request revision, Approve design.

### `/features/centralized-project-workspace`

| Button or Link Text | Redirects To |
| --- | --- |
| Talk to Sales | `/contact` |
| Next step / Team Collaboration | `/features/team-collaboration` |
| Connected visibility / Workflow Progress Dashboard | `/features/workflow-progress-dashboard` |
| Talk to Sales | `/contact` |

UI-only buttons: Products, Artwork, Customer information, Approvals, Notes, Production files, Project history.

### `/features/team-collaboration`

| Button or Link Text | Redirects To |
| --- | --- |
| Talk to Sales | `/contact` |
| Shared foundation / Centralized Project Workspace | `/features/centralized-project-workspace` |
| Shared visibility / Workflow Progress Dashboard | `/features/workflow-progress-dashboard` |
| Talk to Sales | `/contact` |
| View Workflow | `/#pp-hero` |

UI-only buttons: Sales, Design, Operations, Owner.

### `/features/workflow-progress-dashboard`

| Button or Link Text | Redirects To |
| --- | --- |
| Talk to Sales | `/contact` |
| Organize first / Centralized Project Workspace | `/features/centralized-project-workspace` |
| Move together / Team Collaboration | `/features/team-collaboration` |
| Talk to Sales | `/contact` |
| View Workflow | `/#pp-hero` |

UI-only buttons: All, Artwork, Approval, Revisions, Production.

### `/features/production-ready-file-generation`

| Button or Link Text | Redirects To |
| --- | --- |
| Start with approval | `/features/customer-approval-portal` |
| Previous feature / Customer Approval Portal | `/features/customer-approval-portal` |
| Connected feature / Artwork Version Control | `/features/artwork-version-control` |
| Talk to Sales | `/contact` |
| View the workflow | `/#pp-hero` |

## Industries Overview Page CTAs

Page: `/industries/`

| Button or Link Text | Redirects To |
| --- | --- |
| Talk to Sales | `/contact` |
| Explore distributor software | `/industries/promotional-products-distributor-software` |
| Explore supplier software | `/industries/promotional-products-supplier-software` |
| Explore decorator software | `/industries/promotional-products-decorator-software` |
| Talk to Sales | `/contact` |
| Explore Features | `/features` |

## Industry Detail Page CTAs

All three industry detail pages also include the shared pricing plan CTAs:

| Button or Link Text | Redirects To |
| --- | --- |
| Start 30-Day Free Trial | `https://app.promoplus.io/signup` |
| Choose Pro | `https://app.promoplus.io/signup` |
| Talk to Sales | `/contact` |

### `/industries/promotional-products-distributor-software`

| Button or Link Text | Redirects To |
| --- | --- |
| Start 30-Day Free Trial | `https://app.promoplus.io/signup` |
| Talk to Sales | `/contact` |
| Download the original two-page PDF | `/assets/promoplus/sample-production-proof.pdf` |
| Start 30-Day Free Trial | `https://app.promoplus.io/signup` |
| Talk to Sales | `/contact` |

### `/industries/promotional-products-supplier-software`

| Button or Link Text | Redirects To |
| --- | --- |
| Start 30-Day Free Trial | `https://app.promoplus.io/signup` |
| Talk to Sales | `mailto:hello@swishtag.com?subject=PromoPlus%20for%20suppliers` |
| Download the original two-page PDF | `/assets/promoplus/sample-production-proof.pdf` |
| Start 30-Day Free Trial | `https://app.promoplus.io/signup` |
| Talk to Sales | `mailto:hello@swishtag.com?subject=PromoPlus%20for%20suppliers` |

### `/industries/promotional-products-decorator-software`

| Button or Link Text | Redirects To |
| --- | --- |
| Start 30-Day Free Trial | `https://app.promoplus.io/signup` |
| Download a Sample Proof | `/assets/promoplus/sample-production-proof.pdf` |
| Download the original two-page PDF | `/assets/promoplus/sample-production-proof.pdf` |
| Start 30-Day Free Trial | `https://app.promoplus.io/signup` |
| Download a Sample Proof | `/assets/promoplus/sample-production-proof.pdf` |

## Pricing Page CTAs

Page: `/pricing`

| Button or Link Text | Redirects To |
| --- | --- |
| Start 30-Day Free Trial | `https://app.promoplus.io/signup` |
| Choose Pro | `https://app.promoplus.io/signup` |
| Talk to Sales | `/contact` |

## Contact Page CTAs

Page: `/contact`

| Button or Link Text | Redirects To |
| --- | --- |
| Send Message | Submits form data to `/contact.php` with JavaScript `fetch` |

The contact form does not navigate after submission in the current frontend. It shows an in-page success state.

## Insights Page CTAs

Page: `/insights/`

| Button or Link Text | Redirects To |
| --- | --- |
| Read insight / From Artwork to Production: A Better Promotional Product Proofing Workflow | `/insights/from-artwork-to-production-a-better-promotional-product-proofing-workflow/` |
| Read insight / How Promotional Product Mockup Software Speeds Up Client Approvals | `/insights/how-promotional-product-mockup-software-speeds-up-client-approvals/` |
| Request Custom Plan | `/contact` |

`public/features/insights.js` can render additional dynamic story cards from the WordPress API. Those cards link to `/insights/{slug}/`.

## Insight Article Page CTAs

Pages generated from `src/pages/insights/[slug].astro` and local fallback posts:

| Page | Button or Link Text | Redirects To |
| --- | --- | --- |
| `/insights/from-artwork-to-production-a-better-promotional-product-proofing-workflow/` | Back to insights | `/insights/` |
| `/insights/how-promotional-product-mockup-software-speeds-up-client-approvals/` | Back to insights | `/insights/` |
| `/insights/what-is-an-artwork-proof-in-promotional-products/` | Back to insights | `/insights/` |
| Any local insight article | Related post card / Read insight | `/insights/{related-slug}/` |

The `[slug]` page can also fetch WordPress posts at build time. If extra WordPress posts are returned, their article CTAs follow the same `/insights/{slug}/` pattern.

## Legacy Article and Redirect Pages

| Page | Button or Link Text | Redirects To | Notes |
| --- | --- | --- | --- |
| `/post` | Back to insights | `/insights/` | Generic Astro post page |
| `/post` | Related post card / Read insight | `/insights/{related-slug}/` | Rendered from local post data or `blog-post.js` |
| `/hello-world/` | Back to insights | `/features` | Text says "Back to insights", but href points to `/features` |
| `/how-promotional-product-mockup-software-speeds-up-client-approvals/` | Back to insights | `/features` | Text says "Back to insights", but href points to `/features` |
| `/post.html` | Automatic redirect | `/insights/{slug}/` if `?slug=` exists, otherwise `/insights/` | Implemented with `window.location.replace` |
| `/post.html` | PromoPlus insights | `/insights/` | Fallback body link |

## Auth Page CTAs

### `/login`

| Button or Link Text | Redirects To |
| --- | --- |
| PromoPlus brand | `/` |
| Sign up | `/signup` |

UI-only buttons: Continue with Google, Continue with Apple, Continue with Facebook, Show, Forgot password?, Log in. `public/auth.js` prevents the form submit and displays an in-page status message, so these do not redirect.

### `/signup`

| Button or Link Text | Redirects To |
| --- | --- |
| PromoPlus brand | `/` |
| Log in | `/login` |

UI-only buttons: Continue with Google, Continue with Apple, Continue with Facebook, Show, Create account. `public/auth.js` prevents the form submit and displays an in-page status message, so these do not redirect.

## Redirect or Link Issues Worth Reviewing

| Location | Issue |
| --- | --- |
| `/hello-world/` and `/how-promotional-product-mockup-software-speeds-up-client-approvals/` | The visible text says "Back to insights", but the href is `/features`. If intentional, the label should change. If not, the href should be `/insights/`. |
| Header auth links vs local auth pages | Header Login and Sign Up point to `https://app.promoplus.io/login` and `https://app.promoplus.io/signup`, while local `/login` and `/signup` pages also exist. Confirm which experience should be used. |
| Home hero | "Try it Free" goes to `https://app.promoplus.io`, while other trial CTAs go to `https://app.promoplus.io/signup`. Confirm whether the hero should go directly to signup. |

