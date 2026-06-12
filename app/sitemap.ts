import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://depgraph.vedanshh.dev';

  const routes = [
    '',
    '/pricing',
    '/about',
    '/changelog',
    '/docs',
    '/faq',
    '/features',
    '/privacy',
    '/refund',
    '/support',
    '/terms',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'weekly' : 'monthly',
    priority: route === '' ? 1 : 0.8,
  }));
}
