import pageSchema from './pageSchema.json';
import shared from './sharedSchema.json';
import { homeFaqs } from './homeFaqs';

type SchemaNode = Record<string, any>;
type SchemaGraph = { '@context': string; '@graph': SchemaNode[] };

// Page content stays in the registry; company and product facts have one source.
export function getPageSchema(pathname: string): SchemaGraph | undefined {
  const path = pathname.replace(/\/$/, '') || '/';
  const source = (pageSchema as Record<string, SchemaGraph>)[path];
  if (!source) return undefined;
  const nodes = source['@graph'].map((node): SchemaNode => {
    if (node['@type'] === 'SoftwareApplication' &&
        (!node['@id'] || node['@id'] === shared.SoftwareApplication['@id'])) return shared.SoftwareApplication;
    if (path === '/' && node['@type'] === 'Organization') return shared.Organization;
    if (path === '/' && node['@type'] === 'WebSite') return shared.WebSite;
    return node;
  });
  if (path === '/') {
    const faq = {
      '@type': 'FAQPage',
      '@id': 'https://promoplus.io/#faq',
      mainEntity: homeFaqs.map(([name, text]) => ({
        '@type': 'Question', name,
        acceptedAnswer: { '@type': 'Answer', text },
      })),
    };
    const faqIndex = nodes.findIndex((node) => node['@type'] === 'FAQPage');
    if (faqIndex >= 0) nodes[faqIndex] = faq;
    else nodes.push(faq);
  }
  return { '@context': 'https://schema.org', '@graph': nodes };
}
