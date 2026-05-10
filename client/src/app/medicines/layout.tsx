import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Order Medicines Online',
  description: 'Order genuine medicines online with fast delivery. Browse pain relief, antibiotics, vitamins, diabetes care & more. Up to 25% off. Free delivery over ৳500.',
  keywords: ['online pharmacy', 'medicine delivery', 'buy medicines online', 'order medicine', 'Dhaka pharmacy'],
  openGraph: {
    title: 'Order Medicines Online | MediCare+',
    description: 'Genuine medicines delivered to your doorstep. Up to 25% off. Free delivery over ৳500.',
    url: 'https://medicare-plus.com/medicines',
  },
  alternates: { canonical: 'https://medicare-plus.com/medicines' },
};

export default function MedicinesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}