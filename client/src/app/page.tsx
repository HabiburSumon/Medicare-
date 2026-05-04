'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';

const slides = [
  {
    title: 'Your Health, Our Priority',
    subtitle: 'Access quality healthcare from anywhere. Book appointments, consult doctors via chat or video, and receive digital prescriptions.',
    cta: 'Book Appointment',
    ctaLink: '/doctors',
    cta2: 'Check Symptoms',
    cta2Link: '/symptom-checker',
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=600&h=600&fit=crop',
    gradient: 'from-primary-600 via-primary-700 to-primary-900',
  },
  {
    title: 'Order Medicines Online',
    subtitle: 'Get genuine medicines delivered to your doorstep. Save up to 15% on your first order with free delivery over ৳500.',
    cta: 'Shop Medicines',
    ctaLink: '/medicines',
    cta2: 'Upload Prescription',
    cta2Link: '/medicines',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&h=600&fit=crop',
    gradient: 'from-emerald-600 via-emerald-700 to-teal-800',
  },
  {
    title: 'AI-Powered Symptom Checker',
    subtitle: "Not sure what's wrong? Our intelligent symptom checker helps identify possible conditions and suggests the right specialists.",
    cta: 'Check Symptoms Now',
    ctaLink: '/symptom-checker',
    cta2: 'Find Doctors',
    cta2Link: '/doctors',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=600&fit=crop',
    gradient: 'from-violet-600 via-purple-700 to-indigo-800',
  },
];

