'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/lib/api';
import { getDoctorImage } from '@/lib/doctorImages';
import { useSearchParams } from 'next/navigation';

interface Doctor {
  _id: string;
  user: { name: string; avatar: string; email: string };
  specialization: string;
  experience: number;
  qualification: string;
  rating: number;
  totalReviews: number;
  consultationFee: number;
  availableDays: string[];
  isAvailable: boolean;
  languages: string[];
  clinicAddress: string;
}

const specializations = [
  { value: '', label: 'All Doctors', icon: '🏥', color: 'bg-gray-100 text-gray-700 border-gray-200', activeColor: 'bg-gray-800 text-white border-gray-800' },
  { value: 'Cardiologist', label: 'Cardiologist', icon: '❤️', color: 'bg-red-50 text-red-700 border-red-200', activeColor: 'bg-red-600 text-white border-red-600' },
  { value: 'Dermatologist', label: 'Dermatologist', icon: '🧴', color: 'bg-purple-50 text-purple-700 border-purple-200', activeColor: 'bg-purple-600 text-white border-purple-600' },
  { value: 'Gynecologist', label: 'Gynecologist', icon: '👩‍⚕️', color: 'bg-pink-50 text-pink-700 border-pink-200', activeColor: 'bg-pink-600 text-white border-pink-600' },
  { value: 'Neurologist', label: 'Neurologist', icon: '🧠', color: 'bg-indigo-50 text-indigo-700 border-indigo-200', activeColor: 'bg-indigo-600 text-white border-indigo-600' },
  { value: 'General Physician', label: 'General Physician', icon: '🩺', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', activeColor: 'bg-emerald-600 text-white border-emerald-600' },
  { value: 'Pediatrician', label: 'Pediatrician', icon: '👶', color: 'bg-sky-50 text-sky-700 border-sky-200', activeColor: 'bg-sky-600 text-white border-sky-600' },
  { value: 'Orthopedic Surgeon', label: 'Orthopedic', icon: '🦴', color: 'bg-orange-50 text-orange-700 border-orange-200', activeColor: 'bg-orange-600 text-white border-orange-600' },
  { value: 'Psychiatrist', label: 'Psychiatrist', icon: '🧘', color: 'bg-violet-50 text-violet-700 border-violet-200', activeColor: 'bg-violet-600 text-white border-violet-600' },
];

const doctorImages = [
  'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=200&h=200&fit=crop',
];

const sortOptions = [
  { value: 'rating', label: 'Highest Rated' },
  { value: 'experience', label: 'Most Experienced' },
  { value: 'fee-low', label: 'Fee: Low to High' },
  { value: 'fee-high', label: 'Fee: High to Low' },
  { value: 'reviews', label: 'Most Reviewed' },
];

function DoctorsContent() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const searchParams = useSearchParams();

  useEffect(() => {
    const spec = searchParams.get('specialization');
    if (spec) setSpecialization(spec);
  }, [searchParams]);

  useEffect(() => {
    fetchDoctors();
  }, [specialization]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (specialization) params.specialization = specialization;
      if (search) params.search = search;
      const res = await api.get('/doctors', { params });
      setDoctors(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch doctors');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDoctors();
  };

  const sortedDoctors = [...doctors].sort((a, b) => {
    switch (sortBy) {
      case 'rating': return (b.rating || 0) - (a.rating || 0);
      case 'experience': return b.experience - a.experience;
      case 'fee-low': return a.consultationFee - b.consultationFee;
      case 'fee-high': return b.consultationFee - a.consultationFee;
      case 'reviews': return (b.totalReviews || 0) - (a.totalReviews || 0);
      default: return 0;
    }
  });

  const activeSpec = specializations.find(s => s.value === specialization) || specializations[0];

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-blue-800 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-20 w-40 h-40 bg-white rounded-full"></div>
          <div className="absolute bottom-5 left-10 w-28 h-28 bg-white rounded-full"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm mb-4">
              <span>👨‍⚕️</span>
              <span>{doctors.length} Expert Doctors</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Find Your Doctor</h1>
            <p className="text-primary-100 mb-6 text-lg">Browse through our expert medical professionals and book an appointment today</p>
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by doctor name..." className="w-full pl-12 pr-5 py-3.5 rounded-xl text-gray-900 focus:outline-none focus:ring-4 focus:ring-white/20" />
              </div>
              <button type="submit" className="px-8 py-3.5 bg-white text-primary-700 hover:bg-gray-100 rounded-xl font-semibold transition-colors shadow-lg">
                Search
              </button>
            </form>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Specialty Tabs */}
        <div className="mb-6 -mt-8 relative z-20">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4">
            <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-hide">
              {specializations.map((spec) => (
                <button
                  key={spec.value}
                  onClick={() => setSpecialization(spec.value)}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl border-2 font-medium text-sm whitespace-nowrap transition-all flex-shrink-0 ${
                    specialization === spec.value
                      ? spec.activeColor
                      : `${spec.color} hover:shadow-md`
                  }`}
                >
                  <span className="text-base">{spec.icon}</span>
                  <span>{spec.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
              <span>{activeSpec.icon}</span>
              <span>{activeSpec.label}</span>
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {!loading && `${sortedDoctors.length} doctor${sortedDoctors.length !== 1 ? 's' : ''} found`}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <div className="flex bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full"></div>
            </div>
            <p className="text-gray-500 font-medium">Finding the best doctors for you...</p>
          </div>
        ) : sortedDoctors.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <Image src="https://img.icons8.com/3d-fluency/80/search.png" alt="search" width={80} height={80} className="mx-auto mb-4 opacity-60" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No doctors found</h3>
            <p className="text-gray-400 mb-6">Try adjusting your search or specialty filter</p>
            <button onClick={() => { setSpecialization(''); setSearch(''); }} className="btn-primary">
              View All Doctors
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {sortedDoctors.map((doc, idx) => (
              <div key={doc._id} className="bg-white rounded-2xl border border-gray-100 hover:shadow-xl hover:border-primary-200 transition-all overflow-hidden group">
                <div className="relative">
                  <div className="h-2 bg-gradient-to-r from-primary-500 to-blue-500"></div>
                  {doc.isAvailable && (
                    <div className="absolute top-4 right-4 bg-green-500 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-md">
                      Available
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-primary-50 shadow-sm">
                      <Image
                        src={doc.user?.avatar || getDoctorImage(doc._id)}
                        alt={doc.user?.name || 'Doctor'}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 truncate">{doc.user?.name || 'Doctor'}</h3>
                      <p className="text-sm text-primary-600 font-semibold">{doc.specialization}</p>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{doc.qualification}</p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-lg p-2.5 text-center">
                      <p className="text-xs text-gray-400">Experience</p>
                      <p className="text-sm font-bold text-gray-900">{doc.experience} Years</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2.5 text-center">
                      <p className="text-xs text-gray-400">Patients</p>
                      <p className="text-sm font-bold text-gray-900">{doc.totalReviews}+</p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg key={star} className={`w-4 h-4 ${star <= Math.round(doc.rating || 0) ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-sm font-semibold">{doc.rating?.toFixed(1) || 'New'}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Fee</p>
                      <p className="text-lg font-bold text-primary-600">৳{doc.consultationFee}</p>
                    </div>
                  </div>

                  {doc.availableDays && doc.availableDays.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {doc.availableDays.slice(0, 5).map((day) => (
                        <span key={day} className="px-2 py-0.5 bg-primary-50 text-primary-600 rounded text-[10px] font-medium">{day.slice(0, 3)}</span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-100 px-6 py-3 flex space-x-2 bg-gray-50/50">
                  <Link href={`/doctors/${doc._id}`} className="flex-1 text-center py-2.5 text-sm font-semibold text-primary-600 hover:bg-primary-50 rounded-xl transition-colors">
                    Profile
                  </Link>
                  <Link href={`/doctors/${doc._id}?action=book`} className="flex-1 text-center py-2.5 text-sm font-semibold bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors shadow-sm">
                    Book Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="space-y-4">
            {sortedDoctors.map((doc, idx) => (
              <div key={doc._id} className="bg-white rounded-2xl border border-gray-100 hover:shadow-lg hover:border-primary-200 transition-all overflow-hidden group">
                <div className="flex flex-col sm:flex-row">
                  <div className="flex-shrink-0 p-6 sm:pr-0">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-primary-50 shadow-sm mx-auto sm:mx-0">
                      <Image
                        src={doc.user?.avatar || getDoctorImage(doc._id)}
                        alt={doc.user?.name || 'Doctor'}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                  </div>
                  <div className="flex-1 p-6 sm:pl-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                      <div className="mb-3 sm:mb-0">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-bold text-gray-900 text-lg">{doc.user?.name || 'Doctor'}</h3>
                          {doc.isAvailable && (
                            <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-bold">Available</span>
                          )}
                        </div>
                        <p className="text-primary-600 font-semibold">{doc.specialization}</p>
                        <p className="text-sm text-gray-500 mt-0.5">{doc.qualification}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs text-gray-400">Consultation Fee</p>
                        <p className="text-2xl font-bold text-primary-600">৳{doc.consultationFee}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
                      <div className="flex items-center space-x-1">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg key={star} className={`w-3.5 h-3.5 ${star <= Math.round(doc.rating || 0) ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="font-semibold">{doc.rating?.toFixed(1) || 'New'}</span>
                        <span className="text-gray-400">({doc.totalReviews} reviews)</span>
                      </div>
                      <span className="text-gray-300">|</span>
                      <span className="text-gray-600">{doc.experience} years experience</span>
                      <span className="text-gray-300">|</span>
                      <span className="text-gray-600">{doc.totalReviews}+ patients</span>
                    </div>

                    {doc.availableDays && doc.availableDays.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {doc.availableDays.map((day) => (
                          <span key={day} className="px-2.5 py-1 bg-primary-50 text-primary-600 rounded-lg text-xs font-medium">{day.slice(0, 3)}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex sm:flex-col items-center justify-center gap-2 p-6 sm:border-l border-t sm:border-t-0 border-gray-100 bg-gray-50/50 sm:w-40">
                    <Link href={`/doctors/${doc._id}`} className="flex-1 sm:w-full text-center py-2.5 text-sm font-semibold text-primary-600 hover:bg-primary-50 rounded-xl transition-colors border border-primary-200">
                      View Profile
                    </Link>
                    <Link href={`/doctors/${doc._id}?action=book`} className="flex-1 sm:w-full text-center py-2.5 text-sm font-semibold bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors shadow-sm">
                      Book Now
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function DoctorsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full"></div>
      </div>
    }>
      <DoctorsContent />
    </Suspense>
  );
}