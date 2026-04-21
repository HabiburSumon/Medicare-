'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface Prescription {
  _id: string;
  diagnosis: string;
  symptoms: string[];
  medicines: { name: string; dosage: string; duration: string; frequency: string }[];
  notes: string;
  followUpDate: string;
  createdAt: string;
  doctor: { name: string; email: string };
}

interface Appointment {
  _id: string;
  serialNumber: string;
  appointmentDate: string;
  timeSlot: { start: string; end: string };
  status: string;
  type: string;
  patient: { name: string; email: string; phone: string };
}

export default function PatientHistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const patientId = params.id as string;
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [totalVisits, setTotalVisits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'prescriptions' | 'appointments'>('appointments');

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'doctor')) { router.push('/dashboard'); return; }
    if (user && patientId) fetchHistory();
  }, [user, authLoading, patientId]);

  const fetchHistory = async () => {
    try {
      const res = await api.get(`/prescriptions/patient/${patientId}/history`);
      setPrescriptions(res.data.data.prescriptions);
      setAppointments(res.data.data.appointments);
      setTotalVisits(res.data.data.totalVisits);
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700',
      confirmed: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-700 mb-2 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Patient Medical History</h1>
            <p className="text-gray-500 mt-1">Total visits: {totalVisits}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('appointments')}
            className={`px-5 py-2.5 rounded-lg font-medium transition ${
              activeTab === 'appointments' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-50 border'
            }`}
          >
            Appointments ({appointments.length})
          </button>
          <button
            onClick={() => setActiveTab('prescriptions')}
            className={`px-5 py-2.5 rounded-lg font-medium transition ${
              activeTab === 'prescriptions' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-50 border'
            }`}
          >
            Prescriptions ({prescriptions.length})
          </button>
        </div>

        {activeTab === 'appointments' && (
          <div className="space-y-3">
            {appointments.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center text-gray-500">No appointment history found.</div>
            ) : (
              appointments.map((apt) => (
                <div key={apt._id} className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-sm bg-gray-100 px-2 py-0.5 rounded">{apt.serialNumber}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusBadge(apt.status)}`}>{apt.status}</span>
                        <span className="text-xs text-gray-400 capitalize">{apt.type}</span>
                      </div>
                      <p className="text-gray-800 font-medium">{formatDate(apt.appointmentDate)}</p>
                      <p className="text-sm text-gray-500">{apt.timeSlot.start} - {apt.timeSlot.end}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'prescriptions' && (
          <div className="space-y-4">
            {prescriptions.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center text-gray-500">No prescriptions found.</div>
            ) : (
              prescriptions.map((rx) => (
                <div key={rx._id} className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">{rx.diagnosis || 'No diagnosis specified'}</h3>
                      <p className="text-sm text-gray-500">{formatDate(rx.createdAt)}</p>
                    </div>
                    {rx.followUpDate && (
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                        Follow-up: {formatDate(rx.followUpDate)}
                      </span>
                    )}
                  </div>
                  {rx.symptoms && rx.symptoms.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-1">Symptoms</p>
                      <div className="flex flex-wrap gap-1">
                        {rx.symptoms.map((s, i) => (
                          <span key={i} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {rx.medicines && rx.medicines.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-1">Medicines</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {rx.medicines.map((med, i) => (
                          <div key={i} className="bg-blue-50 rounded-lg p-3">
                            <p className="font-medium text-sm text-blue-900">{med.name}</p>
                            <p className="text-xs text-blue-700">{med.dosage} &bull; {med.frequency} &bull; {med.duration}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {rx.notes && <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">{rx.notes}</p>}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}