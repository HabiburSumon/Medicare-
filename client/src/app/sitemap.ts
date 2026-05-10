import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://medicare-plus.com';
  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/doctors`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/medicines`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/symptom-checker`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${baseUrl}/register`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
  ];

  // Dynamic doctor pages
  let doctorPages: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${API}/doctors?limit=100`, { next: { revalidate: 3600 } });
    const data = await res.json();
    const doctors = data.data || [];
    doctorPages = doctors.map((doc: any) => ({
      url: `${baseUrl}/doctors/${doc._id}`,
      lastModified: new Date(doc.updatedAt || doc.createdAt || Date.now()),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
  } catch {}

  // Dynamic medicine pages
  let medicinePages: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${API}/medicines?limit=200`, { next: { revalidate: 3600 } });
    const data = await res.json();
    const medicines = data.data || [];
    medicinePages = medicines.map((med: any) => ({
      url: `${baseUrl}/medicines/${med._id}`,
      lastModified: new Date(med.updatedAt || med.createdAt || Date.now()),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
  } catch {}

  return [...staticPages, ...doctorPages, ...medicinePages];
}