import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/admin', '/dashboard', '/profile', '/chat', '/notifications', '/prescriptions'] },
    ],
    sitemap: 'https://medicare-plus.com/sitemap.xml',
  };
}