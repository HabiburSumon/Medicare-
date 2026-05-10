import { Metadata } from 'next';
import { generateMetadata as genMeta } from './metadata';

export { genMeta as generateMetadata };

export default function MedicineDetailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}