type Article = {
  slug: string;
  date?: string;
  modified?: string;
  image?: string;
};

export function articleSchema(post: Article, headline: string, description: string) {
  const home = 'https://promoplus.io/';
  const insights = `${home}insights/`;
  const url = `${insights}${post.slug}/`;
  const datePublished = post.date?.slice(0, 10);
  const dateModified = (post.modified || post.date)?.slice(0, 10);
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage', '@id': `${url}#webpage`, url,
        name: `${headline} | PromoPlus`, description, inLanguage: 'en-US',
        isPartOf: { '@id': `${home}#website` },
        publisher: { '@id': `${home}#organization` },
        breadcrumb: { '@id': `${url}#breadcrumb` },
      },
      {
        '@type': 'BreadcrumbList', '@id': `${url}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: home },
          { '@type': 'ListItem', position: 2, name: 'Insights', item: insights },
          { '@type': 'ListItem', position: 3, name: headline, item: url },
        ],
      },
      {
        '@type': 'BlogPosting', '@id': `${url}#article`, headline, description,
        ...(datePublished ? { datePublished } : {}),
        ...(dateModified ? { dateModified } : {}),
        ...(post.image ? { image: new URL(post.image, home).href } : {}),
        author: { '@id': `${home}#organization` },
        publisher: { '@id': `${home}#organization` },
        isPartOf: { '@id': `${home}#website` },
        mainEntityOfPage: { '@id': `${url}#webpage` },
        inLanguage: 'en-US',
      },
    ],
  };
}
