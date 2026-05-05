'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface Medicine {
  _id: string;
  name: string;
  genericName: string;
  category: string;
  manufacturer: string;
  price: number;
  discount?: number;
  description: string;
  image?: string;
  images?: string[];
  inStock: boolean;
  requiresPrescription: boolean;
  dosageForm: string;
  strength: string;
  packSize?: string;
  sideEffects?: string;
  warnings?: string;
  dosageInstructions?: string;
  storageInstructions?: string;
  indications?: string;
  rating?: number;
  numReviews?: number;
  soldCount?: number;
}

interface RelatedMedicine {
  _id: string;
  name: string;
  genericName: string;
  category: string;
  price: number;
  manufacturer: string;
  image?: string;
  inStock: boolean;
  requiresPrescription: boolean;
  dosageForm: string;
  strength: string;
  discount?: number;
  rating?: number;
}

const defaultImages = [
  'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400&h=400&fit=crop',
];

export default function MedicineDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [medicine, setMedicine] = useState<Medicine | null>(null);
  const [related, setRelated] = useState<RelatedMedicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('overview');
  const [activeImage, setActiveImage] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    if (id) fetchMedicine();
  }, [id]);

  const fetchMedicine = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/medicines/${id}`);
      const med = res.data.data;
      setMedicine(med);
      // Fetch related medicines from same category
      if (med.category) {
        try {
          const relRes = await api.get('/medicines', { params: { category: med.category, limit: 8 } });
          const relData = (relRes.data.data || []).filter((m: any) => m._id !== med._id).slice(0, 6);
          setRelated(relData);
        } catch {}
      }
    } catch {
      setMedicine(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading medicine details...</p>
        </div>
      </div>
    );
  }

  if (!medicine) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl block mb-4">💊</span>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Medicine Not Found</h2>
          <p className="text-gray-500 mb-6">The medicine you're looking for doesn't exist or has been removed.</p>
          <Link href="/medicines" className="btn-primary">Browse All Medicines</Link>
        </div>
      </div>
    );
  }

  const medImages = medicine.images && medicine.images.length > 0
    ? medicine.images
    : medicine.image
      ? [medicine.image]
      : defaultImages;

  const mainImage = medImages[activeImage] || defaultImages[0];
  const discountedPrice = medicine.discount ? medicine.price * (1 - medicine.discount / 100) : null;
  const finalPrice = discountedPrice || medicine.price;

  const handleAddToCart = () => {
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg key={star} className={`w-5 h-5 ${star <= Math.round(rating) ? 'text-amber-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="ml-2 text-sm text-gray-500">{rating > 0 ? rating.toFixed(1) : 'No ratings'}</span>
        {medicine.numReviews && medicine.numReviews > 0 && (
          <span className="ml-1 text-sm text-gray-400">({medicine.numReviews} reviews)</span>
        )}
      </div>
    );
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'indications', label: 'Indications' },
    { id: 'dosage', label: 'Dosage' },
    { id: 'sideEffects', label: 'Side Effects' },
    { id: 'warnings', label: 'Warnings' },
    { id: 'storage', label: 'Storage' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-gray-400 hover:text-primary-600 transition-colors">Home</Link>
            <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            <Link href="/medicines" className="text-gray-400 hover:text-primary-600 transition-colors">Medicines</Link>
            <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            <Link href={`/medicines?category=${encodeURIComponent(medicine.category)}`} className="text-gray-400 hover:text-primary-600 transition-colors">{medicine.category}</Link>
            <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            <span className="text-gray-700 font-medium truncate max-w-xs">{medicine.name}</span>
          </nav>
        </div>
      </div>

      {/* Main Product Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-10">
          {/* Left: Images */}
          <div>
            {/* Main Image */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-4">
              <div className="relative aspect-square flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-white">
                <Image
                  src={mainImage}
                  alt={medicine.name}
                  width={400}
                  height={400}
                  className="max-w-full max-h-full object-contain rounded-xl"
                />
                {medicine.discount && medicine.discount > 0 && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg">
                    -{medicine.discount}% OFF
                  </div>
                )}
                {medicine.requiresPrescription && (
                  <div className="absolute top-4 right-4 bg-amber-500 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg">
                    🔒 Rx Required
                  </div>
                )}
              </div>
            </div>

            {/* Thumbnail Gallery */}
            {medImages.length > 1 && (
              <div className="flex gap-3">
                {medImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`w-20 h-20 rounded-xl border-2 overflow-hidden transition-all flex-shrink-0 ${activeImage === idx ? 'border-primary-600 shadow-lg' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <Image src={img} alt={`${medicine.name} ${idx + 1}`} width={80} height={80} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Info */}
          <div>
            <div className="space-y-5">
              {/* Manufacturer & Category */}
              <div className="flex items-center gap-3">
                {medicine.manufacturer && (
                  <span className="text-sm text-primary-600 font-semibold bg-primary-50 px-3 py-1 rounded-full">{medicine.manufacturer}</span>
                )}
                <Link href={`/medicines?category=${encodeURIComponent(medicine.category)}`} className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full hover:bg-gray-200 transition-colors">
                  {medicine.category}
                </Link>
              </div>

              {/* Name */}
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">{medicine.name}</h1>

              {/* Generic Name & Strength */}
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                {medicine.genericName && <span>Generic: <strong className="text-gray-700">{medicine.genericName}</strong></span>}
                {medicine.strength && <span>•</span>}
                {medicine.strength && <span>Strength: <strong className="text-gray-700">{medicine.strength}</strong></span>}
                {medicine.dosageForm && <span>•</span>}
                {medicine.dosageForm && <span>Form: <strong className="text-gray-700">{medicine.dosageForm}</strong></span>}
              </div>

              {/* Rating */}
              {renderStars(medicine.rating || 0)}

              {/* Price */}
              <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-2xl p-5">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-primary-700">৳{finalPrice.toFixed(0)}</span>
                  {discountedPrice && (
                    <>
                      <span className="text-lg text-gray-400 line-through">৳{medicine.price}</span>
                      <span className="text-sm font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">Save ৳{(medicine.price - discountedPrice).toFixed(0)}</span>
                    </>
                  )}
                </div>
                {medicine.packSize && (
                  <p className="text-sm text-gray-500 mt-1">Pack Size: {medicine.packSize}</p>
                )}
                <p className="text-xs text-gray-400 mt-1">Inclusive of all taxes</p>
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-3">
                {medicine.inStock ? (
                  <span className="flex items-center gap-1.5 text-green-600 font-semibold">
                    <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span> In Stock
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-red-500 font-semibold">
                    <span className="w-2.5 h-2.5 bg-red-500 rounded-full"></span> Out of Stock
                  </span>
                )}
                {medicine.soldCount && medicine.soldCount > 0 && (
                  <span className="text-sm text-gray-400">• {medicine.soldCount}+ sold</span>
                )}
              </div>

              {/* Quantity & Add to Cart */}
              {medicine.inStock && (
                <div className="flex items-center gap-4">
                  <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-11 h-11 flex items-center justify-center text-gray-600 hover:bg-gray-100 text-lg font-bold transition-colors">−</button>
                    <span className="w-12 h-11 flex items-center justify-center text-gray-900 font-bold border-x border-gray-200">{quantity}</span>
                    <button onClick={() => setQuantity(Math.min(10, quantity + 1))} className="w-11 h-11 flex items-center justify-center text-gray-600 hover:bg-gray-100 text-lg font-bold transition-colors">+</button>
                  </div>
                  <button
                    onClick={handleAddToCart}
                    className={`flex-1 py-3.5 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 text-lg ${addedToCart ? 'bg-green-500 text-white' : 'bg-primary-600 text-white hover:bg-primary-700 active:scale-[0.98]'}`}
                  >
                    {addedToCart ? (
                      <>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        Added to Cart!
                      </>
                    ) : (
                      <>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" /></svg>
                        Add to Cart
                      </>
                    )}
                  </button>
                </div>
              )}

              {!medicine.inStock && (
                <button className="w-full py-3.5 rounded-xl font-semibold bg-gray-200 text-gray-500 cursor-not-allowed">Currently Out of Stock</button>
              )}

              {/* Requires Prescription Notice */}
              {medicine.requiresPrescription && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                  <svg className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                  <div>
                    <p className="font-semibold text-amber-800 text-sm">Prescription Required</p>
                    <p className="text-amber-700 text-xs mt-0.5">This medicine requires a valid prescription. Please upload your prescription during checkout or consult with a doctor first.</p>
                  </div>
                </div>
              )}

              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: '🚚', title: 'Free Delivery', desc: 'On orders ৳500+', color: 'bg-green-50 border-green-100' },
                  { icon: '🛡️', title: '100% Genuine', desc: 'Certified products', color: 'bg-blue-50 border-blue-100' },
                  { icon: '↩️', title: 'Easy Returns', desc: '7-day policy', color: 'bg-purple-50 border-purple-100' },
                  { icon: '🔒', title: 'Secure Payment', desc: 'SSL encrypted', color: 'bg-amber-50 border-amber-100' },
                ].map((item, i) => (
                  <div key={i} className={`flex items-center gap-2.5 p-3 rounded-xl border ${item.color}`}>
                    <span className="text-xl">{item.icon}</span>
                    <div>
                      <p className="text-xs font-semibold text-gray-800">{item.title}</p>
                      <p className="text-[10px] text-gray-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-12">
          <div className="border-b border-gray-200">
            <div className="flex gap-1 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-5 py-3.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${activeTab === tab.id ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-b-2xl border border-t-0 border-gray-100 p-6 md:p-8">
            {activeTab === 'overview' && (
              <div className="prose max-w-none">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Product Description</h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {medicine.description || `No detailed description available for ${medicine.name}. Please consult your healthcare provider or pharmacist for more information about this medicine.`}
                </p>
                {/* Quick Facts Table */}
                <div className="mt-6 grid md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-5">
                    <h4 className="font-bold text-gray-900 mb-3 text-sm">Quick Facts</h4>
                    <div className="space-y-2.5">
                      {[
                        { label: 'Generic Name', value: medicine.genericName },
                        { label: 'Strength', value: medicine.strength },
                        { label: 'Dosage Form', value: medicine.dosageForm },
                        { label: 'Pack Size', value: medicine.packSize },
                        { label: 'Manufacturer', value: medicine.manufacturer },
                        { label: 'Category', value: medicine.category },
                      ].filter(f => f.value).map((fact, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="text-gray-500">{fact.label}</span>
                          <span className="font-medium text-gray-900">{fact.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-5">
                    <h4 className="font-bold text-gray-900 mb-3 text-sm">📋 Key Information</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">✓</span>
                        <span>Genuine product from <strong>{medicine.manufacturer || 'certified manufacturer'}</strong></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">✓</span>
                        <span>Quality assured and safety tested</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">✓</span>
                        <span>Store at appropriate temperature as indicated</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className={medicine.requiresPrescription ? 'text-amber-500 mt-0.5' : 'text-green-500 mt-0.5'}>
                          {medicine.requiresPrescription ? '⚠' : '✓'}
                        </span>
                        <span>{medicine.requiresPrescription ? 'Requires valid prescription' : 'Over the counter medicine'}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'indications' && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Indications & Uses</h3>
                <div className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {medicine.indications || `${medicine.name} (${medicine.genericName}) is commonly used for conditions related to ${medicine.category.toLowerCase()}. Please consult your doctor or pharmacist for specific indications and appropriate use of this medication.

Common uses for ${medicine.category} medications may include treatment, management, or prevention of related health conditions. Always follow your healthcare provider's guidance.`}
                </div>
              </div>
            )}

            {activeTab === 'dosage' && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Dosage & Administration</h3>
                <div className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {medicine.dosageInstructions || `Please follow the dosage instructions provided by your doctor or as directed on the product packaging.

General guidelines:
• Take as prescribed by your healthcare provider
• Do not exceed the recommended dose
• If you miss a dose, take it as soon as you remember
• Complete the full course of medication unless directed otherwise
• Consult your doctor if symptoms persist or worsen`}
                </div>
                <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="text-amber-800 text-sm"><strong>⚠️ Disclaimer:</strong> This information is for general reference only. Always consult a qualified healthcare professional for proper dosage instructions tailored to your specific condition.</p>
                </div>
              </div>
            )}

            {activeTab === 'sideEffects' && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Side Effects</h3>
                <div className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {medicine.sideEffects || `As with any medication, ${medicine.name} may cause side effects in some individuals. Not all users will experience these effects.

If you experience any unusual or severe side effects, discontinue use and contact your healthcare provider immediately. Report any adverse reactions to your doctor or pharmacist.`}
                </div>
                <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-red-800 text-sm"><strong>🔴 Important:</strong> Seek immediate medical attention if you experience signs of an allergic reaction such as rash, itching, swelling, severe dizziness, or difficulty breathing.</p>
                </div>
              </div>
            )}

            {activeTab === 'warnings' && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Warnings & Precautions</h3>
                <div className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {medicine.warnings || `Please read the product packaging carefully before use.

General precautions:
• Keep out of reach of children
• Do not use after the expiry date
• Inform your doctor about any other medications you are taking
• Pregnant or breastfeeding women should consult a doctor before use
• Patients with liver, kidney, or heart conditions should seek medical advice`}
                </div>
              </div>
            )}

            {activeTab === 'storage' && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Storage Instructions</h3>
                <div className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {medicine.storageInstructions || `General storage guidelines:
• Store in a cool, dry place away from direct sunlight
• Keep the container tightly closed
• Store at room temperature (15°C - 30°C) unless otherwise specified
• Do not refrigerate unless directed
• Keep away from moisture and heat
• Dispose of properly when no longer needed`}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Related Products</h2>
                <p className="text-gray-500 text-sm mt-1">Similar medicines in {medicine.category}</p>
              </div>
              <Link href={`/medicines?category=${encodeURIComponent(medicine.category)}`} className="text-primary-600 font-semibold text-sm hover:text-primary-700 flex items-center gap-1">
                View All <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {related.map((med) => (
                <Link key={med._id} href={`/medicines/${med._id}`} className="group bg-white rounded-xl border border-gray-100 hover:border-primary-200 hover:shadow-lg transition-all overflow-hidden">
                  <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 p-3 flex items-center justify-center h-32">
                    <Image
                      src={med.image || defaultImages[0]}
                      alt={med.name}
                      width={100}
                      height={100}
                      className="object-contain group-hover:scale-110 transition-transform"
                    />
                    {med.discount && med.discount > 0 && (
                      <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">-{med.discount}%</span>
                    )}
                    {!med.inStock && (
                      <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                        <span className="text-xs font-bold text-red-500">Out of Stock</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-[10px] text-gray-400 uppercase">{med.manufacturer}</p>
                    <h4 className="text-xs font-semibold text-gray-900 leading-tight line-clamp-2 mt-0.5 group-hover:text-primary-600 transition-colors">{med.name}</h4>
                    <p className="text-[10px] text-gray-400 mt-0.5">{med.strength}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm font-bold text-gray-900">৳{med.discount ? (med.price * (1 - med.discount / 100)).toFixed(0) : med.price}</span>
                      {med.discount && (
                        <span className="text-[10px] text-gray-400 line-through">৳{med.price}</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div className="bg-gray-100 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white rounded-xl p-5 border">
            <h4 className="font-bold text-gray-900 text-sm mb-2">⚕️ Medical Disclaimer</h4>
            <p className="text-gray-500 text-xs leading-relaxed">
              The information provided on this page is for general informational purposes only and should not be considered as a substitute for professional medical advice, diagnosis, or treatment. Always consult your physician or qualified healthcare provider before starting any medication. MediCare+ does not endorse or recommend any specific products. Individual results may vary. If you have a medical emergency, contact your healthcare provider immediately.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}