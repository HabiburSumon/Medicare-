'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface Medicine {
  name: string;
  dosage: string;
  duration: string;
  instructions: string;
}

interface Prescription {
  _id: string;
  appointment: any;
  patient: { _id: string; name: string; email: string; phone: string };
  doctor: { _id: string; name: string; email: string; phone: string };
  diagnosis: string;
  symptoms: string[];
  medicines: Medicine[];
  tests: string[];
  testResults?: { testName: string; fileUrl: string; fileName: string; uploadedAt: string }[];
  notes: string;
  followUpDate: string;
  createdAt: string;
}

export default function PrescriptionsPage() {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [testResultName, setTestResultName] = useState('');
  const [uploadingTest, setUploadingTest] = useState(false);
  const [testUploadError, setTestUploadError] = useState('');

  const API_BASE = 'http://localhost:5000';

  const handleUploadTestResult = async (prescriptionId: string) => {
    const fileInput = document.getElementById('testResultFile') as HTMLInputElement;
    const file = fileInput?.files?.[0];
    if (!file) { setTestUploadError('Please select a file'); return; }
    if (!testResultName.trim()) { setTestUploadError('Please enter a test name'); return; }

    setUploadingTest(true);
    setTestUploadError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('testName', testResultName.trim());
      await api.post(`/prescriptions/${prescriptionId}/test-results`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setTestResultName('');
      if (fileInput) fileInput.value = '';
      const res = await api.get('/prescriptions');
      const newData = res.data.data || [];
      setPrescriptions(newData);
      const refreshed = newData.find((p: Prescription) => p._id === prescriptionId);
      if (refreshed) setSelectedPrescription(refreshed);
    } catch (err: any) {
      setTestUploadError(err.response?.data?.message || 'Failed to upload test result');
    } finally {
      setUploadingTest(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const res = await api.get('/prescriptions');
      setPrescriptions(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch prescriptions');
    } finally {
      setLoading(false);
    }
  };

  const filteredPrescriptions = prescriptions.filter((p) => {
    const matchesSearch =
      !searchQuery ||
      p.diagnosis?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.doctor?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.symptoms?.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    if (filter === 'recent') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return matchesSearch && new Date(p.createdAt) >= thirtyDaysAgo;
    }
    return matchesSearch;
  });

  const handleDownloadPDF = (prescription: Prescription) => {
    // Generate a printable prescription
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Prescription - ${prescription._id?.slice(-8)?.toUpperCase()}</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; color: #333; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
          .prescription-id { color: #666; font-size: 14px; }
          .patient-info { background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 25px; }
          .patient-info h3 { margin: 0 0 8px 0; color: #1e40af; font-size: 16px; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 14px; }
          .section { margin-bottom: 25px; }
          .section h3 { color: #1e40af; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 12px; }
          .medicine-table { width: 100%; border-collapse: collapse; font-size: 14px; }
          .medicine-table th { background: #eff6ff; padding: 10px; text-align: left; border: 1px solid #e2e8f0; }
          .medicine-table td { padding: 10px; border: 1px solid #e2e8f0; }
          .tests-list { display: flex; flex-wrap: wrap; gap: 8px; }
          .test-badge { background: #fef3c7; color: #92400e; padding: 4px 12px; border-radius: 20px; font-size: 13px; }
          .symptom-badge { background: #fce7f3; color: #9d174d; padding: 4px 12px; border-radius: 20px; font-size: 13px; }
          .notes { background: #f0fdf4; padding: 12px; border-radius: 8px; border-left: 4px solid #22c55e; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #e2e8f0; display: flex; justify-content: space-between; }
          .signature { text-align: center; }
          .signature-line { width: 200px; border-top: 1px solid #333; margin-top: 60px; padding-top: 8px; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">🏥 MediCare+ Digital Prescription</div>
            <p style="margin:4px 0 0 0; color:#666; font-size:13px;">Telemedicine Platform</p>
          </div>
          <div style="text-align:right">
            <div class="prescription-id">Rx #${prescription._id?.slice(-8)?.toUpperCase()}</div>
            <div style="font-size:13px; color:#666;">${new Date(prescription.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
          </div>
        </div>

        <div class="patient-info">
          <h3>📋 Patient Information</h3>
          <div class="info-grid">
            <div><strong>Patient:</strong> ${prescription.patient?.name || 'N/A'}</div>
            <div><strong>Doctor:</strong> ${prescription.doctor?.name || 'N/A'}</div>
            <div><strong>Date:</strong> ${new Date(prescription.createdAt).toLocaleDateString()}</div>
            ${prescription.followUpDate ? `<div><strong>Follow-up:</strong> ${new Date(prescription.followUpDate).toLocaleDateString()}</div>` : ''}
          </div>
        </div>

        <div class="section">
          <h3>🔍 Diagnosis</h3>
          <p style="font-size:15px; font-weight:500;">${prescription.diagnosis}</p>
        </div>

        ${prescription.symptoms?.length ? `
        <div class="section">
          <h3>🩺 Symptoms</h3>
          <div class="tests-list">${prescription.symptoms.map((s) => `<span class="symptom-badge">${s}</span>`).join('')}</div>
        </div>` : ''}

        <div class="section">
          <h3>💊 Prescribed Medicines</h3>
          <table class="medicine-table">
            <thead>
              <tr><th>#</th><th>Medicine</th><th>Dosage</th><th>Duration</th><th>Instructions</th></tr>
            </thead>
            <tbody>
              ${prescription.medicines.map((med, i) => `
                <tr>
                  <td>${i + 1}</td>
                  <td><strong>${med.name}</strong></td>
                  <td>${med.dosage}</td>
                  <td>${med.duration}</td>
                  <td>${med.instructions || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        ${prescription.tests?.length ? `
        <div class="section">
          <h3>🧪 Recommended Tests</h3>
          <div class="tests-list">${prescription.tests.map((t) => `<span class="test-badge">${t}</span>`).join('')}</div>
        </div>` : ''}

        ${prescription.notes ? `
        <div class="section">
          <h3>📝 Additional Notes</h3>
          <div class="notes">${prescription.notes}</div>
        </div>` : ''}

        <div class="footer">
          <div style="font-size:12px; color:#999;">
            <p>This is a digitally generated prescription from MediCare+ Platform.</p>
            <p>Verify at: medicare.com/prescriptions/${prescription._id}</p>
          </div>
          <div class="signature">
            <div class="signature-line">
              Dr. ${prescription.doctor?.name || 'Attending Physician'}
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Loading prescriptions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-blue-700 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold">My Prescriptions</h1>
              <p className="text-primary-100 mt-1">View and manage your digital prescriptions</p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center space-x-3">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 text-sm">
                <span className="text-primary-200">Total:</span>
                <span className="font-bold ml-1">{prescriptions.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by diagnosis, doctor, or symptoms..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-2">
              {['all', 'recent'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    filter === f
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {f === 'all' ? 'All' : 'Last 30 Days'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        {!user ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <div className="text-6xl mb-4">🔒</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Login Required</h3>
            <p className="text-gray-500 mb-6">Please login to view your prescriptions</p>
            <Link href="/login" className="btn-primary inline-block">Login Now</Link>
          </div>
        ) : filteredPrescriptions.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {prescriptions.length === 0 ? 'No Prescriptions Yet' : 'No Matching Prescriptions'}
            </h3>
            <p className="text-gray-500 mb-6">
              {prescriptions.length === 0
                ? 'Your prescriptions will appear here after your doctor creates one'
                : 'Try adjusting your search or filter'}
            </p>
            {prescriptions.length === 0 && (
              <Link href="/doctors" className="btn-primary inline-block">Find a Doctor</Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPrescriptions.map((prescription) => (
              <div
                key={prescription._id}
                className="bg-white rounded-2xl border border-gray-100 hover:shadow-md transition-all overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {/* Left: Prescription Info */}
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl">📋</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-gray-900 text-lg">{prescription.diagnosis}</h3>
                          <span className="px-2.5 py-0.5 bg-primary-50 text-primary-700 rounded-full text-xs font-medium">
                            Rx #{prescription._id?.slice(-6)?.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 mt-1.5 text-sm text-gray-500">
                          <span className="flex items-center space-x-1">
                            <span>👨‍⚕️</span>
                            <span className="font-medium text-gray-700">{prescription.doctor?.name || 'Doctor'}</span>
                          </span>
                          <span className="text-gray-300">|</span>
                          <span>📅 {formatDate(prescription.createdAt)}</span>
                          {prescription.followUpDate && (
                            <>
                              <span className="text-gray-300">|</span>
                              <span className="text-orange-600 font-medium">🔄 Follow-up: {formatDate(prescription.followUpDate)}</span>
                            </>
                          )}
                        </div>

                        {/* Symptoms */}
                        {prescription.symptoms?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {prescription.symptoms.slice(0, 4).map((symptom, idx) => (
                              <span key={idx} className="px-2 py-0.5 bg-red-50 text-red-600 rounded-md text-xs font-medium">
                                {symptom}
                              </span>
                            ))}
                            {prescription.symptoms.length > 4 && (
                              <span className="px-2 py-0.5 bg-gray-50 text-gray-500 rounded-md text-xs">
                                +{prescription.symptoms.length - 4} more
                              </span>
                            )}
                          </div>
                        )}

                        {/* Medicine Count */}
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-sm text-gray-500">
                            💊 {prescription.medicines?.length || 0} medicine{prescription.medicines?.length !== 1 ? 's' : ''}
                          </span>
                          {prescription.tests?.length > 0 && (
                            <span className="text-sm text-gray-500">
                              🧪 {prescription.tests.length} test{prescription.tests.length !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => {
                          setSelectedPrescription(prescription);
                          setShowModal(true);
                        }}
                        className="px-4 py-2.5 border border-primary-200 text-primary-600 rounded-xl text-sm font-semibold hover:bg-primary-50 transition-colors"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => handleDownloadPDF(prescription)}
                        className="px-4 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors flex items-center space-x-1.5"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Prescription Detail Modal */}
      {showModal && selectedPrescription && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
            <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={() => setShowModal(false)}></div>
            <div className="relative bg-white rounded-2xl max-w-2xl w-full shadow-2xl transform transition-all z-10 max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-gradient-to-r from-primary-600 to-blue-700 text-white px-6 py-4 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold">Prescription Details</h2>
                    <p className="text-primary-200 text-sm mt-0.5">Rx #{selectedPrescription._id?.slice(-6)?.toUpperCase()}</p>
                  </div>
                  <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-5">
                {/* Patient & Doctor Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-primary-50 rounded-xl p-4">
                    <p className="text-xs text-primary-600 uppercase tracking-wide font-medium">Patient</p>
                    <p className="font-bold text-gray-900 mt-1">{selectedPrescription.patient?.name || 'N/A'}</p>
                    <p className="text-sm text-gray-500">{selectedPrescription.patient?.email}</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4">
                    <p className="text-xs text-blue-600 uppercase tracking-wide font-medium">Doctor</p>
                    <p className="font-bold text-gray-900 mt-1">{selectedPrescription.doctor?.name || 'N/A'}</p>
                    <p className="text-sm text-gray-500">{selectedPrescription.doctor?.email}</p>
                  </div>
                </div>

                {/* Date & Follow-up */}
                <div className="flex flex-wrap gap-3">
                  <div className="bg-gray-50 rounded-xl px-4 py-2.5 flex items-center space-x-2">
                    <span>📅</span>
                    <div>
                      <p className="text-xs text-gray-400">Prescribed</p>
                      <p className="text-sm font-semibold text-gray-900">{formatDate(selectedPrescription.createdAt)}</p>
                    </div>
                  </div>
                  {selectedPrescription.followUpDate && (
                    <div className="bg-orange-50 rounded-xl px-4 py-2.5 flex items-center space-x-2">
                      <span>🔄</span>
                      <div>
                        <p className="text-xs text-orange-500">Follow-up</p>
                        <p className="text-sm font-semibold text-orange-700">{formatDate(selectedPrescription.followUpDate)}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Diagnosis */}
                <div>
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-2 flex items-center space-x-2">
                    <span>🔍</span><span>Diagnosis</span>
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-gray-900 font-medium">{selectedPrescription.diagnosis}</p>
                  </div>
                </div>

                {/* Symptoms */}
                {selectedPrescription.symptoms?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-2 flex items-center space-x-2">
                      <span>🩺</span><span>Symptoms</span>
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedPrescription.symptoms.map((symptom, idx) => (
                        <span key={idx} className="px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-sm font-medium border border-red-100">
                          {symptom}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Medicines */}
                <div>
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-2 flex items-center space-x-2">
                    <span>💊</span><span>Prescribed Medicines</span>
                  </h3>
                  <div className="space-y-2">
                    {selectedPrescription.medicines.map((med, idx) => (
                      <div key={idx} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-bold text-gray-900">{med.name}</p>
                            <div className="flex flex-wrap gap-3 mt-1.5 text-sm text-gray-600">
                              <span className="flex items-center space-x-1">
                                <span className="text-primary-500">💉</span>
                                <span>Dosage: <strong>{med.dosage}</strong></span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <span className="text-orange-500">⏱️</span>
                                <span>Duration: <strong>{med.duration}</strong></span>
                              </span>
                            </div>
                          </div>
                          <span className="bg-primary-100 text-primary-700 px-2.5 py-1 rounded-lg text-xs font-bold">
                            #{idx + 1}
                          </span>
                        </div>
                        {med.instructions && (
                          <p className="mt-2 text-sm text-gray-500 bg-white rounded-lg p-2 border border-gray-100">
                            📋 {med.instructions}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tests */}
                {selectedPrescription.tests?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-2 flex items-center space-x-2">
                      <span>🧪</span><span>Recommended Tests</span>
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedPrescription.tests.map((test, idx) => (
                        <span key={idx} className="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-sm font-medium border border-amber-100">
                          {test}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {selectedPrescription.notes && (
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-2 flex items-center space-x-2">
                      <span>📝</span><span>Doctor's Notes</span>
                    </h3>
                    <div className="bg-green-50 rounded-xl p-4 border-l-4 border-green-400 text-gray-700">
                      {selectedPrescription.notes}
                    </div>
                  </div>
                )}

                {/* Uploaded Test Results */}
                {(selectedPrescription as any).testResults?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-2 flex items-center space-x-2">
                      <span>📎</span><span>Uploaded Test Results</span>
                    </h3>
                    <div className="space-y-2">
                      {(selectedPrescription as any).testResults.map((result: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between bg-teal-50 rounded-xl p-3 border border-teal-100">
                          <div className="flex items-center space-x-3">
                            <span className="text-xl">{result.fileName?.endsWith('.pdf') ? '📄' : '🖼️'}</span>
                            <div>
                              <p className="font-semibold text-gray-900 text-sm">{result.testName}</p>
                              <p className="text-xs text-gray-500">{result.fileName} • {formatDate(result.uploadedAt)}</p>
                            </div>
                          </div>
                          <a href={`${API_BASE}${result.fileUrl}`} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-teal-600 text-white rounded-lg text-xs font-medium hover:bg-teal-700">View</a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload Test Results (Patient only) */}
                {user?.role === 'patient' && selectedPrescription.tests?.length > 0 && (
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3 flex items-center space-x-2">
                      <span>📤</span><span>Upload Test Results</span>
                    </h3>
                    <div className="space-y-3">
                      <input type="text" value={testResultName} onChange={(e) => setTestResultName(e.target.value)} placeholder="Test name (e.g., Blood Test, X-Ray)" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                      <div className="flex items-center gap-3">
                        <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-primary-400 hover:bg-primary-50/50 transition-all text-sm text-gray-600">
                          <span>📁</span><span>Choose File</span>
                          <input id="testResultFile" type="file" accept="image/*,.pdf" className="hidden" />
                        </label>
                        <button onClick={() => handleUploadTestResult(selectedPrescription._id)} disabled={uploadingTest} className="px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 disabled:opacity-60 transition-colors">
                          {uploadingTest ? 'Uploading...' : 'Upload'}
                        </button>
                      </div>
                      {testUploadError && <p className="text-xs text-red-600">{testUploadError}</p>}
                      <p className="text-xs text-gray-400">Supported: Images (JPG, PNG, GIF, WebP) and PDF files. Max 50MB.</p>
                    </div>
                  </div>
                )}

                {/* Order Medicines Button */}
                {selectedPrescription.medicines?.length > 0 && (
                  <div className="pt-2">
                    <Link
                      href="/medicines"
                      className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors"
                    >
                      <span>🛒</span>
                      <span>Order Medicines from this Prescription</span>
                    </Link>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-b-2xl flex items-center justify-between">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-white transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => handleDownloadPDF(selectedPrescription)}
                  className="px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Print / Download PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}