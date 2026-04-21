'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });
  
  const [activeTab, setActiveTab] = useState('profile');

  // Doctor professional info
  const [doctorProfile, setDoctorProfile] = useState<any>(null);
  const [specialization, setSpecialization] = useState('');
  const [experience, setExperience] = useState(0);
  const [qualification, setQualification] = useState('');
  const [bio, setBio] = useState('');
  const [consultationFee, setConsultationFee] = useState(500);
  const [availableDays, setAvailableDays] = useState<string[]>(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
  const [isAvailable, setIsAvailable] = useState(true);
  const [clinicAddress, setClinicAddress] = useState('');
  const [languages, setLanguages] = useState('');
  const [doctorSaving, setDoctorSaving] = useState(false);
  const [doctorMessage, setDoctorMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setAvatar(user.avatar || '');
    }
  }, [user]);

  useEffect(() => {
    if (user?.role === 'doctor') {
      fetchDoctorProfile();
    }
  }, [user]);

  const fetchDoctorProfile = async () => {
    try {
      const res = await api.get('/doctors/profile');
      const doc = res.data.data;
      setDoctorProfile(doc);
      setSpecialization(doc.specialization || '');
      setExperience(doc.experience || 0);
      setQualification(doc.qualification || '');
      setBio(doc.bio || '');
      setConsultationFee(doc.consultationFee || 500);
      setAvailableDays(doc.availableDays || []);
      setIsAvailable(doc.isAvailable !== false);
      setClinicAddress(doc.clinicAddress || '');
      setLanguages((doc.languages || []).join(', '));
    } catch (err) {
      console.error('Could not load doctor profile');
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image must be less than 5MB' });
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setAvatar(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });
    
    try {
      const res = await api.put('/auth/profile', { name, phone, avatar });
      updateUser({ ...user!, name, phone, avatar });
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  const handleDoctorProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDoctorSaving(true);
    setDoctorMessage({ type: '', text: '' });

    try {
      await api.put('/doctors/profile', {
        specialization,
        experience: Number(experience),
        qualification,
        bio,
        consultationFee: Number(consultationFee),
        availableDays,
        isAvailable,
        clinicAddress,
        languages: languages.split(',').map(l => l.trim()).filter(Boolean),
      });
      setDoctorMessage({ type: 'success', text: 'Doctor profile updated successfully!' });
      fetchDoctorProfile();
    } catch (err: any) {
      setDoctorMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update doctor profile' });
    } finally {
      setDoctorSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage({ type: '', text: '' });
    
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }
    
    setPasswordSaving(true);
    try {
      await api.put('/auth/change-password', { currentPassword, newPassword });
      setPasswordMessage({ type: 'success', text: 'Password changed successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordMessage({ type: 'error', text: err.response?.data?.message || 'Failed to change password' });
    } finally {
      setPasswordSaving(false);
    }
  };

  const toggleDay = (day: string) => {
    setAvailableDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const allDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Please login to view your profile</p>
          <Link href="/login" className="bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors">
            Login
          </Link>
        </div>
      </div>
    );
  }

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const tabs = [
    { id: 'profile', label: 'Profile Info', icon: '👤' },
    ...(user.role === 'doctor' ? [{ id: 'doctor', label: 'Professional Info', icon: '👨‍⚕️' }] : []),
    { id: 'security', label: 'Security', icon: '🔒' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center space-x-5">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-white/20 border-4 border-white/30 flex items-center justify-center">
                {avatar ? (
                  <Image src={avatar} alt={name} width={96} height={96} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold text-white">{getInitials(name)}</span>
                )}
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{name}</h1>
              <p className="text-primary-100">{user.email}</p>
              <div className="flex items-center space-x-2 mt-1">
                <span className="px-3 py-0.5 bg-white/20 rounded-full text-xs font-medium capitalize">{user.role}</span>
                {user.role === 'doctor' && doctorProfile && (
                  <span className="px-3 py-0.5 bg-white/20 rounded-full text-xs font-medium">{doctorProfile.specialization}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex space-x-1 bg-white rounded-xl p-1 shadow-sm border mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={'flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors ' + 
                (activeTab === tab.id ? 'bg-primary-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50')}
            >
              <span className="mr-1.5">{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-2xl shadow-sm border p-6 md:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Edit Profile</h2>
            
            {message.text && (
              <div className={'mb-6 p-4 rounded-xl text-sm font-medium ' + 
                (message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200')}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center space-x-6">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200 flex items-center justify-center">
                    {avatar ? (
                      <Image src={avatar} alt={name} width={96} height={96} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl font-bold text-gray-400">{getInitials(name)}</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-primary-700 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2 2 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Profile Picture</p>
                  <p className="text-sm text-gray-500 mt-1">JPG, PNG or GIF. Max 5MB.</p>
                  <div className="flex space-x-3 mt-2">
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="text-sm text-primary-600 font-medium hover:text-primary-700">Upload New</button>
                    {avatar && (
                      <button type="button" onClick={() => setAvatar('')} className="text-sm text-red-500 font-medium hover:text-red-600">Remove</button>
                    )}
                  </div>
                </div>
              </div>

              <hr className="border-gray-100" />

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900" placeholder="Enter your full name" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                  <input type="email" value={user.email} readOnly className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900" placeholder="+880 1XXX XXXXXX" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Account Type</label>
                  <input type="text" value={user.role.charAt(0).toUpperCase() + user.role.slice(1)} readOnly className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed capitalize" />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <Link href="/dashboard" className="text-gray-500 hover:text-gray-700 font-medium text-sm">← Back to Dashboard</Link>
                <button type="submit" disabled={saving} className={'px-8 py-3 rounded-xl font-semibold text-white transition-colors ' + (saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700 shadow-lg hover:shadow-xl')}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Doctor Professional Info Tab */}
        {activeTab === 'doctor' && (
          <div className="bg-white rounded-2xl shadow-sm border p-6 md:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Professional Information</h2>
            <p className="text-sm text-gray-500 mb-6">This information will be displayed on your public doctor profile.</p>
            
            {doctorMessage.text && (
              <div className={'mb-6 p-4 rounded-xl text-sm font-medium ' + 
                (doctorMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200')}>
                {doctorMessage.text}
              </div>
            )}

            <form onSubmit={handleDoctorProfileSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Specialization</label>
                  <select value={specialization} onChange={(e) => setSpecialization(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900">
                    <option value="">Select Specialization</option>
                    <option value="Cardiologist">Cardiologist</option>
                    <option value="Dermatologist">Dermatologist</option>
                    <option value="Neurologist">Neurologist</option>
                    <option value="Orthopedic">Orthopedic</option>
                    <option value="Pediatrician">Pediatrician</option>
                    <option value="Psychiatrist">Psychiatrist</option>
                    <option value="General Physician">General Physician</option>
                    <option value="Gynecologist">Gynecologist</option>
                    <option value="ENT Specialist">ENT Specialist</option>
                    <option value="Eye Specialist">Eye Specialist</option>
                    <option value="Dentist">Dentist</option>
                    <option value="Urologist">Urologist</option>
                    <option value="Pulmonologist">Pulmonologist</option>
                    <option value="Endocrinologist">Endocrinologist</option>
                    <option value="Oncologist">Oncologist</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Qualification</label>
                  <input type="text" value={qualification} onChange={(e) => setQualification(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900" placeholder="e.g., MBBS, MD, FCPS" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Experience (Years)</label>
                  <input type="number" min="0" max="60" value={experience} onChange={(e) => setExperience(Number(e.target.value))} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Consultation Fee (৳)</label>
                  <input type="number" min="0" value={consultationFee} onChange={(e) => setConsultationFee(Number(e.target.value))} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Bio / About</label>
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 resize-none" placeholder="Tell patients about yourself, your expertise, and your approach to healthcare..." />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Clinic / Chamber Address</label>
                <input type="text" value={clinicAddress} onChange={(e) => setClinicAddress(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900" placeholder="Your clinic or hospital address" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Languages (comma-separated)</label>
                <input type="text" value={languages} onChange={(e) => setLanguages(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900" placeholder="e.g., Bengali, English, Hindi" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Available Days</label>
                <div className="flex flex-wrap gap-2">
                  {allDays.map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={'px-4 py-2 rounded-xl text-sm font-medium transition-colors border ' + 
                        (availableDays.includes(day) 
                          ? 'bg-primary-600 text-white border-primary-600' 
                          : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300')}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={isAvailable} onChange={(e) => setIsAvailable(e.target.checked)} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
                <div>
                  <span className="text-sm font-medium text-gray-700">{isAvailable ? 'Available for appointments' : 'Not available'}</span>
                  <p className="text-xs text-gray-400">Toggle to control whether patients can book appointments with you</p>
                </div>
              </div>

              {doctorProfile?.rating !== undefined && (
                <div className="flex items-center space-x-4 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                  <span className="text-2xl">⭐</span>
                  <div>
                    <p className="text-sm font-semibold text-yellow-800">Rating: {doctorProfile.rating.toFixed(1)} / 5.0</p>
                    <p className="text-xs text-yellow-600">{doctorProfile.totalReviews} total reviews</p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4">
                <Link href="/doctors" className="text-gray-500 hover:text-gray-700 font-medium text-sm">← View All Doctors</Link>
                <button type="submit" disabled={doctorSaving} className={'px-8 py-3 rounded-xl font-semibold text-white transition-colors ' + (doctorSaving ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700 shadow-lg')}>
                  {doctorSaving ? 'Saving...' : 'Save Professional Info'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="bg-white rounded-2xl shadow-sm border p-6 md:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Change Password</h2>
            
            {passwordMessage.text && (
              <div className={'mb-6 p-4 rounded-xl text-sm font-medium ' + 
                (passwordMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200')}>
                {passwordMessage.text}
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Current Password</label>
                <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900" placeholder="Enter your current password" required />
              </div>
              <hr className="border-gray-100" />
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900" placeholder="Enter new password (min 6 characters)" required minLength={6} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm New Password</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900" placeholder="Confirm your new password" required />
                {confirmPassword && newPassword && confirmPassword !== newPassword && (
                  <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
                )}
              </div>
              <div className="pt-4">
                <button type="submit" disabled={passwordSaving || !currentPassword || !newPassword || newPassword !== confirmPassword} className={'w-full py-3 rounded-xl font-semibold text-white transition-colors ' + (passwordSaving || !currentPassword || !newPassword || newPassword !== confirmPassword ? 'bg-gray-300 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700 shadow-lg')}>
                  {passwordSaving ? 'Changing Password...' : 'Change Password'}
                </button>
              </div>
            </form>

            <hr className="my-8 border-gray-100" />

            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <h3 className="text-lg font-bold text-red-800 mb-2">Danger Zone</h3>
              <p className="text-sm text-red-600 mb-4">Once you logout, you will need to sign in again to access your account.</p>
              <button onClick={logout} className="px-6 py-2.5 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors">Logout</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}