const specialties = [
  { name: 'Cardiologist', image: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=120&h=120&fit=crop', desc: 'Heart & Cardiovascular' },
  { name: 'Dermatologist', image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=120&h=120&fit=crop', desc: 'Skin & Hair Care' },
  { name: 'Gynecologist', image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=120&h=120&fit=crop', desc: "Women's Health" },
  { name: 'Neurologist', image: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=120&h=120&fit=crop', desc: 'Brain & Nervous System' },
  { name: 'Pediatrician', image: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=120&h=120&fit=crop', desc: 'Child Healthcare' },
  { name: 'Orthopedic Surgeon', image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=120&h=120&fit=crop', desc: 'Bone & Joint Care' },
  { name: 'General Physician', image: 'https://images.unsplash.com/photo-1618498082410-b4aa22193b38?w=120&h=120&fit=crop', desc: 'General Health' },
  { name: 'Psychiatrist', image: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=120&h=120&fit=crop', desc: 'Mental Health' },
];

const features = [
  { image: 'https://img.icons8.com/3d-fluency/94/calendar.png', title: 'Easy Booking', desc: 'Book appointments with top doctors in just a few clicks', color: 'bg-blue-50' },
  { image: 'https://cdn-icons-png.flaticon.com/128/2966/2966327.png', title: 'Chat & Video', desc: 'Consult doctors via secure text chat or video call', color: 'bg-green-50' },
  { image: 'https://cdn-icons-png.flaticon.com/128/3062/3062752.png', title: 'Prescriptions', desc: 'Get digital prescriptions and order medicines online', color: 'bg-purple-50' },
  { image: 'https://cdn-icons-png.flaticon.com/128/4712/4712100.png', title: 'AI Symptom Checker', desc: 'Check your symptoms and get suggested specialists', color: 'bg-amber-50' },
];

const medicines = [
  { name: 'Paracetamol 500mg', generic: 'Acetaminophen', price: 45, oldPrice: 60, category: 'Pain Relief', rating: 4.8, badge: 'Best Seller', badgeColor: 'bg-amber-500', inStock: true, image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&h=200&fit=crop' },
  { name: 'Amoxicillin 250mg', generic: 'Penicillin Antibiotic', price: 120, oldPrice: 150, category: 'Antibiotics', rating: 4.7, badge: '15% Off', badgeColor: 'bg-red-500', inStock: true, image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=200&h=200&fit=crop' },
  { name: 'Vitamin C 1000mg', generic: 'Ascorbic Acid', price: 85, oldPrice: null, category: 'Vitamins', rating: 4.9, badge: 'Popular', badgeColor: 'bg-blue-500', inStock: true, image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=200&h=200&fit=crop' },
  { name: 'Omeprazole 20mg', generic: 'Proton Pump Inhibitor', price: 65, oldPrice: 80, category: 'Digestive', rating: 4.6, badge: '', badgeColor: '', inStock: true, image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=200&h=200&fit=crop' },
  { name: 'Cetirizine 10mg', generic: 'Antihistamine', price: 35, oldPrice: 50, category: 'Allergy', rating: 4.5, badge: '30% Off', badgeColor: 'bg-green-500', inStock: true, image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&h=200&fit=crop' },
  { name: 'Metformin 500mg', generic: 'Biguanide', price: 55, oldPrice: null, category: 'Diabetes', rating: 4.7, badge: '', badgeColor: '', inStock: true, image: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=200&h=200&fit=crop' },
  { name: 'Amlodipine 5mg', generic: 'Calcium Channel Blocker', price: 75, oldPrice: 95, category: 'Heart Care', rating: 4.6, badge: 'Top Rated', badgeColor: 'bg-purple-500', inStock: true, image: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=200&h=200&fit=crop' },
  { name: 'Azithromycin 500mg', generic: 'Macrolide Antibiotic', price: 180, oldPrice: 220, category: 'Antibiotics', rating: 4.8, badge: '18% Off', badgeColor: 'bg-red-500', inStock: true, image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=200&h=200&fit=crop' },
  { name: 'Multivitamin Plus', generic: 'Dietary Supplement', price: 250, oldPrice: 300, category: 'Vitamins', rating: 4.9, badge: 'Best Value', badgeColor: 'bg-amber-500', inStock: true, image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=200&h=200&fit=crop' },
  { name: 'Ibuprofen 400mg', generic: 'NSAID', price: 40, oldPrice: null, category: 'Pain Relief', rating: 4.5, badge: '', badgeColor: '', inStock: false, image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&h=200&fit=crop' },
];

const popularDoctors = [
  { name: 'Dr. Sarah Chen', specialty: 'Cardiologist', rating: 4.9, reviews: 328, experience: 15, fee: 800, image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop', available: true },
  { name: 'Dr. James Wilson', specialty: 'Dermatologist', rating: 4.8, reviews: 256, experience: 12, fee: 700, image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&h=300&fit=crop', available: true },
  { name: 'Dr. Emily Roberts', specialty: 'Pediatrician', rating: 4.9, reviews: 412, experience: 18, fee: 600, image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&h=300&fit=crop', available: true },
  { name: 'Dr. Michael Brown', specialty: 'Neurologist', rating: 4.7, reviews: 189, experience: 10, fee: 900, image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=300&h=300&fit=crop', available: false },
  { name: 'Dr. Lisa Park', specialty: 'Gynecologist', rating: 4.8, reviews: 345, experience: 14, fee: 750, image: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=300&h=300&fit=crop', available: true },
  { name: 'Dr. David Kim', specialty: 'Orthopedic Surgeon', rating: 4.7, reviews: 278, experience: 16, fee: 850, image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&h=300&fit=crop', available: true },
];

const faqs = [
  { question: 'What is MediCare+?', answer: 'MediCare+ is an online platform for integrated healthcare services where patients can connect with qualified doctors, book appointments, and access a wide range of healthcare solutions including telemedicine, prescriptions, and medicine delivery.' },
  { question: 'What services does MediCare+ provide?', answer: 'MediCare+ offers a wide range of convenient healthcare services:\n\n• Doctor Appointments\n• Telemedicine (Doctor consultation over video/voice call)\n• Digital Prescriptions\n• Online Medicine Ordering\n• AI-Powered Symptom Checker\n• Hospital & Diagnostic Information\n• Home Sample Collection\n• Physiotherapy Services\n• Doctor Chat & Video Consultation' },
  { question: "How much do doctors' consultations on MediCare+ cost?", answer: "The fee for consultations is decided by the individual doctor. We have no control over the price. You can view each doctor's consultation fee on their profile before booking." },
  { question: "I don't know a lot about technology. What shall I do to get a doctor's appointment?", answer: "It's not just for people who are tech-savvy. Usability has been our key area of attention. Simply use our search option and enter the name of the physician, their area of expertise, or the illness you have. When you see the appointment button and the doctor's brief bio, click it. Follow the instructions and soon you will receive an appointment confirmation." },
  { question: 'Do you provide ambulance services outside of Dhaka?', answer: 'Yes. We provide nationwide service coverage across Bangladesh.' },
  { question: 'What type of ambulance services does MediCare+ provide?', answer: 'We currently offer both domestic ground ambulance and air ambulance services:\n\n• Basic / Non-AC Ambulance Service\n• Life Support / ICU Ambulance Service\n• Freezing / Mortuary Ambulance Service\n• Neonatal / NICU Ambulance Service\n• Patient Transport Vehicle\n• Air Ambulance Service' },
  { question: 'Is Telemedicine Right for Me?', answer: "It depends on your health/medical condition and urgency. Telemedicine makes it possible to access healthcare more swiftly and locally. It reduces waiting and travel times. Telemedicine gives you instant support at your sudden critical moment or a follow-up meeting with a doctor. Since telemedicine may not always be acceptable, you might require a medical expert's assistance to decide whether it is appropriate." },
  { question: 'Do you offer free home sample collection?', answer: "It depends on the service providers associated with us. Some offer free sample collections, some don't. If home collection is not possible then we will provide you with the nearest center details." },
  { question: 'Can physiotherapy treatment be performed at home?', answer: "Yes, it's easy to call a physiotherapist at home and take treatment from a registered doctor at your convenient place. Book through our platform and our service will reach you quickly." },
  { question: 'Why Reserve a Doctor Appointment at MediCare+?', answer: 'Here is why booking at MediCare+ is essential:\n\n• Service is Priceworthy\n• Fast and Hassle-free Online Booking\n• Prompt Service of Specialized Doctors\n• Consult via Video/Voice Call\n• Show Reports to Doctors Instantly\n• Ambulance Service (AC, ICU, or AIR)\n• Rich-quality Diagnostic Care\n• 365/24/7 Service\n• Instant Prescription Delivery\n• Home Physiotherapy Service' },
  { question: 'What are the benefits of booking a Doctor Appointment at MediCare+?', answer: 'MediCare+ is a powerful online platform for integrated healthcare:\n\n• Reserve Appointment Online\n• Instant Contact (Video / Voice Call)\n• Health Checkup Package\n• Hospital & Diagnostic Information\n• Medical Instruments Rental\n• Diagnostic Home Service\n• Home Physiotherapy Service\n• Lab Test Sample Collection from Home\n• And Much More' },
];

export default function HomePage() {
  const { user } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [siteContent, setSiteContent] = useState<Record<string, any>>({});
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    api.get('/content').then(r => setSiteContent(r.data.data || {})).catch(() => {});
  }, []);

  const hero = siteContent.hero;
  const featuresContent = siteContent.features;
  const statsContent = siteContent.stats;
  const ctaContent = siteContent.cta;

  const heroSlidesCount = hero?.settings?.slides?.length || 0;
  const totalSlides = heroSlidesCount > 0 ? heroSlidesCount : slides.length;

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  // Reset currentSlide if it exceeds total slides
  useEffect(() => {
    if (currentSlide >= totalSlides) setCurrentSlide(0);
  }, [totalSlides, currentSlide]);

  return (
    <div>
      {/* ========== HERO BANNER ========== */}
      {(hero?.settings?.slides?.length > 0) ? (
        /* Hero with uploaded media slides */
        <section className="relative text-white min-h-[560px] flex items-center overflow-hidden">
          {/* Background media */}
          {hero.settings.slides[currentSlide]?.mediaType === 'video' ? (
            <video key={currentSlide} src={hero.settings.slides[currentSlide].url} autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700" />
          ) : (
            <img key={currentSlide} src={hero.settings.slides[currentSlide].url} alt={`Slide ${currentSlide + 1}`} className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700" />
          )}
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30"></div>
          {/* Content */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
            <div className="max-w-2xl animate-fade-in">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">{hero?.title || 'Your Health, Our Priority'}</h1>
              <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed">{hero?.subtitle || 'Access quality healthcare from anywhere. Book appointments, consult doctors, and receive digital prescriptions.'}</p>
              <div className="flex flex-wrap gap-4">
                <Link href="/doctors" className="bg-primary-600 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-primary-700 transition-colors shadow-lg hover:scale-105 transform duration-200">Book Appointment</Link>
                <Link href="/symptom-checker" className="border-2 border-white/60 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-white/10 transition-colors">Check Symptoms</Link>
              </div>
              {/* Floating badges */}
              <div className="flex flex-wrap gap-4 mt-10">
                <div className="bg-white/20 backdrop-blur-md px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2">
                  <Image src="https://img.icons8.com/3d-fluency/24/star.png" alt="star" width={18} height={18} /> 4.8 Rating
                </div>
                <div className="bg-white/20 backdrop-blur-md px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2">
                  <Image src="https://cdn-icons-png.flaticon.com/128/8866/8866054.png" alt="doctor" width={18} height={18} /> 500+ Doctors
                </div>
                <div className="bg-white/20 backdrop-blur-md px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2">
                  <Image src="https://img.icons8.com/3d-fluency/40/calendar--v1.png" alt="appointments" width={18} height={18} /> 100K+ Appointments
                </div>
              </div>
            </div>
          </div>
          {/* Slide navigation */}
          {hero.settings.slides.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center space-x-4">
              <button onClick={prevSlide} className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors backdrop-blur-sm" aria-label="Previous slide">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <div className="flex space-x-2">
                {hero.settings.slides.map((_: any, idx: number) => (
                  <button key={idx} onClick={() => setCurrentSlide(idx)} className={'h-2 rounded-full transition-all duration-300 ' + (idx === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/60')} aria-label={'Go to slide ' + (idx + 1)} />
                ))}
              </div>
              <button onClick={nextSlide} className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors backdrop-blur-sm" aria-label="Next slide">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          )}
        </section>
      ) : (
        /* Default hero slider (fallback) */
        <section className={'relative bg-gradient-to-br text-white transition-all duration-700 ease-in-out ' + slides[currentSlide].gradient}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center min-h-[480px] py-16">
              <div className="animate-fade-in">
                <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">{hero?.title || slides[currentSlide].title}</h1>
                <p className="text-lg text-white/80 mb-8 leading-relaxed max-w-lg">{hero?.subtitle || slides[currentSlide].subtitle}</p>
                <div className="flex flex-wrap gap-4">
                  <Link href={slides[currentSlide].ctaLink} className="bg-white text-gray-900 px-8 py-3.5 rounded-xl font-semibold hover:bg-gray-100 transition-colors shadow-lg hover:scale-105 transform duration-200">{slides[currentSlide].cta}</Link>
                  <Link href={slides[currentSlide].cta2Link} className="border-2 border-white/60 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-white/10 transition-colors">{slides[currentSlide].cta2}</Link>
                </div>
              </div>
              <div className="hidden md:flex justify-center">
                <div className="relative">
                  <div className="w-72 h-72 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm overflow-hidden">
                    <Image src={slides[currentSlide].image} alt="Healthcare" width={280} height={280} className="rounded-full object-cover w-[260px] h-[260px] animate-fade-in" key={currentSlide} />
                  </div>
                  <div className="absolute -top-2 -right-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-1.5 animate-float">
                    <Image src="https://img.icons8.com/3d-fluency/24/star.png" alt="star" width={18} height={18} /> 4.8 Rating
                  </div>
                  <div className="absolute -bottom-2 -left-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-1.5 animate-float animation-delay-500">
                    <Image src="https://cdn-icons-png.flaticon.com/128/8866/8866054.png" alt="doctor" width={18} height={18} /> 500+ Doctors
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center space-x-4">
            <button onClick={prevSlide} className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors backdrop-blur-sm" aria-label="Previous slide">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div className="flex space-x-2">
              {slides.map((_, idx) => (
                <button key={idx} onClick={() => setCurrentSlide(idx)} className={'h-2 rounded-full transition-all duration-300 ' + (idx === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/60')} aria-label={'Go to slide ' + (idx + 1)} />
              ))}
            </div>
            <button onClick={nextSlide} className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors backdrop-blur-sm" aria-label="Next slide">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </section>
      )}

      {/* ========== STATS BAR - Light Blue ========== */}
      <section className="bg-gradient-to-r from-blue-50 via-white to-blue-50 border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { num: '500+', label: 'Expert Doctors', img: 'https://cdn-icons-png.flaticon.com/128/8866/8866054.png' },
              { num: '50K+', label: 'Happy Patients', img: 'https://cdn-icons-png.flaticon.com/128/3222/3222680.png' },
              { num: '100K+', label: 'Appointments', img: 'https://img.icons8.com/3d-fluency/40/calendar--v1.png' },
              { num: '4.8', label: 'Average Rating', img: 'https://img.icons8.com/3d-fluency/40/star.png' },
            ].map((stat, i) => (
              <div key={i} className="text-center flex flex-col items-center animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <Image src={stat.img} alt={stat.label} width={36} height={36} className="mb-1" />
                <p className="text-2xl md:text-3xl font-bold text-gray-900">{stat.num}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== FEATURES - Soft Green ========== */}
      <section className="py-16 bg-gradient-to-b from-green-50 to-emerald-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-slide-up">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">{featuresContent?.title || 'Why Choose MediCare+?'}</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">{featuresContent?.subtitle || 'Experience healthcare reimagined with cutting-edge technology and compassionate care'}</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 text-center hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border border-gray-100 group animate-scale-in" style={{ animationDelay: `${i * 0.15}s` }}>
                <div className={'w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ' + f.color}>
                  <Image src={f.image} alt={f.title} width={48} height={48} className="group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== SPECIALTIES - White ========== */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-slide-up">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Browse by Specialty</h2>
            <p className="text-gray-500">Find the right doctor for your health needs</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {specialties.map((s, i) => (
              <Link key={i} href={'/doctors?specialization=' + encodeURIComponent(s.name)} className="group bg-white rounded-2xl border border-gray-100 p-5 hover:border-primary-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex items-center space-x-4 animate-slide-up" style={{ animationDelay: `${i * 0.08}s` }}>
                <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                  <Image src={s.image} alt={s.name} width={48} height={48} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm group-hover:text-primary-600 transition-colors">{s.name}</h3>
                  <p className="text-xs text-gray-400">{s.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ========== HOW IT WORKS - Soft Purple ========== */}
      <section className="py-16 bg-gradient-to-b from-purple-50 to-violet-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-slide-up">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">How It Works</h2>
            <p className="text-gray-500">Get started in 3 simple steps</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Search Doctor', desc: 'Find doctors by specialty, name, or condition. View profiles, ratings, and availability.', image: 'https://img.icons8.com/3d-fluency/80/search.png', color: 'from-blue-500 to-blue-600' },
              { step: '02', title: 'Book Appointment', desc: 'Choose a convenient time slot and book your appointment instantly.', image: 'https://img.icons8.com/3d-fluency/80/calendar--v1.png', color: 'from-primary-500 to-primary-600' },
              { step: '03', title: 'Get Consultation', desc: 'Connect via chat or video call. Receive prescriptions and order medicines.', image: 'https://cdn-icons-png.flaticon.com/128/2966/2966327.png', color: 'from-emerald-500 to-emerald-600' },
            ].map((item, i) => (
              <div key={i} className="relative bg-white rounded-2xl p-8 text-center border border-gray-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 animate-scale-in" style={{ animationDelay: `${i * 0.2}s` }}>
                <div className={'w-20 h-20 bg-gradient-to-br rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg overflow-hidden ' + item.color}>
                  <Image src={item.image} alt={item.title} width={56} height={56} />
                </div>
                <span className="text-primary-600 font-bold text-xs tracking-widest uppercase mb-2 block">Step {item.step}</span>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                {i < 2 && <div className="hidden md:block absolute top-1/2 -right-4 text-gray-300 text-2xl">→</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== POPULAR MEDICINES - Soft Orange ========== */}
      <section className="py-16 bg-gradient-to-b from-orange-50 to-amber-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10 animate-slide-up">
            <div>
              <span className="text-primary-600 font-semibold text-sm uppercase tracking-wider">💊 Health Essentials</span>
              <h2 className="text-3xl font-bold text-gray-900 mt-2">Popular Medicines</h2>
              <p className="text-gray-500 mt-1">Order genuine medicines at the best prices</p>
            </div>
            <Link href="/medicines" className="hidden md:flex items-center space-x-2 text-primary-600 font-semibold hover:text-primary-700 transition-colors group">
              <span>View All</span>
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Link>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-3 mb-8 animate-slide-up animation-delay-100">
            {['All', 'Pain Relief', 'Antibiotics', 'Vitamins', 'Heart Care', 'Diabetes', 'Allergy', 'Digestive'].map((cat, i) => (
              <button key={cat} className={'px-4 py-2 rounded-full text-sm font-medium transition-all hover:scale-105 ' + (i === 0 ? 'bg-primary-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-primary-50 hover:text-primary-600 border border-gray-200')}>
                {cat}
              </button>
            ))}
          </div>

          {/* Medicine Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {medicines.map((med, i) => (
              <div key={i} className="group bg-white rounded-2xl border border-gray-100 hover:border-primary-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden relative animate-scale-in" style={{ animationDelay: `${i * 0.08}s` }}>
                {med.badge && (
                  <div className={'absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full text-white text-xs font-bold ' + med.badgeColor}>{med.badge}</div>
                )}
                {!med.inStock && (
                  <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center rounded-2xl">
                    <span className="bg-gray-800 text-white px-3 py-1.5 rounded-full text-xs font-bold">Out of Stock</span>
                  </div>
                )}
                {/* Medicine Image */}
                <div className="relative h-36 overflow-hidden bg-gradient-to-br from-gray-50 to-white">
                  <Image src={med.image} alt={med.name} width={200} height={200} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-white/40 to-transparent"></div>
                </div>
                {/* Info */}
                <div className="p-4">
                  <h4 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-1">{med.name}</h4>
                  <p className="text-xs text-gray-400 mt-0.5">{med.generic}</p>
                  <div className="flex items-center mt-2 space-x-1">
                    <div className="flex">
                      {[1,2,3,4,5].map(star => (
                        <svg key={star} className={'w-3 h-3 ' + (star <= Math.floor(med.rating) ? 'text-amber-400' : 'text-gray-200')} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">{med.rating}</span>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-baseline space-x-1.5">
                      <span className="text-lg font-bold text-gray-900">৳{med.price}</span>
                      {med.oldPrice && <span className="text-xs text-gray-400 line-through">৳{med.oldPrice}</span>}
                    </div>
                  </div>
                  {med.inStock ? (
                    <button className="w-full mt-3 bg-primary-600 text-white py-2 rounded-xl text-xs font-semibold hover:bg-primary-700 active:scale-95 transition-all">Add to Cart</button>
                  ) : (
                    <button className="w-full mt-3 bg-gray-100 text-gray-400 py-2 rounded-xl text-xs font-semibold cursor-not-allowed" disabled>Out of Stock</button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Link href="/medicines" className="btn-primary">View All Medicines</Link>
          </div>

          {/* Trust Badges */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 animate-slide-up animation-delay-300">
            {[
              { icon: '🛡️', title: '100% Genuine', desc: 'Certified medicines', color: 'bg-blue-50 border-blue-100' },
              { icon: '🚚', title: 'Fast Delivery', desc: 'Within 2 hours', color: 'bg-green-50 border-green-100' },
              { icon: '💰', title: 'Best Prices', desc: 'Up to 25% off', color: 'bg-amber-50 border-amber-100' },
              { icon: '📋', title: 'Easy Returns', desc: '7-day policy', color: 'bg-purple-50 border-purple-100' },
            ].map((item, i) => (
              <div key={i} className={'flex items-center space-x-3 rounded-xl p-4 border animate-float ' + item.color} style={{ animationDelay: `${i * 0.5}s` }}>
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{item.title}</p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== POPULAR DOCTORS - Soft Teal ========== */}
      <section className="py-16 bg-gradient-to-b from-teal-50 to-cyan-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-slide-up">
            <span className="text-primary-600 font-semibold text-sm uppercase tracking-wider">👨‍⚕️ Top Rated</span>
            <h2 className="text-3xl font-bold text-gray-900 mt-2">Popular Doctors</h2>
            <p className="text-gray-500 mt-1">Consult with the best healthcare professionals</p>
          </div>

          <div className="grid md:grid-cols-3 lg:grid-cols-3 gap-6">
            {popularDoctors.map((doc, i) => (
              <Link key={i} href="/doctors" className="group bg-white rounded-2xl border border-gray-100 hover:border-primary-200 hover:shadow-xl transition-all duration-300 overflow-hidden animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="p-6">
                  <div className="flex items-start space-x-4">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-md group-hover:shadow-lg transition-shadow">
                        <Image src={doc.image} alt={doc.name} width={80} height={80} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      </div>
                      {doc.available && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                      )}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-lg group-hover:text-primary-600 transition-colors">{doc.name}</h3>
                      <p className="text-primary-600 text-sm font-medium">{doc.specialty}</p>
                      <p className="text-xs text-gray-400 mt-1">{doc.experience} years experience</p>
                    </div>
                  </div>

                  {/* Rating & Reviews */}
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center bg-amber-50 px-2.5 py-1 rounded-lg">
                        <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                        <span className="text-sm font-bold text-gray-900 ml-1">{doc.rating}</span>
                      </div>
                      <span className="text-xs text-gray-400">({doc.reviews} reviews)</span>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">৳{doc.fee}</p>
                      <p className="text-xs text-gray-400">per visit</p>
                    </div>
                  </div>

                  {/* Action */}
                  <button className={'w-full mt-4 py-2.5 rounded-xl text-sm font-semibold transition-all ' + (doc.available ? 'bg-primary-600 text-white hover:bg-primary-700 active:scale-95' : 'bg-gray-100 text-gray-400 cursor-not-allowed')} disabled={!doc.available}>
                    {doc.available ? 'Book Appointment' : 'Unavailable'}
                  </button>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-10 text-center animate-slide-up">
            <Link href="/doctors" className="btn-primary inline-flex items-center space-x-2 hover:scale-105 transition-transform">
              <span>View All Doctors</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ========== FAQ SECTION ========== */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-slide-up">
            <span className="text-primary-600 font-semibold text-sm uppercase tracking-wider">❓ Got Questions?</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">Frequently Asked Questions</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">Find answers to common questions about our telemedicine platform and healthcare services</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div key={index} className={'bg-white rounded-2xl border transition-all duration-300 overflow-hidden ' + (openFaq === index ? 'border-primary-200 shadow-lg shadow-primary-100/50' : 'border-gray-100 hover:border-gray-200 hover:shadow-md')}>
                <button onClick={() => setOpenFaq(openFaq === index ? null : index)} className="w-full flex items-center justify-between px-6 py-5 text-left">
                  <div className="flex items-center space-x-4 flex-1 min-w-0">
                    <div className={'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-bold transition-colors ' + (openFaq === index ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-500')}>{index + 1}</div>
                    <h3 className={'text-sm md:text-base font-semibold transition-colors ' + (openFaq === index ? 'text-primary-700' : 'text-gray-900')}>{faq.question}</h3>
                  </div>
                  <div className={'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ml-4 transition-all duration-300 ' + (openFaq === index ? 'bg-primary-100 rotate-180' : 'bg-gray-50')}>
                    <svg className={'w-4 h-4 transition-colors ' + (openFaq === index ? 'text-primary-600' : 'text-gray-400')} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </button>
                <div className={'transition-all duration-300 ease-in-out ' + (openFaq === index ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0')}>
                  <div className="px-6 pb-5 pt-0">
                    <div className="ml-12">
                      <div className="border-t border-gray-100 pt-4">
                        <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{faq.answer}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center animate-slide-up">
            <p className="text-gray-500 text-sm mb-4">Still have questions? We're here to help!</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/chat" className="inline-flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors hover:scale-105 transform duration-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                <span>Chat with Us</span>
              </Link>
              <Link href="/symptom-checker" className="inline-flex items-center space-x-2 px-6 py-3 border-2 border-primary-200 text-primary-700 rounded-xl font-semibold hover:bg-primary-50 transition-colors">
                <span>Check Symptoms</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========== CTA - Primary Gradient ========== */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 bg-white rounded-full animate-float"></div>
          <div className="absolute bottom-10 right-10 w-60 h-60 bg-white rounded-full animate-float animation-delay-500"></div>
          <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-white rounded-full animate-float animation-delay-300"></div>
        </div>
        <div className="max-w-4xl mx-auto text-center px-4 relative z-10 animate-slide-up">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{ctaContent?.title || 'Ready to Take Control of Your Health?'}</h2>
          <p className="text-primary-100 mb-8 text-lg max-w-2xl mx-auto">{ctaContent?.subtitle || 'Join thousands of patients who trust MediCare+ for their healthcare needs. Get started today for free.'}</p>
          <div className="flex flex-wrap justify-center gap-4">
            {!user && (
              <Link href="/register" className="bg-white text-primary-700 px-8 py-4 rounded-xl font-semibold hover:bg-primary-50 hover:scale-105 transition-all shadow-lg text-lg">Get Started Free</Link>
            )}
            <Link href="/doctors" className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-colors text-lg">Find a Doctor</Link>
          </div>
        </div>
      </section>
    </div>
  );
}