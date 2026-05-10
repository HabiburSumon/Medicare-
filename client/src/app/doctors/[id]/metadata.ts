import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
  try {
    const res = await fetch(`${API}/doctors/${params.id}`, { next: { revalidate: 3600 } });
    const data = await res.json();
    const doc = data.data;
    if (!doc) return { title: 'Doctor Not Found' };
    return {
      title: `Dr. ${doc.user?.name || 'Doctor'} - ${doc.specialization}`,
      description: `Book appointment with Dr. ${doc.user?.name}, ${doc.specialization} with ${doc.experience} years experience. ${doc.qualification}. Consultation fee ৳${doc.consultationFee}.`,
      openGraph: {
        title: `Dr. ${doc.user?.name} - ${doc.specialization} | MediCare+`,
        description: `${doc.experience} years experience. Consultation ৳${doc.consultationFee}.`,
        url: `https://medicare-plus.com/doctors/${params.id}`,
      },
      alternates: { canonical: `https://medicare-plus.com/doctors/${params.id}` },
    };
  } catch {
    return { title: 'Doctor Profile' };
  }
}