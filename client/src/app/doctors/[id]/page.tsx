'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/lib/api';
import { getDoctorImage } from '@/lib/doctorImages';
import { useAuth } from '@/contexts/AuthContext';

interface TimeSlot { start: string; end: string; }

interface DoctorData {
  _id: string;
  user: { name: string; email: string; phone: string; avatar: string };
  specialization: string;
  experience: number;
  qualification: string;
  bio: string;
  consultationFee: number;
  rating: number;
  totalReviews: number;
  availableDays: string[];
  timeSlots: TimeSlot[];
  languages: string[];
  clinicAddress: string;
  isAvailable: boolean;
}

function DoctorProfileContent() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [doctor, setDoctor] = useState<DoctorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingStep, setBookingStep] = useState(searchParams.get('action') === 'book' ? 1 : 0);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [appointmentType, setAppointmentType] = useState('video');
  const [notes, setNotes] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookedAppointment, setBookedAppointment] = useState<any>(null);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('pay-later');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [videoUploaded, setVideoUploaded] = useState(false);
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);
  const [fileType, setFileType] = useState<'video' | 'image'>('video');

  const fetchDoctor = useCallback(async () => {
    try {
      const res = await api.get('/doctors/' + id);
      setDoctor(res.data.data);
    } catch (err) {
      console.error('Failed to fetch doctor');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchDoctor(); }, [fetchDoctor]);

  const getAvailableSlots = (): TimeSlot[] => {
    if (!doctor || !selectedDate) return [];
    const date = new Date(selectedDate);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    if (!doctor.availableDays.includes(dayNames[date.getDay()])) return [];
    return doctor.timeSlots || [];
  };

  const getMinDate = (): string => {
    const d = new Date(); d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const getNext7Days = () => {
    const days = [];
    for (let i = 1; i <= 14; i++) {
      const d = new Date(); d.setDate(d.getDate() + i);
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      days.push({
        full: d.toISOString().split('T')[0],
        day: dayNames[d.getDay()],
        date: d.getDate(),
        month: monthNames[d.getMonth()],
        isAvailable: doctor?.availableDays?.includes(['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d.getDay()]) || false,
      });
    }
    return days;
  };

  const handleBooking = async () => {
    if (!user || !doctor) { if (!user) router.push('/login'); return; }
    if (!selectedDate || !selectedSlot) { setError('Please select date and time slot'); return; }
    setBookingLoading(true); setError('');
    try {
      const res = await api.post('/appointments', {
        doctorId: doctor._id, appointmentDate: selectedDate,
        timeSlot: selectedSlot, type: appointmentType, notes,
      });
      setBookedAppointment(res.data.data);
      setBookingSuccess(true);
      setBookingStep(5);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to book appointment');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleVideoFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) {
        setError('File must be under 100MB');
        return;
      }
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
      setFileType(file.type.startsWith('image/') ? 'image' : 'video');
      setError('');
    }
  };

  const startWebcamRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setWebcamStream(stream);
      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const file = new File([blob], `recording-${Date.now()}.webm`, { type: 'video/webm' });
        setVideoFile(file);
        setVideoPreview(URL.createObjectURL(blob));
        setFileType('video');
        stream.getTracks().forEach(t => t.stop());
        setWebcamStream(null);
      };
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch {
      setError('Could not access camera. Please check permissions or upload a file instead.');
    }
  };

  const stopWebcamRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      setIsRecording(false);
    }
    if (webcamStream) {
      webcamStream.getTracks().forEach(t => t.stop());
      setWebcamStream(null);
    }
  };

  const uploadVideoToServer = async () => {
    if (!videoFile || !bookedAppointment) return;
    setUploadingVideo(true); setError('');
    try {
      const formData = new FormData();
      formData.append('video', videoFile);
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      await api.post(`/appointments/${bookedAppointment._id}/upload-video`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000,
      });
      setVideoUploaded(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload video');
    } finally {
      setUploadingVideo(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">Loading doctor profile...</p>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Doctor not found</h2>
          <Link href="/doctors" className="btn-primary">Browse Doctors</Link>
        </div>
      </div>
    );
  }

  const availableSlots = getAvailableSlots();
  const nextDays = getNext7Days();
  const doctorAvatar = doctor.user?.avatar || getDoctorImage(doctor._id);

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-primary-600 to-blue-700 text-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/doctors" className="text-primary-100 hover:text-white mb-4 inline-flex items-center space-x-1 text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            <span>Back to Doctors</span>
          </Link>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-24 h-24 rounded-2xl overflow-hidden bg-white/20 flex-shrink-0 shadow-lg">
              <Image src={doctorAvatar} alt={doctor.user?.name || 'Doctor'} width={96} height={96} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-bold">{doctor.user?.name || 'Doctor'}</h1>
                {doctor.isAvailable && (
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">Available Now</span>
                )}
              </div>
              <p className="text-primary-100 text-lg font-medium mt-1">{doctor.specialization}</p>
              <p className="text-primary-200 text-sm">{doctor.qualification}</p>
              <div className="flex items-center flex-wrap gap-4 mt-3">
                <div className="flex items-center space-x-1">
                  <div className="flex">{[1,2,3,4,5].map(s => (
                    <svg key={s} className={`w-4 h-4 ${s <= Math.round(doctor.rating || 0) ? 'text-yellow-400' : 'text-white/30'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}</div>
                  <span className="text-sm font-medium">{doctor.rating?.toFixed(1) || 'New'}</span>
                  <span className="text-primary-200 text-sm">({doctor.totalReviews} reviews)</span>
                </div>
                <span className="text-primary-200">|</span>
                <span className="text-primary-100">{doctor.experience} years experience</span>
              </div>
            </div>
            {/* Consultation Fee Card */}
            <div className="bg-white rounded-2xl p-5 text-center shadow-xl min-w-[180px]">
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Consultation Fee</p>
              <p className="text-3xl font-bold text-primary-600 mt-1">৳{doctor.consultationFee}</p>
              <p className="text-xs text-gray-400 mt-1">per consultation</p>
              {bookingStep === 0 && (
                <button onClick={() => setBookingStep(1)} className="mt-3 w-full bg-primary-600 text-white py-2.5 rounded-xl font-semibold hover:bg-primary-700 transition-colors text-sm">
                  Book Appointment
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-4 text-center border border-gray-100">
                <p className="text-2xl font-bold text-primary-600">{doctor.experience}</p>
                <p className="text-xs text-gray-500 mt-1">Years Experience</p>
              </div>
              <div className="bg-white rounded-xl p-4 text-center border border-gray-100">
                <p className="text-2xl font-bold text-primary-600">{doctor.totalReviews}+</p>
                <p className="text-xs text-gray-500 mt-1">Happy Patients</p>
              </div>
              <div className="bg-white rounded-xl p-4 text-center border border-gray-100">
                <p className="text-2xl font-bold text-primary-600">৳{doctor.consultationFee}</p>
                <p className="text-xs text-gray-500 mt-1">Consultation Fee</p>
              </div>
              <div className="bg-white rounded-xl p-4 text-center border border-gray-100">
                <p className="text-2xl font-bold text-primary-600">{doctor.rating?.toFixed(1) || 'N/A'}</p>
                <p className="text-xs text-gray-500 mt-1">Rating</p>
              </div>
            </div>

            {/* About */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-3">About Doctor</h2>
              <p className="text-gray-600 leading-relaxed">{doctor.bio || 'Experienced healthcare professional dedicated to providing quality patient care.'}</p>
            </div>

            {/* Clinic & Availability */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <span className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center text-sm">🏥</span>
                  <span>Clinic Information</span>
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start space-x-3">
                    <span className="text-gray-400 mt-0.5">📍</span>
                    <span className="text-gray-600">{doctor.clinicAddress || 'Not specified'}</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-gray-400 mt-0.5">📞</span>
                    <span className="text-gray-600">{doctor.user?.phone || 'Not specified'}</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-gray-400 mt-0.5">🌐</span>
                    <span className="text-gray-600">{doctor.languages?.join(', ') || 'English'}</span>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <span className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center text-sm">📅</span>
                  <span>Availability</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map((day) => (
                    <span key={day} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${doctor.availableDays?.includes(day) ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-50 text-gray-400 border border-gray-100'}`}>
                      {day.slice(0, 3)}
                    </span>
                  ))}
                </div>
                {doctor.timeSlots?.length > 0 && (
                  <p className="mt-3 text-sm text-gray-500">Hours: {doctor.timeSlots[0].start} - {doctor.timeSlots[0].end}</p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <Link href="/chat" className="inline-flex items-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-700 transition-colors shadow-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                <span>Message Doctor</span>
              </Link>
              <Link href="/chat" className="inline-flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-green-700 transition-colors shadow-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                <span>Video Consultation</span>
              </Link>
            </div>
          </div>

          {/* Right Column - Booking Flow */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm sticky top-6 overflow-hidden">
              {/* Booking Header */}
              {bookingStep > 0 && bookingStep < 5 && (
                <div className="bg-gradient-to-r from-primary-50 to-blue-50 px-6 py-4 border-b border-gray-100">
                  <h3 className="font-bold text-gray-900">Book Appointment</h3>
                  <div className="flex items-center mt-3 space-x-1">
                    {[
                      { n: 1, label: 'Schedule' },
                      { n: 2, label: 'Details' },
                      { n: 3, label: 'Confirm' },
                      { n: 4, label: 'Payment' },
                    ].map((step, idx) => (
                      <div key={step.n} className="flex items-center flex-1">
                        <div className="flex flex-col items-center flex-1">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${bookingStep >= step.n ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
                            {bookingStep > step.n ? '✓' : step.n}
                          </div>
                          <span className={`text-[10px] mt-1 ${bookingStep >= step.n ? 'text-primary-600 font-medium' : 'text-gray-400'}`}>{step.label}</span>
                        </div>
                        {idx < 3 && <div className={`h-0.5 w-full mt-[-12px] ${bookingStep > step.n ? 'bg-primary-600' : 'bg-gray-200'}`}></div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-6">
                {error && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-4 flex items-center space-x-2">
                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                    <span>{error}</span>
                  </div>
                )}

                {/* Step 0: Initial State */}
                {bookingStep === 0 && (
                  <div className="text-center">
                    <div className="bg-primary-50 rounded-xl p-4 mb-4">
                      <p className="text-sm text-gray-500">Consultation Fee</p>
                      <p className="text-3xl font-bold text-primary-600">৳{doctor.consultationFee}</p>
                    </div>
                    <button onClick={() => setBookingStep(1)} className="w-full bg-primary-600 text-white py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors shadow-sm">
                      Book Appointment
                    </button>
                    <p className="text-xs text-gray-400 mt-3">Free cancellation up to 24 hours before appointment</p>
                  </div>
                )}

                {/* Step 1: Select Consultation Type & Date */}
                {bookingStep === 1 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Consultation Type</h4>
                    <div className="space-y-3 mb-5">
                      <button onClick={() => setAppointmentType('video')} className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-start gap-3 ${appointmentType === 'video' ? 'border-primary-600 bg-primary-50' : 'border-gray-200 hover:border-primary-300'}`}>
                        <span className="text-2xl">📹</span>
                        <div className="flex-1">
                          <span className="text-sm font-semibold text-gray-900 block">Live Video Call</span>
                          <span className="text-xs text-gray-500 block mt-0.5">Real-time face-to-face consultation with the doctor at a scheduled time</span>
                        </div>
                        {appointmentType === 'video' && <span className="text-primary-600 text-lg">✓</span>}
                      </button>
                      <button onClick={() => setAppointmentType('recorded-video')} className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-start gap-3 ${appointmentType === 'recorded-video' ? 'border-primary-600 bg-primary-50' : 'border-gray-200 hover:border-primary-300'}`}>
                        <span className="text-2xl">🎬</span>
                        <div className="flex-1">
                          <span className="text-sm font-semibold text-gray-900 block">Recorded Video & Message</span>
                          <span className="text-xs text-gray-500 block mt-0.5">Record a video describing your symptoms. Doctor reviews and sends suggestions & prescription when free.</span>
                        </div>
                        {appointmentType === 'recorded-video' && <span className="text-primary-600 text-lg">✓</span>}
                      </button>
                    </div>

                    {appointmentType === 'video' && (
                      <>
                        <h4 className="font-semibold text-gray-900 mb-3">Select Date</h4>
                        <div className="grid grid-cols-7 gap-1.5 mb-4">
                          {nextDays.slice(0, 7).map((d) => (
                            <button key={d.full} disabled={!d.isAvailable} onClick={() => { setSelectedDate(d.full); setSelectedSlot(null); setError(''); }}
                              className={`p-2 rounded-xl text-center transition-all ${!d.isAvailable ? 'bg-gray-50 text-gray-300 cursor-not-allowed' : selectedDate === d.full ? 'bg-primary-600 text-white shadow-md' : 'bg-gray-50 hover:bg-primary-50 text-gray-700'}`}>
                              <p className="text-[10px] font-medium">{d.day}</p>
                              <p className="text-sm font-bold">{d.date}</p>
                              <p className="text-[10px]">{d.month}</p>
                            </button>
                          ))}
                        </div>
                        {selectedDate && availableSlots.length === 0 && (
                          <div className="bg-orange-50 text-orange-700 p-3 rounded-xl text-sm mb-4">
                            This doctor is not available on the selected day. Please choose another date.
                          </div>
                        )}
                        <button onClick={() => { if (selectedDate && availableSlots.length > 0) { setBookingStep(2); setError(''); } else setError('Please select an available date'); }}
                          className="w-full bg-primary-600 text-white py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50"
                          disabled={!selectedDate || availableSlots.length === 0}>
                          Next: Select Time
                        </button>
                      </>
                    )}

                    {appointmentType === 'recorded-video' && (
                      <>
                        <h4 className="font-semibold text-gray-900 mb-3">Select Date</h4>
                        <div className="grid grid-cols-7 gap-1.5 mb-4">
                          {nextDays.slice(0, 7).map((d) => (
                            <button key={d.full} onClick={() => { setSelectedDate(d.full); setError(''); }}
                              className={`p-2 rounded-xl text-center transition-all ${selectedDate === d.full ? 'bg-primary-600 text-white shadow-md' : 'bg-gray-50 hover:bg-primary-50 text-gray-700'}`}>
                              <p className="text-[10px] font-medium">{d.day}</p>
                              <p className="text-sm font-bold">{d.date}</p>
                              <p className="text-[10px]">{d.month}</p>
                            </button>
                          ))}
                        </div>

                        <h4 className="font-semibold text-gray-900 mb-2">Describe Your Symptoms</h4>
                        <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
                          placeholder="Describe your symptoms, concerns, or questions for the doctor..."
                          className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 mb-3" rows={3} />
                        
                        <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl text-xs text-blue-700 mb-4">
                          <p className="font-medium mb-1">📋 How it works:</p>
                          <ol className="list-decimal list-inside space-y-0.5 text-blue-600">
                            <li>Book your appointment</li>
                            <li>Record a video describing your symptoms</li>
                            <li>Doctor reviews when available</li>
                            <li>Receive suggestions & prescription</li>
                          </ol>
                        </div>

                        <button onClick={() => { if (selectedDate) { setSelectedSlot({ start: 'Flexible', end: 'Flexible' }); setBookingStep(3); setError(''); } else setError('Please select a date'); }}
                          className="w-full bg-primary-600 text-white py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50"
                          disabled={!selectedDate}>
                          Next: Review
                        </button>
                      </>
                    )}
                  </div>
                )}

                {/* Step 2: Select Time Slot */}
                {bookingStep === 2 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Available Time Slots</h4>
                    <p className="text-sm text-gray-500 mb-3">
                      {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>
                    {availableSlots.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">No slots available</p>
                    ) : (
                      <div className="grid grid-cols-2 gap-2 mb-5">
                        {availableSlots.map((slot, idx) => (
                          <button key={idx} onClick={() => setSelectedSlot(slot)}
                            className={`p-3 rounded-xl border-2 text-center transition-all ${selectedSlot?.start === slot.start ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-gray-200 hover:border-primary-300 text-gray-700'}`}>
                            <span className="text-sm font-semibold">{slot.start}</span>
                            <span className="text-xs text-gray-400 block">{slot.start} - {slot.end}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    <h4 className="font-semibold text-gray-900 mb-2">Symptoms / Notes (Optional)</h4>
                    <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
                      placeholder="Briefly describe your symptoms..."
                      className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 mb-4" rows={2} />

                    <div className="flex space-x-2">
                      <button onClick={() => setBookingStep(1)} className="flex-1 py-3 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50">Back</button>
                      <button onClick={() => { if (selectedSlot) { setBookingStep(3); setError(''); } else setError('Please select a time slot'); }}
                        className="flex-1 bg-primary-600 text-white py-3 rounded-xl font-semibold hover:bg-primary-700 disabled:opacity-50" disabled={!selectedSlot}>
                        Next: Review
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: Review & Confirm */}
                {bookingStep === 3 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4">Review Appointment</h4>
                    <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-3">
                      <div className="flex items-center space-x-3 pb-3 border-b border-gray-200">
                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center text-primary-700 font-bold text-sm">
                          {doctor.user?.name?.charAt(0) || 'D'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{doctor.user?.name}</p>
                          <p className="text-xs text-primary-600">{doctor.specialization}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-gray-400 text-xs">Date</p>
                          <p className="font-medium text-gray-900">{new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs">Time</p>
                          <p className="font-medium text-gray-900">{selectedSlot?.start} - {selectedSlot?.end}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs">Type</p>
                          <p className="font-medium text-gray-900">{appointmentType === 'video' ? 'Live Video Call' : 'Recorded Video & Message'}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs">Fee</p>
                          <p className="font-bold text-primary-600">৳{doctor.consultationFee}</p>
                        </div>
                      </div>
                    </div>

                    {!user && (
                      <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-xl text-sm mb-4 text-yellow-700">
                        Please <Link href="/login" className="underline font-medium">login</Link> to continue booking.
                      </div>
                    )}

                    <div className="flex space-x-2">
                      <button onClick={() => setBookingStep(appointmentType === 'recorded-video' ? 1 : 2)} className="flex-1 py-3 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50">Back</button>
                      <button onClick={() => { if (user) { setBookingStep(4); setError(''); } else router.push('/login'); }}
                        className="flex-1 bg-primary-600 text-white py-3 rounded-xl font-semibold hover:bg-primary-700">
                        Next: Payment
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 4: Payment */}
                {bookingStep === 4 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4">Payment Method</h4>

                    {/* Fee Summary */}
                    <div className="bg-gray-50 rounded-xl p-4 mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-500">Consultation Fee</span>
                        <span className="font-medium">৳{doctor.consultationFee}</span>
                      </div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-500">Platform Fee</span>
                        <span className="font-medium text-green-600">Free</span>
                      </div>
                      <hr className="my-2" />
                      <div className="flex justify-between">
                        <span className="font-bold text-gray-900">Total</span>
                        <span className="font-bold text-primary-600 text-lg">৳{doctor.consultationFee}</span>
                      </div>
                    </div>

                    <div className="space-y-2 mb-5">
                      <label className={`flex items-center p-3.5 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'pay-later' ? 'border-primary-600 bg-primary-50' : 'border-gray-200 hover:border-primary-300'}`}>
                        <input type="radio" name="payment" value="pay-later" checked={paymentMethod === 'pay-later'} onChange={() => setPaymentMethod('pay-later')} className="mr-3 accent-primary-600" />
                        <div className="flex-1">
                          <span className="font-medium text-gray-900 text-sm">Pay at Clinic</span>
                          <p className="text-xs text-gray-500">Pay directly at the clinic</p>
                        </div>
                        <span className="text-green-600 text-xs font-medium">Cash/Card</span>
                      </label>
                      <label className={`flex items-center p-3.5 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'bkash' ? 'border-primary-600 bg-primary-50' : 'border-gray-200 hover:border-primary-300'}`}>
                        <input type="radio" name="payment" value="bkash" checked={paymentMethod === 'bkash'} onChange={() => setPaymentMethod('bkash')} className="mr-3 accent-primary-600" />
                        <div className="flex-1">
                          <span className="font-medium text-gray-900 text-sm">bKash</span>
                          <p className="text-xs text-gray-500">Pay via bKash mobile banking</p>
                        </div>
                        <span className="text-pink-600 text-xs font-bold">bKash</span>
                      </label>
                      <label className={`flex items-center p-3.5 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'nagad' ? 'border-primary-600 bg-primary-50' : 'border-gray-200 hover:border-primary-300'}`}>
                        <input type="radio" name="payment" value="nagad" checked={paymentMethod === 'nagad'} onChange={() => setPaymentMethod('nagad')} className="mr-3 accent-primary-600" />
                        <div className="flex-1">
                          <span className="font-medium text-gray-900 text-sm">Nagad</span>
                          <p className="text-xs text-gray-500">Pay via Nagad mobile banking</p>
                        </div>
                        <span className="text-orange-600 text-xs font-bold">Nagad</span>
                      </label>
                      <label className={`flex items-center p-3.5 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'card' ? 'border-primary-600 bg-primary-50' : 'border-gray-200 hover:border-primary-300'}`}>
                        <input type="radio" name="payment" value="card" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} className="mr-3 accent-primary-600" />
                        <div className="flex-1">
                          <span className="font-medium text-gray-900 text-sm">Credit/Debit Card</span>
                          <p className="text-xs text-gray-500">Visa, Mastercard, etc.</p>
                        </div>
                        <span className="text-blue-600 text-xs font-medium">Card</span>
                      </label>
                    </div>

                    <div className="flex space-x-2">
                      <button onClick={() => setBookingStep(3)} className="flex-1 py-3 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50">Back</button>
                      <button onClick={handleBooking} disabled={bookingLoading}
                        className="flex-1 bg-primary-600 text-white py-3 rounded-xl font-semibold hover:bg-primary-700 disabled:opacity-60 flex items-center justify-center space-x-2">
                        {bookingLoading ? (
                          <><div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div><span>Processing...</span></>
                        ) : (
                          <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg><span>Confirm & Book</span></>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 5: Success */}
                {bookingStep === 5 && bookingSuccess && (
                  <div className="text-center py-4">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Appointment Confirmed!</h3>
                    <p className="text-sm text-gray-500 mb-4">Your appointment has been booked successfully</p>

                    <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl p-5 mb-5 text-left">
                      <div className="text-center mb-3">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Appointment Number</p>
                        <p className="text-2xl font-bold text-primary-600 font-mono mt-1">
                          {bookedAppointment?.serialNumber || 'N/A'}
                        </p>
                      </div>
                      <hr className="my-3" />
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-gray-400 text-xs">Date</p>
                          <p className="font-medium text-gray-900">{new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs">Time</p>
                          <p className="font-medium text-gray-900">{selectedSlot?.start}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs">Doctor</p>
                          <p className="font-medium text-gray-900">{doctor.user?.name}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs">Type</p>
                          <p className="font-medium text-gray-900">{appointmentType === 'video' ? 'Live Video Call' : 'Recorded Video & Message'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Video Upload Section for recorded-video type */}
                    {appointmentType === 'recorded-video' && !videoUploaded && (
                      <div className="mb-5">
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                          <h4 className="font-semibold text-amber-800 text-sm mb-2 flex items-center gap-2">
                            <span>🎬</span> Upload Video or Image
                          </h4>
                          <p className="text-xs text-amber-600 mb-3">Record/upload a video or upload an image describing your symptoms.</p>

                          {/* Webcam Live Preview */}
                          {isRecording && webcamStream && (
                            <div className="mb-3 relative rounded-lg overflow-hidden bg-black">
                              <video autoPlay playsInline muted ref={(el) => { if (el) el.srcObject = webcamStream; }} className="w-full max-h-56 object-contain" />
                              <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-red-600 text-white px-2 py-1 rounded-lg text-xs font-bold">
                                <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                                REC
                              </div>
                              <button onClick={stopWebcamRecording} className="absolute bottom-2 right-2 px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700">Stop</button>
                            </div>
                          )}

                          {/* File Preview */}
                          {videoPreview && !isRecording && (
                            <div className="mb-3 rounded-lg overflow-hidden bg-black">
                              {fileType === 'image' ? (
                                <img src={videoPreview} alt="Preview" className="w-full max-h-48 object-contain" />
                              ) : (
                                <video src={videoPreview} controls className="w-full max-h-48 object-contain" />
                              )}
                            </div>
                          )}

                          {/* Controls */}
                          {!isRecording && (
                            <div className="grid grid-cols-3 gap-2 mb-3">
                              <label className="flex flex-col items-center justify-center p-3 bg-white border-2 border-dashed border-amber-300 rounded-xl cursor-pointer hover:border-amber-400 hover:bg-amber-50 transition-all">
                                <svg className="w-5 h-5 text-amber-500 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                                <span className="text-xs font-medium text-amber-700">Upload Video</span>
                                <span className="text-[10px] text-amber-500">mp4, webm</span>
                                <input type="file" accept="video/*" onChange={handleVideoFileSelect} className="hidden" />
                              </label>
                              <label className="flex flex-col items-center justify-center p-3 bg-white border-2 border-dashed border-amber-300 rounded-xl cursor-pointer hover:border-amber-400 hover:bg-amber-50 transition-all">
                                <svg className="w-5 h-5 text-amber-500 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                <span className="text-xs font-medium text-amber-700">Upload Image</span>
                                <span className="text-[10px] text-amber-500">jpg, png</span>
                                <input type="file" accept="image/*" onChange={(e) => { setFileType('image'); handleVideoFileSelect(e); }} className="hidden" />
                              </label>
                              <button onClick={startWebcamRecording} className="flex flex-col items-center justify-center p-3 bg-white border-2 border-dashed border-amber-300 rounded-xl hover:border-amber-400 hover:bg-amber-50 transition-all">
                                <svg className="w-5 h-5 text-amber-500 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                <span className="text-xs font-medium text-amber-700">Use Webcam</span>
                                <span className="text-[10px] text-amber-500">Record now</span>
                              </button>
                            </div>
                          )}

                          {/* Upload button */}
                          {videoFile && !isRecording && (
                            <button onClick={uploadVideoToServer} disabled={uploadingVideo}
                              className="w-full bg-amber-600 text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-amber-700 disabled:opacity-60 flex items-center justify-center gap-2">
                              {uploadingVideo ? (
                                <><div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div><span>Uploading...</span></>
                              ) : (
                                <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg><span>Upload {fileType === 'image' ? 'Image' : 'Video'}</span></>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Video uploaded confirmation */}
                    {appointmentType === 'recorded-video' && videoUploaded && (
                      <div className="mb-5 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-green-800">File Uploaded Successfully!</p>
                          <p className="text-xs text-green-600">The doctor will review your submission and respond soon.</p>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Link href="/dashboard" className="block w-full bg-primary-600 text-white py-3 rounded-xl font-semibold hover:bg-primary-700 text-center">
                        Go to Dashboard
                      </Link>
                      <Link href="/doctors" className="block w-full py-3 rounded-xl font-medium text-gray-700 hover:bg-gray-50 text-center border border-gray-200">
                        Book Another
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DoctorProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full"></div>
      </div>
    }>
      <DoctorProfileContent />
    </Suspense>
  );
}