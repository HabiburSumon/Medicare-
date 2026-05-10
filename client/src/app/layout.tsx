import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#2563EB',
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://medicare-plus.com'),
  title: {
    default: 'MediCare+ | Telemedicine, Doctor Appointments & Online Medicine Delivery',
    template: '%s | MediCare+',
  },
  description: 'Book online doctor appointments, consult via video call, get digital prescriptions, and order medicines online. Trusted by 50,000+ patients across Bangladesh. Available 24/7.',
  keywords: [
    'telemedicine', 'doctor appointment', 'online consultation', 'video consultation',
    'medicine delivery', 'digital prescription', 'healthcare', 'online doctor',
    'book doctor', 'medical consultation', 'Bangladesh healthcare', 'Dhaka doctor',
    'online pharmacy', 'symptom checker', 'health platform', 'MediCare',
  ],
  authors: [{ name: 'MediCare+', url: 'https://medicare-plus.com' }],
  creator: 'MediCare+',
  publisher: 'MediCare+',
  formatDetection: { telephone: true, email: true, address: true },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://medicare-plus.com',
    siteName: 'MediCare+',
    title: 'MediCare+ | Telemedicine, Doctor Appointments & Online Medicine',
    description: 'Book online doctor appointments, consult via video call, get digital prescriptions, and order medicines online.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'MediCare+ - Your Health, Our Priority' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MediCare+ | Telemedicine & Doctor Appointments',
    description: 'Book online doctor appointments, consult via video call, get prescriptions, and order medicines.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  alternates: { canonical: 'https://medicare-plus.com' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MedicalBusiness',
    name: 'MediCare+',
    description: 'Online telemedicine platform for doctor appointments, video consultations, prescriptions, and medicine delivery.',
    url: 'https://medicare-plus.com',
    logo: 'https://medicare-plus.com/logo.png',
    telephone: '+8801234567890',
    email: 'support@medicare-plus.com',
    address: { '@type': 'PostalAddress', addressLocality: 'Dhaka', addressCountry: 'BD' },
    sameAs: [],
    priceRange: '৳৳',
    aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.8', reviewCount: '50000', bestRating: '5' },
  };

  return (
    <html lang="en">
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body>
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
