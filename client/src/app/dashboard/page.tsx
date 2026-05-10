'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';

// ==================== SHARED: Appointment Detail Modal ====================
function AppointmentDetailModal({ appointment, onClose, userRole, onWritePrescription }: { appointment: any; onClose: () => void; userRole?: string; onWritePrescription?: () => void }) {
  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';
  const formatTime = (slot: any) => slot ? `${slot.start || 'N/A'} - ${slot.end || 'N/A'}` : 'N/A';
  const statusColor = (s: string) =>
    s === 'confirmed' ? 'bg-green-100 text-green-700 border-green-200' :
    s === 'pending' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
    s === 'completed' ? 'bg-blue-100 text-blue-700 border-blue-200' :
    'bg-red-100 text-red-700 border-red-200';

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [videoUploaded, setVideoUploaded] = useState(!!appointment.recordedVideoUrl);
  const [uploadError, setUploadError] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);
  const [fileType, setFileType] = useState<'video' | 'image'>('video');

  const API_BASE = 'http://localhost:5000';

  const handleVideoFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) { setUploadError('File must be under 100MB'); return; }
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
      setUploadError('');
      if (file.type.startsWith('image/')) {
        setFileType('image');
      } else {
        setFileType('video');
      }
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
      setUploadError('Could not access camera.');
    }
  };

  const stopWebcamRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
    setIsRecording(false);
  };

  const uploadVideo = async () => {
    if (!videoFile) return;
    setUploadingVideo(true); setUploadError('');
    try {
      const formData = new FormData();
      formData.append('video', videoFile);
      await api.post(`/appointments/${appointment._id}/upload-video`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000,
      });
      setVideoUploaded(true);
    } catch (err: any) {
      setUploadError(err.response?.data?.message || 'Failed to upload video');
    } finally {
      setUploadingVideo(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-t-2xl px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Appointment Details</h2>
              <p className="text-primary-100 text-sm mt-1">Serial #{appointment.serialNumber || appointment._id?.slice(-6).toUpperCase()}</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Status */}
          <div className="flex items-center justify-between">
            <span className={'px-3 py-1.5 rounded-full text-xs font-semibold border ' + statusColor(appointment.status)}>
              {appointment.status?.toUpperCase()}
            </span>
            <div className="flex items-center gap-2">
              {appointment.type === 'recorded-video' && (
                <span className="text-xs bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full font-medium">🎬 Recorded Video</span>
              )}
              {appointment.type === 'video' && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-medium">📹 Live Video</span>
              )}
            </div>
          </div>

          {/* Date & Time */}
          <div className="bg-primary-50 rounded-xl p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-primary-600 font-medium uppercase tracking-wide">Date</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">{formatDate(appointment.appointmentDate || appointment.date)}</p>
              </div>
              <div>
                <p className="text-xs text-primary-600 font-medium uppercase tracking-wide">Time Slot</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">{formatTime(appointment.timeSlot)}</p>
              </div>
            </div>
          </div>

          {/* Recorded Video Section */}
          {appointment.type === 'recorded-video' && (
            <div>
              <h3 className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-3">Patient Video</h3>
              {appointment.recordedVideoUrl && videoUploaded ? (
                <div className="bg-gray-900 rounded-xl overflow-hidden">
                  <video src={`${API_BASE}${appointment.recordedVideoUrl}`} controls className="w-full max-h-56 object-contain" />
                  <div className="px-3 py-2 bg-gray-800 text-gray-300 text-xs flex items-center gap-2">
                    <span>🎬</span> Patient symptom video
                  </div>
                </div>
              ) : userRole === 'patient' && !videoUploaded ? (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="text-sm font-semibold text-amber-800 mb-2">Upload your symptom video or image</p>
                  
                  {isRecording && webcamStream && (
                    <div className="mb-3 rounded-xl overflow-hidden bg-black relative">
                      <video
                        ref={(videoEl) => {
                          if (videoEl && webcamStream) {
                            videoEl.srcObject = webcamStream;
                            videoEl.play();
                          }
                        }}
                        autoPlay
                        playsInline
                        muted
                        className="w-full max-h-48 object-contain"
                      />
                      <div className="absolute top-2 left-2 flex items-center gap-2 bg-red-600 text-white px-2.5 py-1 rounded-full text-xs font-medium">
                        <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                        REC
                      </div>
                      <div className="absolute bottom-2 right-2">
                        <button onClick={stopWebcamRecording} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 flex items-center gap-2">
                          <span className="w-3 h-3 bg-white rounded-sm"></span>
                          Stop Recording
                        </button>
                      </div>
                    </div>
                  )}

                  {videoPreview && !isRecording && (
                    <div className="mb-3 rounded-lg overflow-hidden bg-black">
                      {fileType === 'image' ? (
                        <img src={videoPreview} alt="Preview" className="w-full max-h-48 object-contain" />
                      ) : (
                        <video src={videoPreview} controls className="w-full max-h-40 object-contain" />
                      )}
                    </div>
                  )}
                  
                  {!isRecording && (
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <label className="flex flex-col items-center p-2.5 bg-white border-2 border-dashed border-amber-300 rounded-lg cursor-pointer hover:bg-amber-50 text-center">
                        <span className="text-lg mb-0.5">📁</span>
                        <span className="text-xs font-medium text-amber-700">Upload Video</span>
                        <input type="file" accept="video/*" onChange={handleVideoFileSelect} className="hidden" />
                      </label>
                      <label className="flex flex-col items-center p-2.5 bg-white border-2 border-dashed border-amber-300 rounded-lg cursor-pointer hover:bg-amber-50 text-center">
                        <span className="text-lg mb-0.5">🖼️</span>
                        <span className="text-xs font-medium text-amber-700">Upload Image</span>
                        <input type="file" accept="image/*" onChange={handleVideoFileSelect} className="hidden" />
                      </label>
                      <button onClick={startWebcamRecording} className="flex flex-col items-center p-2.5 bg-white border-2 border-dashed border-amber-300 rounded-lg hover:bg-amber-50">
                        <span className="text-lg mb-0.5">🎥</span>
                        <span className="text-xs font-medium text-amber-700">Record</span>
                      </button>
                    </div>
                  )}
                  {uploadError && <p className="text-xs text-red-600 mb-2">{uploadError}</p>}
                  {videoFile && !isRecording && (
                    <button onClick={uploadVideo} disabled={uploadingVideo} className="w-full bg-amber-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-amber-700 disabled:opacity-60">
                      {uploadingVideo ? 'Uploading...' : `Upload ${fileType === 'image' ? 'Image' : 'Video'}`}
                    </button>
                  )}
                </div>
              ) : !appointment.recordedVideoUrl ? (
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <span className="text-3xl block mb-2">⏳</span>
                  <p className="text-sm text-gray-500">Waiting for patient to upload video</p>
                </div>
              ) : null}
            </div>
          )}

          {/* Doctor Response Section */}
          {appointment.doctorResponse && (
            <div>
              <h3 className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-3">Doctor Response</h3>
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-2">
                {appointment.doctorResponse.suggestions && (
                  <div><p className="text-xs text-green-600 font-medium">Suggestions</p><p className="text-sm text-gray-800">{appointment.doctorResponse.suggestions}</p></div>
                )}
                {appointment.doctorResponse.diagnosis && (
                  <div><p className="text-xs text-green-600 font-medium">Diagnosis</p><p className="text-sm text-gray-800">{appointment.doctorResponse.diagnosis}</p></div>
                )}
                {appointment.doctorResponse.prescription && (
                  <div><p className="text-xs text-green-600 font-medium">Prescription</p><p className="text-sm text-gray-800">{appointment.doctorResponse.prescription}</p></div>
                )}
              </div>
            </div>
          )}

          {/* Doctor Info */}
          <div>
            <h3 className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-3">Doctor Information</h3>
            <div className="flex items-center space-x-3 bg-gray-50 rounded-xl p-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-lg">{appointment.doctor?.name?.charAt(0) || 'D'}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900">Dr. {appointment.doctor?.name || 'Doctor'}</p>
                <p className="text-sm text-gray-500">{appointment.doctor?.specialization || 'General Practitioner'}</p>
                {appointment.doctor?.email && <p className="text-xs text-gray-400 mt-0.5">{appointment.doctor.email}</p>}
                {appointment.doctor?.phone && <p className="text-xs text-gray-400">{appointment.doctor.phone}</p>}
              </div>
            </div>
          </div>

          {/* Patient Info */}
          <div>
            <h3 className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-3">Patient Information</h3>
            <div className="flex items-center space-x-3 bg-gray-50 rounded-xl p-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-lg">{appointment.patient?.name?.charAt(0) || 'P'}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900">{appointment.patient?.name || 'Patient'}</p>
                {appointment.patient?.email && <p className="text-sm text-gray-500">{appointment.patient.email}</p>}
                {appointment.patient?.phone && <p className="text-xs text-gray-400 mt-0.5">{appointment.patient.phone}</p>}
                <Link href={`/patient-history/${typeof appointment.patient === 'object' ? appointment.patient._id : appointment.patient}`} className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 px-2.5 py-1 rounded-lg transition">
                  📋 View History
                </Link>
              </div>
            </div>
          </div>

          {/* Additional Details */}
          {(appointment.symptoms || appointment.notes || appointment.consultationFee) && (
            <div>
              <h3 className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-3">Additional Details</h3>
              <div className="space-y-2">
                {appointment.symptoms && (
                  <div className="flex items-start space-x-2 bg-gray-50 rounded-lg p-3">
                    <span className="text-sm">🩺</span>
                    <div><p className="text-xs text-gray-500">Symptoms</p><p className="text-sm text-gray-800">{appointment.symptoms}</p></div>
                  </div>
                )}
                {appointment.notes && (
                  <div className="flex items-start space-x-2 bg-gray-50 rounded-lg p-3">
                    <span className="text-sm">📝</span>
                    <div><p className="text-xs text-gray-500">Notes</p><p className="text-sm text-gray-800">{appointment.notes}</p></div>
                  </div>
                )}
                {appointment.consultationFee && (
                  <div className="flex items-start space-x-2 bg-gray-50 rounded-lg p-3">
                    <span className="text-sm">💰</span>
                    <div><p className="text-xs text-gray-500">Consultation Fee</p><p className="text-sm font-semibold text-gray-800">৳{appointment.consultationFee}</p></div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Write Prescription Button (Doctor only) */}
          {userRole === 'doctor' && (appointment.status === 'confirmed' || appointment.status === 'completed') && onWritePrescription && (
            <div className="pt-3 border-t border-gray-100">
              <button onClick={onWritePrescription} className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 rounded-xl font-semibold text-sm hover:from-primary-700 hover:to-primary-800 transition-all flex items-center justify-center gap-2 shadow-lg">
                <span>📝</span> Write Prescription
              </button>
            </div>
          )}

          {/* Booked On */}
          <div className="text-center pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-400">Booked on {formatDate(appointment.createdAt)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== SHARED: Status Badge ====================
function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    confirmed: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    completed: 'bg-blue-100 text-blue-700',
    cancelled: 'bg-red-100 text-red-700',
  };
  return <span className={'px-2.5 py-1 rounded-full text-xs font-semibold ' + (colors[status] || 'bg-gray-100 text-gray-700')}>{status}</span>;
}

// ==================== SHARED: Write Prescription Modal ====================
function PrescriptionFormModal({ appointment, onClose, onSuccess }: { appointment: any; onClose: () => void; onSuccess: () => void }) {
  const [diagnosis, setDiagnosis] = useState('');
  const [symptomInput, setSymptomInput] = useState('');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [medicines, setMedicines] = useState<{ name: string; dosage: string; duration: string; instructions: string }[]>([{ name: '', dosage: '', duration: '', instructions: '' }]);
  const [testInput, setTestInput] = useState('');
  const [tests, setTests] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const addSymptom = () => {
    if (symptomInput.trim()) { setSymptoms([...symptoms, symptomInput.trim()]); setSymptomInput(''); }
  };
  const removeSymptom = (i: number) => setSymptoms(symptoms.filter((_, idx) => idx !== i));

  const addTest = () => {
    if (testInput.trim()) { setTests([...tests, testInput.trim()]); setTestInput(''); }
  };
  const removeTest = (i: number) => setTests(tests.filter((_, idx) => idx !== i));

  const addMedicine = () => setMedicines([...medicines, { name: '', dosage: '', duration: '', instructions: '' }]);
  const removeMedicine = (i: number) => setMedicines(medicines.filter((_, idx) => idx !== i));
  const updateMedicine = (i: number, field: string, value: string) => {
    const updated = [...medicines]; updated[i] = { ...updated[i], [field]: value }; setMedicines(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!diagnosis.trim()) { setError('Diagnosis is required'); return; }
    const validMedicines = medicines.filter(m => m.name.trim() && m.dosage.trim());
    if (validMedicines.length === 0) { setError('At least one medicine is required'); return; }

    setSaving(true); setError('');
    try {
      await api.post('/prescriptions', {
        appointmentId: appointment._id,
        patientId: appointment.patient?._id || appointment.patient,
        diagnosis: diagnosis.trim(),
        symptoms,
        medicines: validMedicines,
        tests,
        notes: notes.trim() || undefined,
        followUpDate: followUpDate || undefined,
      });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create prescription');
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-t-2xl px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">📝 Write Prescription</h2>
              <p className="text-primary-100 text-sm mt-1">For {appointment.patient?.name || 'Patient'} • #{appointment.serialNumber}</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}

          {/* Diagnosis */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Diagnosis *</label>
            <input required value={diagnosis} onChange={e => setDiagnosis(e.target.value)} className="input-field" placeholder="e.g., Acute bronchitis, Hypertension..." />
          </div>

          {/* Symptoms */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Symptoms</label>
            <div className="flex gap-2 mb-2">
              <input value={symptomInput} onChange={e => setSymptomInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSymptom())} className="input-field flex-1" placeholder="Type symptom and press Enter" />
              <button type="button" onClick={addSymptom} className="px-4 py-2.5 bg-primary-100 text-primary-700 rounded-xl text-sm font-medium hover:bg-primary-200">Add</button>
            </div>
            {symptoms.length > 0 && (
              <div className="flex flex-wrap gap-2">{symptoms.map((s, i) => (
                <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">{s}<button type="button" onClick={() => removeSymptom(i)} className="ml-1 text-blue-400 hover:text-blue-600">×</button></span>
              ))}</div>
            )}
          </div>

          {/* Medicines */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Medicines *</label>
            <div className="space-y-3">
              {medicines.map((med, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-4 relative">
                  {medicines.length > 1 && (
                    <button type="button" onClick={() => removeMedicine(i)} className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full bg-red-100 text-red-600 hover:bg-red-200 text-xs font-bold">×</button>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <input value={med.name} onChange={e => updateMedicine(i, 'name', e.target.value)} className="input-field text-sm" placeholder="Medicine name *" />
                    <input value={med.dosage} onChange={e => updateMedicine(i, 'dosage', e.target.value)} className="input-field text-sm" placeholder="Dosage (e.g., 500mg twice daily) *" />
                    <input value={med.duration} onChange={e => updateMedicine(i, 'duration', e.target.value)} className="input-field text-sm" placeholder="Duration (e.g., 7 days)" />
                    <input value={med.instructions} onChange={e => updateMedicine(i, 'instructions', e.target.value)} className="input-field text-sm" placeholder="Instructions (e.g., after meals)" />
                  </div>
                </div>
              ))}
            </div>
            <button type="button" onClick={addMedicine} className="mt-2 px-4 py-2 border-2 border-dashed border-primary-300 text-primary-600 rounded-xl text-sm font-medium hover:bg-primary-50 w-full">+ Add Another Medicine</button>
          </div>

          {/* Tests */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Recommended Tests</label>
            <div className="flex gap-2 mb-2">
              <input value={testInput} onChange={e => setTestInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTest())} className="input-field flex-1" placeholder="Type test name and press Enter" />
              <button type="button" onClick={addTest} className="px-4 py-2.5 bg-primary-100 text-primary-700 rounded-xl text-sm font-medium hover:bg-primary-200">Add</button>
            </div>
            {tests.length > 0 && (
              <div className="flex flex-wrap gap-2">{tests.map((t, i) => (
                <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm">{t}<button type="button" onClick={() => removeTest(i)} className="ml-1 text-purple-400 hover:text-purple-600">×</button></span>
              ))}</div>
            )}
          </div>

          {/* Notes & Follow-up */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Additional Notes</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} className="input-field" rows={3} placeholder="Any additional notes..." />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Follow-up Date</label>
              <input type="date" value={followUpDate} onChange={e => setFollowUpDate(e.target.value)} className="input-field" />
            </div>
          </div>

          <div className="flex space-x-3 pt-4 border-t">
            <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {saving ? <><div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>Saving...</> : '📝 Send Prescription'}
            </button>
            <button type="button" onClick={onClose} className="px-6 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==================== ADMIN DASHBOARD ====================
function AdminDashboard({ user }: { user: any }) {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editForm, setEditForm] = useState({ name: '', role: '', phone: '', isActive: true });
  const [selectedAppt, setSelectedAppt] = useState<any>(null);

  useEffect(() => { fetchAdminData(); }, []);

  const fetchAdminData = async () => {
    try {
      const [statsRes, usersRes, apptRes] = await Promise.all([
        api.get('/admin/stats'), api.get('/admin/users'), api.get('/admin/appointments'),
      ]);
      setStats(statsRes.data.data);
      setUsers(usersRes.data.data);
      setAppointments(apptRes.data.data);
    } catch (err) { console.error('Failed to fetch admin data'); }
    finally { setLoading(false); }
  };

  const handleEditUser = (u: any) => { setEditingUser(u._id); setEditForm({ name: u.name, role: u.role, phone: u.phone || '', isActive: u.isActive }); };
  const handleSaveUser = async (id: string) => {
    try { await api.put(`/admin/users/${id}`, editForm); setUsers(users.map(u => u._id === id ? { ...u, ...editForm } : u)); setEditingUser(null); }
    catch (err) { console.error('Failed to update user'); }
  };
  const handleDeleteUser = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try { await api.delete(`/admin/users/${id}`); setUsers(users.filter(u => u._id !== id)); }
    catch (err) { console.error('Failed to delete user'); }
  };

  if (loading) return <div className="text-center py-12"><div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto"></div></div>;

  return (
    <div>
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {[
          { label: 'Total Users', value: stats?.users || 0, icon: '👥', color: 'from-blue-500 to-blue-600' },
          { label: 'Doctors', value: stats?.doctors || 0, icon: '👨‍⚕️', color: 'from-green-500 to-green-600' },
          { label: 'Appointments', value: stats?.appointments || 0, icon: '📅', color: 'from-purple-500 to-purple-600' },
          { label: 'Medicines', value: stats?.medicines || 0, icon: '💊', color: 'from-orange-500 to-orange-600' },
          { label: 'Orders', value: stats?.orders || 0, icon: '🛒', color: 'from-pink-500 to-pink-600' },
        ].map((s, i) => (
          <div key={i} className={'bg-gradient-to-br ' + s.color + ' rounded-2xl p-5 text-white shadow-lg'}>
            <div className="text-3xl mb-2">{s.icon}</div>
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-sm opacity-90">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <Link href="/doctors" className="card flex items-center space-x-3 hover:border-primary-300 hover:shadow-md transition-all"><span className="text-2xl">👨‍⚕️</span><div><h3 className="font-semibold text-sm">Manage Doctors</h3><p className="text-xs text-gray-500">View & edit</p></div></Link>
        <Link href="/medicines" className="card flex items-center space-x-3 hover:border-primary-300 hover:shadow-md transition-all"><span className="text-2xl">💊</span><div><h3 className="font-semibold text-sm">Manage Medicines</h3><p className="text-xs text-gray-500">Add, edit, remove</p></div></Link>
        <Link href="/chat" className="card flex items-center space-x-3 hover:border-primary-300 hover:shadow-md transition-all"><span className="text-2xl">💬</span><div><h3 className="font-semibold text-sm">Messages</h3><p className="text-xs text-gray-500">Communicate</p></div></Link>
        <Link href="/profile" className="card flex items-center space-x-3 hover:border-primary-300 hover:shadow-md transition-all"><span className="text-2xl">⚙️</span><div><h3 className="font-semibold text-sm">Settings</h3><p className="text-xs text-gray-500">Profile & security</p></div></Link>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 rounded-xl p-1 mb-6">
        {['overview', 'users'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={'flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ' + (activeTab === tab ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-600 hover:text-gray-800')}>
            {tab === 'overview' ? '📊 Appointments' : '👥 User Management'}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="card">
          <h2 className="text-lg font-bold mb-4">Recent Appointments</h2>
          {appointments.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No appointments yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b-2 border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 rounded-tl-lg">Serial #</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Patient</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Doctor</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Time</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 rounded-tr-lg">Action</th>
                </tr></thead>
                <tbody>
                  {appointments.slice(0, 10).map((appt: any) => (
                    <tr key={appt._id} className="border-b border-gray-100 hover:bg-primary-50/50 transition-colors cursor-pointer" onClick={() => setSelectedAppt(appt)}>
                      <td className="py-3 px-4"><span className="font-mono text-primary-700 font-semibold text-xs">#{appt.serialNumber || appt._id?.slice(-6).toUpperCase()}</span></td>
                      <td className="py-3 px-4"><div className="flex items-center space-x-2"><div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center"><span className="text-blue-700 text-xs font-bold">{appt.patient?.name?.charAt(0) || '?'}</span></div><span className="font-medium">{appt.patient?.name || 'N/A'}</span></div></td>
                      <td className="py-3 px-4"><div className="flex items-center space-x-2"><div className="w-7 h-7 bg-green-100 rounded-full flex items-center justify-center"><span className="text-green-700 text-xs font-bold">{appt.doctor?.name?.charAt(0) || '?'}</span></div><span className="font-medium">Dr. {appt.doctor?.name || 'N/A'}</span></div></td>
                      <td className="py-3 px-4 text-gray-600">{new Date(appt.appointmentDate || appt.date).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-gray-600">{appt.timeSlot?.start ? `${appt.timeSlot.start} - ${appt.timeSlot.end}` : 'N/A'}</td>
                      <td className="py-3 px-4"><StatusBadge status={appt.status} /></td>
                      <td className="py-3 px-4"><button className="text-primary-600 hover:text-primary-800 text-xs font-medium" onClick={(e) => { e.stopPropagation(); setSelectedAppt(appt); }}>View Details →</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'users' && (
        <div className="card">
          <h2 className="text-lg font-bold mb-4">User Management</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b-2 border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Name</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Email</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Role</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Actions</th>
              </tr></thead>
              <tbody>
                {users.map((u: any) => (
                  <tr key={u._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{editingUser === u._id ? <input value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="border rounded px-2 py-1 text-sm w-full" /> : u.name}</td>
                    <td className="py-3 px-4 text-gray-500">{u.email}</td>
                    <td className="py-3 px-4">
                      {editingUser === u._id ? (
                        <select value={editForm.role} onChange={e => setEditForm({...editForm, role: e.target.value})} className="border rounded px-2 py-1 text-sm">
                          <option value="patient">Patient</option><option value="doctor">Doctor</option><option value="pharmacist">Pharmacist</option><option value="admin">Admin</option>
                        </select>
                      ) : (
                        <span className={'px-2.5 py-1 rounded-full text-xs font-medium ' + (u.role === 'admin' ? 'bg-red-100 text-red-700' : u.role === 'doctor' ? 'bg-green-100 text-green-700' : u.role === 'pharmacist' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700')}>{u.role}</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {editingUser === u._id ? (
                        <select value={editForm.isActive ? 'true' : 'false'} onChange={e => setEditForm({...editForm, isActive: e.target.value === 'true'})} className="border rounded px-2 py-1 text-sm">
                          <option value="true">Active</option><option value="false">Inactive</option>
                        </select>
                      ) : <span className={'px-2 py-1 rounded-full text-xs font-medium ' + (u.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500')}>{u.isActive ? 'Active' : 'Inactive'}</span>}
                    </td>
                    <td className="py-3 px-4">
                      {editingUser === u._id ? (
                        <div className="flex space-x-2"><button onClick={() => handleSaveUser(u._id)} className="px-3 py-1 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700">Save</button><button onClick={() => setEditingUser(null)} className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-300">Cancel</button></div>
                      ) : (
                        <div className="flex space-x-2"><button onClick={() => handleEditUser(u)} className="px-3 py-1 bg-primary-100 text-primary-700 rounded-lg text-xs font-medium hover:bg-primary-200">Edit</button><button onClick={() => handleDeleteUser(u._id)} className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-medium hover:bg-red-200">Delete</button></div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedAppt && <AppointmentDetailModal appointment={selectedAppt} onClose={() => setSelectedAppt(null)} />}
    </div>
  );
}

// ==================== DOCTOR DASHBOARD ====================
function DoctorDashboard({ user }: { user: any }) {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('appointments');
  const [loading, setLoading] = useState(true);
  const [selectedAppt, setSelectedAppt] = useState<any>(null);
  const [showPrescription, setShowPrescription] = useState(false);
  const [prescriptionSuccess, setPrescriptionSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try { const res = await api.get('/appointments'); setAppointments(res.data.data || []); }
      catch (err) { console.error('Failed to fetch'); } finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const updateAppointmentStatus = async (id: string, status: string) => {
    try { await api.put(`/appointments/${id}`, { status }); setAppointments(appointments.map(a => a._id === id ? { ...a, status } : a)); }
    catch (err) { console.error('Failed to update'); }
  };

  if (loading) return <div className="text-center py-12"><div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto"></div></div>;

  const pending = appointments.filter(a => a.status === 'pending');
  const confirmed = appointments.filter(a => a.status === 'confirmed');
  const completed = appointments.filter(a => a.status === 'completed');
  const visibleAppts = activeTab === 'pending' ? pending : appointments;

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Pending', value: pending.length, icon: '⏳', color: 'from-yellow-500 to-yellow-600' },
          { label: 'Confirmed', value: confirmed.length, icon: '✅', color: 'from-green-500 to-green-600' },
          { label: 'Completed', value: completed.length, icon: '🎉', color: 'from-blue-500 to-blue-600' },
          { label: 'Total', value: appointments.length, icon: '📅', color: 'from-purple-500 to-purple-600' },
        ].map((s, i) => (
          <div key={i} className={'bg-gradient-to-br ' + s.color + ' rounded-2xl p-5 text-white shadow-lg'}>
            <div className="text-3xl mb-2">{s.icon}</div><div className="text-2xl font-bold">{s.value}</div><div className="text-sm opacity-90">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <Link href="/chat" className="card flex items-center space-x-3 hover:border-primary-300 hover:shadow-md transition-all"><span className="text-2xl">💬</span><div><h3 className="font-semibold text-sm">Messages</h3><p className="text-xs text-gray-500">Chat with patients</p></div></Link>
        <Link href="/profile" className="card flex items-center space-x-3 hover:border-primary-300 hover:shadow-md transition-all"><span className="text-2xl">📋</span><div><h3 className="font-semibold text-sm">My Profile</h3><p className="text-xs text-gray-500">View & update info</p></div></Link>
        <Link href="/prescriptions" className="card flex items-center space-x-3 hover:border-primary-300 hover:shadow-md transition-all"><span className="text-2xl">📝</span><div><h3 className="font-semibold text-sm">Prescriptions</h3><p className="text-xs text-gray-500">View all written</p></div></Link>
        <Link href="/notifications" className="card flex items-center space-x-3 hover:border-primary-300 hover:shadow-md transition-all"><span className="text-2xl">🔔</span><div><h3 className="font-semibold text-sm">Notifications</h3><p className="text-xs text-gray-500">Recent alerts</p></div></Link>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 rounded-xl p-1 mb-6">
        {['appointments', 'pending'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={'flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ' + (activeTab === tab ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-600')}>
            {tab === 'appointments' ? '📅 All Appointments' : '⏳ Pending Requests'}
          </button>
        ))}
      </div>

      {/* Appointments Table */}
      <div className="card">
        <h2 className="text-lg font-bold mb-4">{activeTab === 'pending' ? 'Pending Appointment Requests' : 'All Appointments'}</h2>
        {visibleAppts.length === 0 ? (
          <p className="text-gray-500 text-center py-8">{activeTab === 'pending' ? 'No pending requests 🎉' : 'No appointments yet'}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b-2 border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4 font-semibold text-gray-600 rounded-tl-lg">Serial #</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Patient</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Date</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Time</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600 rounded-tr-lg">Actions</th>
              </tr></thead>
              <tbody>
                {visibleAppts.map((appt: any) => (
                  <tr key={appt._id} className="border-b border-gray-100 hover:bg-primary-50/50 transition-colors cursor-pointer" onClick={() => setSelectedAppt(appt)}>
                    <td className="py-3 px-4"><span className="font-mono text-primary-700 font-semibold text-xs">#{appt.serialNumber || appt._id?.slice(-6).toUpperCase()}</span></td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center"><span className="text-blue-700 text-xs font-bold">{appt.patient?.name?.charAt(0) || '?'}</span></div>
                        <span className="font-medium">{appt.patient?.name || 'Patient'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{new Date(appt.appointmentDate || appt.date).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-gray-600">{appt.timeSlot?.start ? `${appt.timeSlot.start} - ${appt.timeSlot.end}` : 'N/A'}</td>
                    <td className="py-3 px-4"><StatusBadge status={appt.status} /></td>
                    <td className="py-3 px-4" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center space-x-2">
                        <button className="text-primary-600 hover:text-primary-800 text-xs font-medium" onClick={() => setSelectedAppt(appt)}>View →</button>
                        {appt.status === 'pending' && <>
                          <button onClick={() => updateAppointmentStatus(appt._id, 'confirmed')} className="px-2.5 py-1 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700">Accept</button>
                          <button onClick={() => updateAppointmentStatus(appt._id, 'cancelled')} className="px-2.5 py-1 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700">Reject</button>
                        </>}
                        {appt.status === 'confirmed' && <button onClick={() => updateAppointmentStatus(appt._id, 'completed')} className="px-2.5 py-1 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700">Complete</button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {selectedAppt && (
        <AppointmentDetailModal
          appointment={selectedAppt}
          onClose={() => { setSelectedAppt(null); setPrescriptionSuccess(false); }}
          userRole="doctor"
          onWritePrescription={() => setShowPrescription(true)}
        />
      )}
      {showPrescription && selectedAppt && (
        <PrescriptionFormModal
          appointment={selectedAppt}
          onClose={() => setShowPrescription(false)}
          onSuccess={() => {
            setShowPrescription(false);
            setPrescriptionSuccess(true);
            setSelectedAppt(null);
          }}
        />
      )}
      {prescriptionSuccess && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center">
            <div className="text-5xl mb-4">✅</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Prescription Sent!</h3>
            <p className="text-gray-500 text-sm mb-6">The prescription has been sent to the patient successfully.</p>
            <button onClick={() => setPrescriptionSuccess(false)} className="btn-primary w-full">Done</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== PATIENT DASHBOARD ====================
function PatientDashboard({ user }: { user: any }) {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppt, setSelectedAppt] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try { const res = await api.get('/appointments'); setAppointments(res.data.data || []); }
      catch (err) { console.error('Failed to fetch'); } finally { setLoading(false); }
    };
    fetchData();
  }, []);

  if (loading) return <div className="text-center py-12"><div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto"></div></div>;

  const upcoming = appointments.filter(a => a.status === 'confirmed' || a.status === 'pending');
  const completed = appointments.filter(a => a.status === 'completed');
  const past = appointments.filter(a => a.status === 'completed' || a.status === 'cancelled');

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Upcoming', value: upcoming.length, icon: '📅', color: 'from-blue-500 to-blue-600' },
          { label: 'Completed', value: completed.length, icon: '✅', color: 'from-green-500 to-green-600' },
          { label: 'Total', value: appointments.length, icon: '📊', color: 'from-purple-500 to-purple-600' },
          { label: 'Prescriptions', value: 0, icon: '📋', color: 'from-orange-500 to-orange-600' },
        ].map((s, i) => (
          <div key={i} className={'bg-gradient-to-br ' + s.color + ' rounded-2xl p-5 text-white shadow-lg'}>
            <div className="text-3xl mb-2">{s.icon}</div><div className="text-2xl font-bold">{s.value}</div><div className="text-sm opacity-90">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <Link href="/doctors" className="card flex items-center space-x-3 hover:border-primary-300 hover:shadow-md transition-all"><span className="text-2xl">🔍</span><div><h3 className="font-semibold text-sm">Find Doctors</h3><p className="text-xs text-gray-500">Search & book</p></div></Link>
        <Link href="/medicines" className="card flex items-center space-x-3 hover:border-primary-300 hover:shadow-md transition-all"><span className="text-2xl">💊</span><div><h3 className="font-semibold text-sm">Order Medicines</h3><p className="text-xs text-gray-500">Browse & order</p></div></Link>
        <Link href="/symptom-checker" className="card flex items-center space-x-3 hover:border-primary-300 hover:shadow-md transition-all"><span className="text-2xl">🤖</span><div><h3 className="font-semibold text-sm">Symptom Checker</h3><p className="text-xs text-gray-500">AI guidance</p></div></Link>
        <Link href="/chat" className="card flex items-center space-x-3 hover:border-primary-300 hover:shadow-md transition-all"><span className="text-2xl">💬</span><div><h3 className="font-semibold text-sm">Messages</h3><p className="text-xs text-gray-500">Chat with doctors</p></div></Link>
      </div>

      {/* Upcoming Appointments Table */}
      <div className="card mb-6">
        <h2 className="text-lg font-bold mb-4">Upcoming Appointments</h2>
        {upcoming.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No upcoming appointments</p>
            <Link href="/doctors" className="btn-primary text-sm">Book an Appointment</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b-2 border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4 font-semibold text-gray-600 rounded-tl-lg">Serial #</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Doctor</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Specialty</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Date</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Time</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600 rounded-tr-lg">Details</th>
              </tr></thead>
              <tbody>
                {upcoming.map((appt: any) => (
                  <tr key={appt._id} className="border-b border-gray-100 hover:bg-primary-50/50 transition-colors cursor-pointer" onClick={() => setSelectedAppt(appt)}>
                    <td className="py-3.5 px-4"><span className="font-mono text-primary-700 font-semibold text-xs bg-primary-50 px-2 py-1 rounded">#{appt.serialNumber || appt._id?.slice(-6).toUpperCase()}</span></td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs font-bold">{appt.doctor?.name?.charAt(0) || 'D'}</span>
                        </div>
                        <span className="font-medium text-gray-900">Dr. {appt.doctor?.name || 'Doctor'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-gray-500">{appt.doctor?.specialization || 'General'}</td>
                    <td className="py-3.5 px-4 text-gray-600">{new Date(appt.appointmentDate || appt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                    <td className="py-3.5 px-4 text-gray-600">{appt.timeSlot?.start ? `${appt.timeSlot.start} - ${appt.timeSlot.end}` : 'N/A'}</td>
                    <td className="py-3.5 px-4"><StatusBadge status={appt.status} /></td>
                    <td className="py-3.5 px-4"><button className="text-primary-600 hover:text-primary-800 text-xs font-semibold" onClick={() => setSelectedAppt(appt)}>View Details →</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Past Appointments Table */}
      {past.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-bold mb-4">Past Appointments</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b-2 border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4 font-semibold text-gray-600 rounded-tl-lg">Serial #</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Doctor</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Date</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Time</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600 rounded-tr-lg">Details</th>
              </tr></thead>
              <tbody>
                {past.slice(0, 5).map((appt: any) => (
                  <tr key={appt._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setSelectedAppt(appt)}>
                    <td className="py-3.5 px-4"><span className="font-mono text-gray-500 font-semibold text-xs">#{appt.serialNumber || appt._id?.slice(-6).toUpperCase()}</span></td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-gray-600 text-xs font-bold">{appt.doctor?.name?.charAt(0) || 'D'}</span>
                        </div>
                        <span className="font-medium text-gray-700">Dr. {appt.doctor?.name || 'Doctor'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-gray-500">{new Date(appt.appointmentDate || appt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                    <td className="py-3.5 px-4 text-gray-500">{appt.timeSlot?.start ? `${appt.timeSlot.start} - ${appt.timeSlot.end}` : 'N/A'}</td>
                    <td className="py-3.5 px-4"><StatusBadge status={appt.status} /></td>
                    <td className="py-3.5 px-4"><button className="text-primary-600 hover:text-primary-800 text-xs font-semibold" onClick={() => setSelectedAppt(appt)}>View Details →</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedAppt && <AppointmentDetailModal appointment={selectedAppt} onClose={() => setSelectedAppt(null)} userRole="patient" />}
    </div>
  );
}

// ==================== PHARMACIST DASHBOARD ====================
function PharmacistDashboard({ user }: { user: any }) {
  const [medicines, setMedicines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', genericName: '', category: '', price: '', description: '', manufacturer: '', dosageForm: '', stock: '', inStock: true, requiresPrescription: false });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchMedicines(); }, []);

  const fetchMedicines = async () => {
    try { const res = await api.get('/medicines', { params: { limit: 100 } }); setMedicines(res.data.data || []); }
    catch (err) { console.error('Failed to fetch medicines'); } finally { setLoading(false); }
  };

  const resetForm = () => {
    setForm({ name: '', genericName: '', category: '', price: '', description: '', manufacturer: '', dosageForm: '', stock: '', inStock: true, requiresPrescription: false });
    setEditingId(null); setShowForm(false);
  };

  const handleEdit = (med: any) => {
    setForm({ name: med.name || '', genericName: med.genericName || '', category: med.category || '', price: med.price?.toString() || '', description: med.description || '', manufacturer: med.manufacturer || '', dosageForm: med.dosageForm || '', stock: med.stock?.toString() || '', inStock: med.inStock !== false, requiresPrescription: med.requiresPrescription || false });
    setEditingId(med._id); setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = { ...form, price: parseFloat(form.price), stock: parseInt(form.stock) };
      if (editingId) await api.put(`/medicines/${editingId}`, payload); else await api.post('/medicines', payload);
      resetForm(); fetchMedicines();
    } catch (err) { console.error('Failed to save medicine'); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this medicine?')) return;
    try { await api.delete(`/medicines/${id}`); setMedicines(medicines.filter(m => m._id !== id)); }
    catch (err) { console.error('Failed to delete'); }
  };

  if (loading) return <div className="text-center py-12"><div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto"></div></div>;

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Medicines', value: medicines.length, icon: '💊', color: 'from-blue-500 to-blue-600' },
          { label: 'In Stock', value: medicines.filter(m => m.inStock).length, icon: '✅', color: 'from-green-500 to-green-600' },
          { label: 'Out of Stock', value: medicines.filter(m => !m.inStock).length, icon: '❌', color: 'from-red-500 to-red-600' },
          { label: 'Categories', value: Array.from(new Set(medicines.map(m => m.category))).length, icon: '📁', color: 'from-purple-500 to-purple-600' },
        ].map((s, i) => (
          <div key={i} className={'bg-gradient-to-br ' + s.color + ' rounded-2xl p-5 text-white shadow-lg'}>
            <div className="text-3xl mb-2">{s.icon}</div><div className="text-2xl font-bold">{s.value}</div><div className="text-sm opacity-90">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <button onClick={() => { resetForm(); setShowForm(true); }} className="card flex items-center space-x-3 hover:border-primary-300 hover:shadow-md transition-all text-left"><span className="text-2xl">➕</span><div><h3 className="font-semibold text-sm">Add Medicine</h3><p className="text-xs text-gray-500">Add new medicine</p></div></button>
        <Link href="/profile" className="card flex items-center space-x-3 hover:border-primary-300 hover:shadow-md transition-all"><span className="text-2xl">⚙️</span><div><h3 className="font-semibold text-sm">Settings</h3><p className="text-xs text-gray-500">Profile & security</p></div></Link>
        <Link href="/chat" className="card flex items-center space-x-3 hover:border-primary-300 hover:shadow-md transition-all"><span className="text-2xl">💬</span><div><h3 className="font-semibold text-sm">Messages</h3><p className="text-xs text-gray-500">Communicate</p></div></Link>
      </div>

      {/* Medicine Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">{editingId ? 'Edit Medicine' : 'Add New Medicine'}</h2>
              <button onClick={resetForm} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Medicine Name *</label><input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input-field" placeholder="e.g., Paracetamol" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Generic Name</label><input value={form.genericName} onChange={e => setForm({...form, genericName: e.target.value})} className="input-field" placeholder="e.g., Acetaminophen" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Category *</label><input required value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="input-field" placeholder="e.g., Pain Relief" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Price (৳) *</label><input required type="number" step="0.01" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="input-field" placeholder="0.00" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Manufacturer</label><input value={form.manufacturer} onChange={e => setForm({...form, manufacturer: e.target.value})} className="input-field" placeholder="e.g., Square Pharma" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Dosage Form</label><input value={form.dosageForm} onChange={e => setForm({...form, dosageForm: e.target.value})} className="input-field" placeholder="e.g., Tablet, Capsule" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity *</label><input required type="number" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} className="input-field" placeholder="0" /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="input-field" rows={3} placeholder="Medicine description..." /></div>
              <div className="flex items-center space-x-6">
                <label className="flex items-center space-x-2 cursor-pointer"><input type="checkbox" checked={form.inStock} onChange={e => setForm({...form, inStock: e.target.checked})} className="w-4 h-4 text-primary-600 rounded" /><span className="text-sm text-gray-700">In Stock</span></label>
                <label className="flex items-center space-x-2 cursor-pointer"><input type="checkbox" checked={form.requiresPrescription} onChange={e => setForm({...form, requiresPrescription: e.target.checked})} className="w-4 h-4 text-primary-600 rounded" /><span className="text-sm text-gray-700">Requires Prescription</span></label>
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Saving...' : editingId ? 'Update Medicine' : 'Add Medicine'}</button>
                <button type="button" onClick={resetForm} className="px-6 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Medicines Table */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Medicine Inventory</h2>
          <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary text-sm">+ Add Medicine</button>
        </div>
        {medicines.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No medicines yet. Add your first medicine!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b-2 border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-2 font-semibold text-gray-600">Name</th>
                <th className="text-left py-3 px-2 font-semibold text-gray-600">Category</th>
                <th className="text-left py-3 px-2 font-semibold text-gray-600">Price</th>
                <th className="text-left py-3 px-2 font-semibold text-gray-600">Stock</th>
                <th className="text-left py-3 px-2 font-semibold text-gray-600">Status</th>
                <th className="text-left py-3 px-2 font-semibold text-gray-600">Actions</th>
              </tr></thead>
              <tbody>
                {medicines.map((med: any) => (
                  <tr key={med._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-2"><div><span className="font-medium">{med.name}</span></div><div className="text-xs text-gray-400">{med.genericName}</div></td>
                    <td className="py-3 px-2 text-gray-600">{med.category}</td>
                    <td className="py-3 px-2 font-medium">৳{med.price}</td>
                    <td className="py-3 px-2">{med.stock || 0}</td>
                    <td className="py-3 px-2"><span className={'px-2 py-1 rounded-full text-xs font-medium ' + (med.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}>{med.inStock ? 'In Stock' : 'Out of Stock'}</span></td>
                    <td className="py-3 px-2"><div className="flex space-x-1"><button onClick={() => handleEdit(med)} className="px-2.5 py-1 bg-primary-100 text-primary-700 rounded-lg text-xs font-medium hover:bg-primary-200">Edit</button><button onClick={() => handleDelete(med._id)} className="px-2.5 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-medium hover:bg-red-200">Delete</button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== MAIN DASHBOARD ====================
export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Please login to access your dashboard</h2>
        <Link href="/login" className="btn-primary">Login Now</Link>
      </div>
    );
  }

  const roleColors: Record<string, string> = { admin: 'from-red-600 to-red-800', doctor: 'from-green-600 to-green-800', patient: 'from-blue-600 to-blue-800', pharmacist: 'from-purple-600 to-purple-800' };
  const roleIcons: Record<string, string> = { admin: '🛡️', doctor: '👨‍⚕️', patient: '🏥', pharmacist: '💊' };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome, {user.name}!</h1>
          <p className="text-gray-600 mt-1">
            <span className={'inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r ' + (roleColors[user.role] || 'from-gray-600 to-gray-800') + ' text-white'}>
              <span>{roleIcons[user.role] || '👤'}</span><span className="capitalize">{user.role} Dashboard</span>
            </span>
          </p>
        </div>
        <Link href="/profile" className="flex items-center space-x-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 hover:border-primary-300 hover:shadow-sm transition-all">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center overflow-hidden">
            {user.avatar ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" /> : <span className="text-white font-medium text-sm">{user.name?.charAt(0)}</span>}
          </div>
          <span className="text-sm font-medium text-gray-700">My Profile</span>
        </Link>
      </div>

      {/* Role-based Content */}
      {user.role === 'admin' && <AdminDashboard user={user} />}
      {user.role === 'doctor' && <DoctorDashboard user={user} />}
      {user.role === 'patient' && <PatientDashboard user={user} />}
      {user.role === 'pharmacist' && <PharmacistDashboard user={user} />}
    </div>
  );
}