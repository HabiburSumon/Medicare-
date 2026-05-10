import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Find & Book Doctors Online',
  description: 'Browse expert doctors by specialty. Book online appointments with top cardiologists, dermatologists, pediatricians, and more. Video consultation available.',
  keywords: ['find doctor', 'book appointment', 'online doctor', 'doctor near me', 'specialist doctor', 'Dhaka doctor'],
  openGraph: {
    title: 'Find & Book Doctors Online | MediCare+',
    description: 'Browse expert doctors by specialty. Book appointments with top-rated physicians.',
    url: 'https://medicare-plus.com/doctors',
  },
  alternates: { canonical: 'https://medicare-plus.com/doctors' },
};

export default function DoctorsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}