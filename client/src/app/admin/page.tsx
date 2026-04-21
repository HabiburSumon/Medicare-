'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface Stats {
  users: number;
  doctors: number;
  appointments: number;
  medicines: number;
  orders: number;
  recentUsers: any[];
  recentAppointments: any[];
}

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userSearch, setUserSearch] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [editUser, setEditUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editDoctorProfile, setEditDoctorProfile] = useState<any>(null);
  const [showDoctorModal, setShowDoctorModal] = useState(false);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchStats();
      fetchUsers();
      fetchAppointments();
      fetchOrders();
      fetchDoctors();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/stats');
      setStats(res.data.data);
    } catch (err) {
      console.error('Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const params: any = {};
      if (userSearch) params.search = userSearch;
      if (userFilter) params.role = userFilter;
      const res = await api.get('/admin/users', { params });
      setUsers(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch users');
    }
  };

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/admin/appointments');
      setAppointments(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch appointments');
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await api.get('/admin/orders');
      setOrders(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch orders');
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await api.get('/admin/doctors');
      setDoctors(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch doctors');
    }
  };

  const handleUpdateUser = async () => {
    if (!editUser) return;
    try {
      await api.put(`/admin/users/${editUser._id}`, {
        name: editUser.name,
        role: editUser.role,
        phone: editUser.phone,
        isActive: editUser.isActive,
        email: editUser.email,
      });
      setShowEditModal(false);
      fetchUsers();
      fetchStats();
    } catch (err) {
      console.error('Failed to update user');
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      fetchUsers();
      fetchStats();
    } catch (err) {
      console.error('Failed to delete user');
    }
  };

  const handleAppointmentStatus = async (id: string, status: string) => {
    try {
      await api.put(`/admin/appointments/${id}/status`, { status });
      fetchAppointments();
      fetchStats();
    } catch (err) {
      console.error('Failed to update appointment status');
    }
  };

  const handleEditDoctorProfile = async (userId: string) => {
    try {
      const res = await api.get(`/admin/users/${userId}/doctor-profile`);
      setEditDoctorProfile({ ...res.data.data, userId });
      setShowDoctorModal(true);
    } catch (err) {
      console.error('Failed to fetch doctor profile');
    }
  };

  const handleUpdateDoctorProfile = async () => {
    if (!editDoctorProfile) return;
    try {
      await api.put(`/admin/users/${editDoctorProfile.userId}/doctor-profile`, {
        specialization: editDoctorProfile.specialization,
        experience: editDoctorProfile.experience,
        qualification: editDoctorProfile.qualification,
        bio: editDoctorProfile.bio,
        consultationFee: editDoctorProfile.consultationFee,
        availableDays: editDoctorProfile.availableDays,
        isAvailable: editDoctorProfile.isAvailable,
        clinicAddress: editDoctorProfile.clinicAddress,
      });
      setShowDoctorModal(false);
      fetchDoctors();
    } catch (err) {
      console.error('Failed to update doctor profile');
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      admin: 'bg-red-50 text-red-700 border-red-200',
      doctor: 'bg-blue-50 text-blue-700 border-blue-200',
      patient: 'bg-green-50 text-green-700 border-green-200',
      pharmacist: 'bg-purple-50 text-purple-700 border-purple-200',
    };
    return colors[role] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-50 text-yellow-700',
      confirmed: 'bg-blue-50 text-blue-700',
      completed: 'bg-green-50 text-green-700',
      cancelled: 'bg-red-50 text-red-700',
      'in-progress': 'bg-purple-50 text-purple-700',
      delivered: 'bg-green-50 text-green-700',
    };
    return colors[status] || 'bg-gray-50 text-gray-700';
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold mb-4">Please Login</h2>
          <Link href="/login" className="btn-primary">Login</Link>
        </div>
      </div>
    );
  }

  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-gray-500 mb-4">You don't have admin privileges</p>
          <Link href="/dashboard" className="btn-primary">Go to Dashboard</Link>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'doctors', label: 'Doctors', icon: '👨‍⚕️' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'appointments', label: 'Appointments', icon: '📅' },
    { id: 'orders', label: 'Orders', icon: '🛒' },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                <span className="text-xl">🛡️</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <p className="text-gray-400 text-sm">Manage your platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Link href="/dashboard" className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium transition-colors">
                User Dashboard →
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-2xl p-1 mb-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-5 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-500">Loading admin data...</p>
          </div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && stats && (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {[
                    { label: 'Total Users', value: stats.users, icon: '👥', color: 'from-blue-500 to-blue-600' },
                    { label: 'Doctors', value: stats.doctors, icon: '👨‍⚕️', color: 'from-green-500 to-green-600' },
                    { label: 'Appointments', value: stats.appointments, icon: '📅', color: 'from-purple-500 to-purple-600' },
                    { label: 'Medicines', value: stats.medicines, icon: '💊', color: 'from-orange-500 to-orange-600' },
                    { label: 'Orders', value: stats.orders, icon: '🛒', color: 'from-pink-500 to-pink-600' },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                      <div className={`h-1.5 bg-gradient-to-r ${stat.color}`}></div>
                      <div className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">{stat.label}</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                          </div>
                          <span className="text-3xl opacity-60">{stat.icon}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Recent Activity */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                      <h3 className="font-bold text-gray-900">Recent Users</h3>
                      <button onClick={() => setActiveTab('users')} className="text-sm text-primary-600 hover:text-primary-700 font-medium">View All →</button>
                    </div>
                    <div className="divide-y divide-gray-50">
                      {stats.recentUsers?.map((u: any) => (
                        <div key={u._id} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50/50">
                          <div className="flex items-center space-x-3">
                            <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold text-sm">
                              {u.name?.charAt(0) || '?'}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{u.name}</p>
                              <p className="text-xs text-gray-400">{u.email}</p>
                            </div>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getRoleColor(u.role)}`}>
                            {u.role}
                          </span>
                        </div>
                      ))}
                      {(!stats.recentUsers || stats.recentUsers.length === 0) && (
                        <div className="px-6 py-8 text-center text-gray-400 text-sm">No users yet</div>
                      )}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                      <h3 className="font-bold text-gray-900">Recent Appointments</h3>
                      <button onClick={() => setActiveTab('appointments')} className="text-sm text-primary-600 hover:text-primary-700 font-medium">View All →</button>
                    </div>
                    <div className="divide-y divide-gray-50">
                      {stats.recentAppointments?.map((apt: any) => (
                        <div key={apt._id} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50/50">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {apt.patientId?.name || 'Patient'} → {apt.doctorId?.name || 'Doctor'}
                            </p>
                            <p className="text-xs text-gray-400">{formatDate(apt.createdAt)}</p>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(apt.status)}`}>
                            {apt.status}
                          </span>
                        </div>
                      ))}
                      {(!stats.recentAppointments || stats.recentAppointments.length === 0) && (
                        <div className="px-6 py-8 text-center text-gray-400 text-sm">No appointments yet</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Doctors Tab */}
            {activeTab === 'doctors' && (
              <div className="space-y-4">
                <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center justify-between">
                  <h3 className="font-bold text-gray-900">All Doctors ({doctors.length})</h3>
                  <button onClick={fetchDoctors} className="text-sm text-primary-600 font-medium hover:text-primary-700">Refresh</button>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {doctors.map((doc: any) => (
                    <div key={doc._id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                      <div className="p-5">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-lg">
                            {doc.user?.name?.charAt(0) || 'D'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">{doc.user?.name || 'Unknown'}</p>
                            <p className="text-xs text-gray-400 truncate">{doc.user?.email}</p>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${doc.isAvailable !== false ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {doc.isAvailable !== false ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Specialization</span>
                            <span className="font-medium text-gray-900">{doc.specialization}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Experience</span>
                            <span className="font-medium text-gray-900">{doc.experience} yrs</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Qualification</span>
                            <span className="font-medium text-gray-900">{doc.qualification}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Fee</span>
                            <span className="font-bold text-primary-600">৳{doc.consultationFee}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Rating</span>
                            <span className="font-medium text-gray-900">⭐ {doc.rating?.toFixed(1) || '0.0'} ({doc.totalReviews || 0})</span>
                          </div>
                        </div>
                        {doc.availableDays && (
                          <div className="mt-3 flex flex-wrap gap-1">
                            {doc.availableDays.map((day: string) => (
                              <span key={day} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">{day.slice(0, 3)}</span>
                            ))}
                          </div>
                        )}
                        <div className="mt-4 flex space-x-2">
                          <button
                            onClick={() => handleEditDoctorProfile(doc.user?._id || doc.user)}
                            className="flex-1 px-3 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors"
                          >
                            Edit Profile
                          </button>
                          <Link
                            href={`/doctors/${doc._id}`}
                            className="px-3 py-2 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                          >
                            View
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                  {doctors.length === 0 && (
                    <div className="col-span-full text-center py-12 text-gray-400">No doctors found</div>
                  )}
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="space-y-4">
                <div className="bg-white rounded-2xl border border-gray-100 p-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <input
                        type="text"
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
                        placeholder="Search users..."
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <select
                      value={userFilter}
                      onChange={(e) => setUserFilter(e.target.value)}
                      className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">All Roles</option>
                      <option value="patient">Patient</option>
                      <option value="doctor">Doctor</option>
                      <option value="pharmacist">Pharmacist</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button onClick={fetchUsers} className="px-6 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors">
                      Search
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                          <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                          <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                          <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Phone</th>
                          <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Joined</th>
                          <th className="text-right px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {users.map((u) => (
                          <tr key={u._id} className="hover:bg-gray-50/50">
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold text-sm flex-shrink-0">
                                  {u.name?.charAt(0) || '?'}
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-gray-900">{u.name}</p>
                                  <p className="text-xs text-gray-400">{u.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getRoleColor(u.role)}`}>
                                {u.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">{u.phone || '-'}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${u.isActive !== false ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                {u.isActive !== false ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">{formatDate(u.createdAt)}</td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end space-x-2">
                                <button
                                  onClick={() => { setEditUser({ ...u }); setShowEditModal(true); }}
                                  className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                  title="Edit"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                {u.role === 'doctor' && (
                                  <button
                                    onClick={() => handleEditDoctorProfile(u._id)}
                                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Edit Doctor Profile"
                                  >
                                    <span className="text-sm">👨‍⚕️</span>
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDeleteUser(u._id)}
                                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {users.length === 0 && (
                          <tr>
                            <td colSpan={6} className="px-6 py-12 text-center text-gray-400">No users found</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Appointments Tab */}
            {activeTab === 'appointments' && (
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="font-bold text-gray-900">All Appointments ({appointments.length})</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Serial #</th>
                        <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Patient</th>
                        <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Doctor</th>
                        <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Fee</th>
                        <th className="text-right px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {appointments.map((apt: any) => (
                        <tr key={apt._id} className="hover:bg-gray-50/50">
                          <td className="px-6 py-4">
                            <span className="font-mono text-sm font-bold text-primary-600">{apt.serialNumber || apt._id?.slice(-6)}</span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">{apt.patientId?.name || 'N/A'}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{apt.doctorId?.name || 'N/A'}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {apt.appointmentDate ? formatDate(apt.appointmentDate) : formatDate(apt.createdAt)}
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm">{apt.type === 'video' ? '📹 Video' : '🏥 In-Person'}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(apt.status)}`}>
                              {apt.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-gray-900">৳{apt.consultationFee || '0'}</td>
                          <td className="px-6 py-4 text-right">
                            <select
                              value={apt.status}
                              onChange={(e) => handleAppointmentStatus(apt._id, e.target.value)}
                              className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="in-progress">In Progress</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                      {appointments.length === 0 && (
                        <tr>
                          <td colSpan={8} className="px-6 py-12 text-center text-gray-400">No appointments found</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="font-bold text-gray-900">All Orders ({orders.length})</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Order ID</th>
                        <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                        <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Items</th>
                        <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Total</th>
                        <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {orders.map((order: any) => (
                        <tr key={order._id} className="hover:bg-gray-50/50">
                          <td className="px-6 py-4">
                            <span className="font-mono text-sm font-bold text-gray-600">#{order._id?.slice(-8)}</span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">{order.userId?.name || 'N/A'}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">{order.items?.length || 0} items</td>
                          <td className="px-6 py-4 text-sm font-bold text-gray-900">৳{order.totalAmount || '0'}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">{formatDate(order.createdAt)}</td>
                        </tr>
                      ))}
                      {orders.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-gray-400">No orders found</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Edit User Modal */}
      {showEditModal && editUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowEditModal(false)}></div>
            <div className="relative bg-white rounded-2xl max-w-md w-full shadow-2xl z-10">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">Edit User</h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input type="text" value={editUser.name} onChange={(e) => setEditUser({ ...editUser, name: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" value={editUser.email} onChange={(e) => setEditUser({ ...editUser, email: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select value={editUser.role} onChange={(e) => setEditUser({ ...editUser, role: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                    <option value="patient">Patient</option>
                    <option value="doctor">Doctor</option>
                    <option value="pharmacist">Pharmacist</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input type="text" value={editUser.phone || ''} onChange={(e) => setEditUser({ ...editUser, phone: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div className="flex items-center space-x-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={editUser.isActive !== false} onChange={(e) => setEditUser({ ...editUser, isActive: e.target.checked })} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                  <span className="text-sm font-medium text-gray-700">{editUser.isActive !== false ? 'Active' : 'Inactive'}</span>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end space-x-3">
                <button onClick={() => setShowEditModal(false)} className="px-5 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
                <button onClick={handleUpdateUser} className="px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors">Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Doctor Profile Modal */}
      {showDoctorModal && editDoctorProfile && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowDoctorModal(false)}></div>
            <div className="relative bg-white rounded-2xl max-w-lg w-full shadow-2xl z-10 max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
                <h2 className="text-lg font-bold text-gray-900">Edit Doctor Profile</h2>
                <p className="text-xs text-gray-400">Update professional information for this doctor</p>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                  <select value={editDoctorProfile.specialization || ''} onChange={(e) => setEditDoctorProfile({ ...editDoctorProfile, specialization: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
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
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Experience (yrs)</label>
                    <input type="number" value={editDoctorProfile.experience || 0} onChange={(e) => setEditDoctorProfile({ ...editDoctorProfile, experience: Number(e.target.value) })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fee (৳)</label>
                    <input type="number" value={editDoctorProfile.consultationFee || 0} onChange={(e) => setEditDoctorProfile({ ...editDoctorProfile, consultationFee: Number(e.target.value) })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
                  <input type="text" value={editDoctorProfile.qualification || ''} onChange={(e) => setEditDoctorProfile({ ...editDoctorProfile, qualification: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  <textarea value={editDoctorProfile.bio || ''} onChange={(e) => setEditDoctorProfile({ ...editDoctorProfile, bio: e.target.value })} rows={3} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Clinic Address</label>
                  <input type="text" value={editDoctorProfile.clinicAddress || ''} onChange={(e) => setEditDoctorProfile({ ...editDoctorProfile, clinicAddress: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div className="flex items-center space-x-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={editDoctorProfile.isAvailable !== false} onChange={(e) => setEditDoctorProfile({ ...editDoctorProfile, isAvailable: e.target.checked })} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                  <span className="text-sm font-medium text-gray-700">{editDoctorProfile.isAvailable !== false ? 'Available' : 'Unavailable'}</span>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end space-x-3 sticky bottom-0 bg-white">
                <button onClick={() => setShowDoctorModal(false)} className="px-5 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
                <button onClick={handleUpdateDoctorProfile} className="px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors">Save Doctor Profile</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}