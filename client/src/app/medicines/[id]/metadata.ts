import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
  try {
    const res = await fetch(`${API}/medicines/${params.id}`, { next: { revalidate: 3600 } });
    const data = await res.json();
    const med = data.data;
    if (!med) return { title: 'Medicine Not Found' };
    const price = med.discount ? med.price * (1 - med.discount / 100) : med.price;
    return {
      title: `${med.name} - ${med.category}`,
      description: `Buy ${med.name} (${med.genericName}) online. ${med.dosageForm}, ${med.strength || ''}. Price ৳${price.toFixed(0)}. ${med.manufacturer}. Fast delivery.`,
      openGraph: {
        title: `${med.name} | MediCare+ Pharmacy`,
        description: `${med.genericName} - ৳${price.toFixed(0)}. Order online with fast delivery.`,
        url: `https://medicare-plus.com/medicines/${params.id}`,
      },
      alternates: { canonical: `https://medicare-plus.com/medicines/${params.id}` },
    };
  } catch {
    return { title: 'Medicine Details' };
  }
}