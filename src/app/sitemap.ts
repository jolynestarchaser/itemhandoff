import { MetadataRoute } from 'next';
import { departments } from '@/lib/departments';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://itemhandoff.vercel.app';
  const currentDate = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/summary`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/pending-vehicles`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/summary/day18-only`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/summary/day15-only`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ];

  const departmentRoutes: MetadataRoute.Sitemap = departments.map((dept) => ({
    url: `${baseUrl}/department/${encodeURIComponent(dept.key)}`,
    lastModified: currentDate,
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  return [...staticRoutes, ...departmentRoutes];
}
