'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

interface Stats {
  users: number; doctors: number; appointments: number; medicines: number;
  orders: number; reviews: number; prescriptions: number; revenue: number;
  recentUsers: any[]; recentAppointments: any[]; appointmentStats: Record<string, number>;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [medicines, setMedicines] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [content, setContent] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editItem, setEditItem] = useState<any>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!userStr || !token) { router.push('/admin/login'); return; }
    try {
      const user = JSON.parse(userStr);
      if (user.role !== 'admin') { router.push('/admin/login'); return; }
      setIsAdmin(true);
    } catch { router.push('/admin/login'); return; }
    setChecking(false);
  }, [router]);

  useEffect(() => { if (isAdmin) fetchAll(); }, [isAdmin]);

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([fetchStats(), fetchUsers(), fetchAppointments(), fetchOrders(), fetchDoctors(), fetchMedicines(), fetchReviews(), fetchPrescriptions(), fetchNotifs(), fetchContent()]);
    setLoading(false);
  };

  const fetchStats = async () => { try { const r = await api.get('/admin/stats'); setStats(r.data.data); } catch {} };
  const fetchUsers = async () => { try { const r = await api.get('/admin/users'); setUsers(r.data.data || []); } catch {} };
  const fetchAppointments = async () => { try { const r = await api.get('/admin/appointments'); setAppointments(r.data.data || []); } catch {} };
  const fetchOrders = async () => { try { const r = await api.get('/admin/orders'); setOrders(r.data.data || []); } catch {} };
  const fetchDoctors = async () => { try { const r = await api.get('/admin/doctors'); setDoctors(r.data.data || []); } catch {} };
  const fetchMedicines = async () => { try { const r = await api.get('/admin/medicines'); setMedicines(r.data.data || []); } catch {} };
  const fetchReviews = async () => { try { const r = await api.get('/admin/reviews'); setReviews(r.data.data || []); } catch {} };
  const fetchPrescriptions = async () => { try { const r = await api.get('/admin/prescriptions'); setPrescriptions(r.data.data || []); } catch {} };
  const fetchNotifs = async () => { try { const r = await api.get('/admin/notifications'); setNotifications(r.data.data || []); } catch {} };
  const fetchContent = async () => { try { const r = await api.get('/content'); setContent(r.data.data || {}); } catch {} };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  const getStatusColor = (s: string) => ({ pending: 'bg-yellow-100 text-yellow-700 border-yellow-200', confirmed: 'bg-blue-100 text-blue-700 border-blue-200', completed: 'bg-green-100 text-green-700 border-green-200', cancelled: 'bg-red-100 text-red-700 border-red-200', 'in-progress': 'bg-purple-100 text-purple-700 border-purple-200', delivered: 'bg-green-100 text-green-700 border-green-200', processing: 'bg-indigo-100 text-indigo-700 border-indigo-200' }[s] || 'bg-gray-100 text-gray-700 border-gray-200');
  const getRoleColor = (r: string) => ({ admin: 'bg-red-100 text-red-700', doctor: 'bg-blue-100 text-blue-700', patient: 'bg-green-100 text-green-700' }[r] || 'bg-gray-100 text-gray-700');

  const handleLogout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); router.push('/admin/login'); };

  // Generic CRUD actions
  const handleToggleUserStatus = async (id: string) => { try { await api.put(`/admin/users/${id}/toggle-status`); fetchUsers(); } catch { alert('Failed to update status'); } };
  const handleDeleteUser = async (id: string) => { if (!confirm('Delete this user permanently?')) return; try { await api.delete(`/admin/users/${id}`); fetchUsers(); fetchStats(); } catch {} };
  const handleAppointmentStatus = async (id: string, status: string) => { try { await api.put(`/admin/appointments/${id}/status`, { status }); fetchAppointments(); } catch {} };
  const handleOrderStatus = async (id: string, status: string) => { try { await api.put(`/admin/orders/${id}/status`, { status }); fetchOrders(); } catch {} };
  const handleDeleteDoctor = async (id: string) => { if (!confirm('Delete this doctor and their user account?')) return; try { await api.delete(`/admin/doctors/${id}`); fetchDoctors(); fetchStats(); } catch {} };
  const handleDeleteMedicine = async (id: string) => { if (!confirm('Delete this medicine?')) return; try { await api.delete(`/admin/medicines/${id}`); fetchMedicines(); fetchStats(); } catch {} };
  const handleDeleteReview = async (id: string) => { if (!confirm('Delete this review?')) return; try { await api.delete(`/admin/reviews/${id}`); fetchReviews(); } catch {} };

  // Modal management
  const openModal = (type: string, item?: any) => {
    setModalType(type);
    setEditItem(item || null);
    if (item) {
      setFormData({ ...item });
    } else {
      setFormData({});
    }
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setModalType(''); setEditItem(null); setFormData({}); };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (modalType === 'addDoctor') {
        await api.post('/admin/doctors', formData);
        fetchDoctors(); fetchStats();
      } else if (modalType === 'editDoctor') {
        await api.put(`/admin/users/${editItem.user?._id || editItem.user}/doctor-profile`, formData);
        fetchDoctors();
      } else if (modalType === 'addMedicine') {
        await api.post('/admin/medicines', formData);
        fetchMedicines(); fetchStats();
      } else if (modalType === 'editMedicine') {
        await api.put(`/admin/medicines/${editItem._id}`, formData);
        fetchMedicines();
      } else if (modalType === 'sendNotification') {
        await api.post('/admin/notifications', formData);
        fetchNotifs();
      } else if (modalType === 'editUser') {
        await api.put(`/admin/users/${editItem._id}`, formData);
        fetchUsers();
      }
      closeModal();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save');
    }
    setSaving(false);
  };

  // Content management
  const handleSeedContent = async () => { if (!confirm('Seed default content?')) return; setSaving(true); try { const r = await api.post('/content/seed'); setContent(r.data.data || {}); } catch {} setSaving(false); };

  if (checking) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"></div></div>;
  if (!isAdmin) return null;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'doctors', label: 'Doctors', icon: '👨‍⚕️' },
    { id: 'medicines', label: 'Medicines', icon: '💊' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'appointments', label: 'Appointments', icon: '📅' },
    { id: 'orders', label: 'Orders', icon: '🛒' },
    { id: 'prescriptions', label: 'Prescriptions', icon: '📋' },
    { id: 'reviews', label: 'Reviews', icon: '⭐' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'content', label: 'Website Content', icon: '🎨' },
  ];

  return (
    <div className="min-h-screen bg-gray-50/80 flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 text-white transition-all duration-300 flex flex-col min-h-screen fixed left-0 top-0 z-40 shadow-2xl`}>
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <span className="text-lg">🛡️</span>
            </div>
            {sidebarOpen && <div><h1 className="font-bold text-lg">MediCare+</h1><p className="text-[10px] text-gray-400 uppercase tracking-wider">Admin Panel</p></div>}
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); setSearchQuery(''); setFilterStatus(''); }}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
              <span className="text-base">{tab.icon}</span>
              {sidebarOpen && <span>{tab.label}</span>}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-800 space-y-0.5">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-all">
            <span>↔️</span>{sidebarOpen && <span>Collapse</span>}
          </button>
          <Link href="/" className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-all block">
            <span>🌐</span>{sidebarOpen && <span>View Site</span>}
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:bg-red-900/30 hover:text-red-400 transition-all">
            <span>🚪</span>{sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
        <div className="p-6 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{tabs.find(t => t.id === activeTab)?.icon} {tabs.find(t => t.id === activeTab)?.label}</h2>
              <p className="text-sm text-gray-500 mt-0.5">Manage your telemedicine platform</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={fetchAll} className="px-3 py-2 text-sm bg-white border rounded-xl hover:bg-gray-50 transition-colors">🔄 Refresh</button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20"><div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div><p className="text-gray-400 mt-4">Loading data...</p></div>
          ) : (
            <>

              {/* ===== OVERVIEW ===== */}
              {activeTab === 'overview' && stats && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                    {[
                      { label: 'Users', value: stats.users, icon: '👥', color: 'from-blue-500 to-blue-600' },
                      { label: 'Doctors', value: stats.doctors, icon: '👨‍⚕️', color: 'from-green-500 to-green-600' },
                      { label: 'Appointments', value: stats.appointments, icon: '📅', color: 'from-purple-500 to-purple-600' },
                      { label: 'Medicines', value: stats.medicines, icon: '💊', color: 'from-orange-500 to-orange-600' },
                      { label: 'Orders', value: stats.orders, icon: '🛒', color: 'from-pink-500 to-pink-600' },
                      { label: 'Reviews', value: stats.reviews, icon: '⭐', color: 'from-amber-500 to-amber-600' },
                      { label: 'Revenue', value: `৳${stats.revenue?.toLocaleString() || 0}`, icon: '💰', color: 'from-emerald-500 to-emerald-600' },
                    ].map(s => (
                      <div key={s.label} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
                        <div className={`h-1.5 bg-gradient-to-r ${s.color}`}></div>
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs text-gray-400 uppercase font-medium">{s.label}</p>
                            <span className="text-lg">{s.icon}</span>
                          </div>
                          <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Appointment Stats */}
                  <div className="grid md:grid-cols-3 gap-4">
                    {['pending', 'confirmed', 'completed', 'cancelled', 'in-progress'].map(status => (
                      <div key={status} className={`rounded-2xl border p-4 ${getStatusColor(status)}`}>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium capitalize">{status}</span>
                          <span className="text-2xl font-bold">{stats.appointmentStats?.[status] || 0}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl border p-6">
                      <h3 className="font-bold text-lg mb-4">👤 Recent Users</h3>
                      {(stats.recentUsers || []).map((u: any) => (
                        <div key={u._id} className="flex items-center justify-between py-3 border-b last:border-0">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm">{u.name?.charAt(0)}</div>
                            <div><p className="text-sm font-semibold">{u.name}</p><p className="text-xs text-gray-400">{u.email}</p></div>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRoleColor(u.role)}`}>{u.role}</span>
                        </div>
                      ))}
                    </div>
                    <div className="bg-white rounded-2xl border p-6">
                      <h3 className="font-bold text-lg mb-4">📅 Recent Appointments</h3>
                      {(stats.recentAppointments || []).map((a: any) => (
                        <div key={a._id} className="flex items-center justify-between py-3 border-b last:border-0">
                          <div><p className="text-sm font-semibold">{a.patientId?.name || 'Patient'} → {a.doctorId?.name || 'Doctor'}</p><p className="text-xs text-gray-400">{formatDate(a.createdAt)}</p></div>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border ${getStatusColor(a.status)}`}>{a.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ===== DOCTORS ===== */}
              {activeTab === 'doctors' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search doctors..." className="px-4 py-2.5 border rounded-xl text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <button onClick={() => openModal('addDoctor')} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30">+ Add Doctor</button>
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {doctors.filter((d: any) => !searchQuery || d.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || d.specialization?.toLowerCase().includes(searchQuery.toLowerCase())).map((doc: any) => (
                      <div key={doc._id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg transition-shadow">
                        <div className="flex items-start space-x-3 mb-4">
                          <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center text-blue-700 font-bold text-xl flex-shrink-0">{doc.user?.name?.charAt(0) || 'D'}</div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-900 truncate">{doc.user?.name || 'Unknown'}</p>
                            <p className="text-sm text-blue-600 font-medium">{doc.specialization}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{doc.qualification}</p>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${doc.isAvailable !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{doc.isAvailable !== false ? 'Active' : 'Inactive'}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center mb-4">
                          <div className="bg-gray-50 rounded-xl p-2"><p className="text-lg font-bold text-gray-900">{doc.experience}</p><p className="text-[10px] text-gray-400">Years Exp</p></div>
                          <div className="bg-gray-50 rounded-xl p-2"><p className="text-lg font-bold text-blue-600">৳{doc.consultationFee}</p><p className="text-[10px] text-gray-400">Fee</p></div>
                          <div className="bg-gray-50 rounded-xl p-2"><p className="text-lg font-bold text-amber-600">{doc.rating?.toFixed(1) || '0.0'}</p><p className="text-[10px] text-gray-400">Rating</p></div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => openModal('editDoctor', doc)} className="flex-1 py-2 bg-blue-50 text-blue-700 rounded-xl text-xs font-semibold hover:bg-blue-100 transition-colors">✏️ Edit</button>
                          <button onClick={() => handleDeleteDoctor(doc._id)} className="py-2 px-3 bg-red-50 text-red-600 rounded-xl text-xs font-semibold hover:bg-red-100 transition-colors">🗑️</button>
                        </div>
                      </div>
                    ))}
                    {doctors.length === 0 && <div className="col-span-full text-center py-16 text-gray-400"><span className="text-4xl block mb-2">👨‍⚕️</span>No doctors found</div>}
                  </div>
                </div>
              )}

              {/* ===== MEDICINES ===== */}
              {activeTab === 'medicines' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search medicines..." className="px-4 py-2.5 border rounded-xl text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <button onClick={() => openModal('addMedicine')} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30">+ Add Medicine</button>
                  </div>
                  <div className="bg-white rounded-2xl border overflow-hidden overflow-x-auto">
                    <table className="w-full">
                      <thead><tr className="bg-gray-50 border-b">
                        <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase">Medicine</th>
                        <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase">Category</th>
                        <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase">Price</th>
                        <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase">Stock</th>
                        <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase">Rx</th>
                        <th className="text-right px-5 py-3 text-xs font-bold text-gray-500 uppercase">Actions</th>
                      </tr></thead>
                      <tbody className="divide-y">
                        {medicines.filter((m: any) => !searchQuery || m.name?.toLowerCase().includes(searchQuery.toLowerCase()) || m.genericName?.toLowerCase().includes(searchQuery.toLowerCase())).map((med: any) => (
                          <tr key={med._id} className="hover:bg-gray-50/50">
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-lg">💊</div>
                                <div><p className="text-sm font-semibold">{med.name}</p><p className="text-xs text-gray-400">{med.genericName || med.brand || '-'}</p></div>
                              </div>
                            </td>
                            <td className="px-5 py-3"><span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs font-medium">{med.category || '-'}</span></td>
                            <td className="px-5 py-3"><p className="text-sm font-bold">৳{med.price}</p>{med.discount > 0 && <p className="text-xs text-green-600">{med.discount}% off</p>}</td>
                            <td className="px-5 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${(med.stockQuantity || 0) > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{med.stockQuantity || 0} units</span></td>
                            <td className="px-5 py-3">{med.prescriptionRequired ? <span className="text-red-500 text-xs font-medium">Yes</span> : <span className="text-green-500 text-xs">No</span>}</td>
                            <td className="px-5 py-3 text-right">
                              <div className="flex justify-end gap-1">
                                <button onClick={() => openModal('editMedicine', med)} className="px-2.5 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100">Edit</button>
                                <button onClick={() => handleDeleteMedicine(med._id)} className="px-2.5 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100">Delete</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {medicines.length === 0 && <tr><td colSpan={6} className="px-5 py-12 text-center text-gray-400">No medicines found</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ===== USERS ===== */}
              {activeTab === 'users' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex gap-3">
                      <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search users..." className="px-4 py-2.5 border rounded-xl text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">All Roles</option><option value="patient">Patients</option><option value="doctor">Doctors</option><option value="admin">Admins</option>
                      </select>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl border overflow-hidden overflow-x-auto">
                    <table className="w-full">
                      <thead><tr className="bg-gray-50 border-b">
                        <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase">User</th>
                        <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase">Role</th>
                        <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase">Status</th>
                        <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase">Joined</th>
                        <th className="text-right px-5 py-3 text-xs font-bold text-gray-500 uppercase">Actions</th>
                      </tr></thead>
                      <tbody className="divide-y">
                        {users.filter((u: any) => (!searchQuery || u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || u.email?.toLowerCase().includes(searchQuery.toLowerCase())) && (!filterStatus || u.role === filterStatus)).map((u: any) => (
                          <tr key={u._id} className="hover:bg-gray-50/50">
                            <td className="px-5 py-3"><div className="flex items-center gap-3"><div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm">{u.name?.charAt(0)}</div><div><p className="text-sm font-semibold">{u.name}</p><p className="text-xs text-gray-400">{u.email}</p></div></div></td>
                            <td className="px-5 py-3"><span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(u.role)}`}>{u.role}</span></td>
                            <td className="px-5 py-3"><span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${u.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{u.isActive !== false ? 'Active' : 'Suspended'}</span></td>
                            <td className="px-5 py-3 text-sm text-gray-500">{formatDate(u.createdAt)}</td>
                            <td className="px-5 py-3 text-right">
                              <div className="flex justify-end gap-1">
                                <button onClick={() => openModal('editUser', u)} className="px-2.5 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100">Edit</button>
                                <button onClick={() => handleToggleUserStatus(u._id)} className={`px-2.5 py-1.5 rounded-lg text-xs font-medium ${u.isActive !== false ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}>{u.isActive !== false ? 'Suspend' : 'Activate'}</button>
                                <button onClick={() => handleDeleteUser(u._id)} className="px-2.5 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100">Delete</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ===== APPOINTMENTS ===== */}
              {activeTab === 'appointments' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex gap-3">
                      <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search patient/doctor..." className="px-4 py-2.5 border rounded-xl text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">All Status</option><option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="in-progress">In Progress</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                    <p className="text-sm text-gray-500">{appointments.length} total appointments</p>
                  </div>
                  <div className="bg-white rounded-2xl border overflow-hidden overflow-x-auto">
                    <table className="w-full">
                      <thead><tr className="bg-gray-50 border-b">
                        <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase">Serial #</th>
                        <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase">Patient</th>
                        <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase">Doctor</th>
                        <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase">Type</th>
                        <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase">Date</th>
                        <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase">Status</th>
                        <th className="text-right px-5 py-3 text-xs font-bold text-gray-500 uppercase">Actions</th>
                      </tr></thead>
                      <tbody className="divide-y">
                        {appointments.filter((a: any) => (!filterStatus || a.status === filterStatus) && (!searchQuery || a.patientId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || a.doctorId?.name?.toLowerCase().includes(searchQuery.toLowerCase()))).map((apt: any) => (
                          <tr key={apt._id} className="hover:bg-gray-50/50">
                            <td className="px-5 py-3"><span className="font-mono text-sm font-bold text-blue-600">#{apt.serialNumber || apt._id?.slice(-6)}</span></td>
                            <td className="px-5 py-3 text-sm">{apt.patientId?.name || 'N/A'}</td>
                            <td className="px-5 py-3 text-sm">{apt.doctorId?.name || 'N/A'}</td>
                            <td className="px-5 py-3"><span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs font-medium capitalize">{apt.type || apt.appointmentType || 'Video'}</span></td>
                            <td className="px-5 py-3 text-sm text-gray-500">{apt.appointmentDate ? formatDate(apt.appointmentDate) : formatDate(apt.createdAt)}</td>
                            <td className="px-5 py-3"><span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border ${getStatusColor(apt.status)}`}>{apt.status}</span></td>
                            <td className="px-5 py-3 text-right">
                              <select value={apt.status} onChange={(e) => handleAppointmentStatus(apt._id, e.target.value)} className="text-xs border rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                                <option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="in-progress">In Progress</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                        {appointments.length === 0 && <tr><td colSpan={7} className="px-5 py-12 text-center text-gray-400">No appointments found</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ===== ORDERS ===== */}
              {activeTab === 'orders' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">All Status</option><option value="pending">Pending</option><option value="processing">Processing</option><option value="delivered">Delivered</option><option value="cancelled">Cancelled</option>
                    </select>
                    <p className="text-sm text-gray-500">{orders.length} total orders</p>
                  </div>
                  <div className="bg-white rounded-2xl border overflow-hidden overflow-x-auto">
                    <table className="w-full">
                      <thead><tr className="bg-gray-50 border-b">
                        <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase">Order ID</th>
                        <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase">Customer</th>
                        <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase">Items</th>
                        <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase">Total</th>
                        <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase">Status</th>
                        <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase">Date</th>
                        <th className="text-right px-5 py-3 text-xs font-bold text-gray-500 uppercase">Actions</th>
                      </tr></thead>
                      <tbody className="divide-y">
                        {orders.filter((o: any) => !filterStatus || o.status === filterStatus).map((o: any) => (
                          <tr key={o._id} className="hover:bg-gray-50/50">
                            <td className="px-5 py-3"><span className="font-mono text-sm font-bold">#{o._id?.slice(-8)}</span></td>
                            <td className="px-5 py-3 text-sm">{o.userId?.name || 'N/A'}</td>
                            <td className="px-5 py-3 text-sm text-gray-500">{o.items?.length || 0} items</td>
                            <td className="px-5 py-3"><span className="text-sm font-bold text-green-600">৳{o.totalAmount || '0'}</span></td>
                            <td className="px-5 py-3"><span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border ${getStatusColor(o.status)}`}>{o.status}</span></td>
                            <td className="px-5 py-3 text-sm text-gray-500">{formatDate(o.createdAt)}</td>
                            <td className="px-5 py-3 text-right">
                              <select value={o.status} onChange={(e) => handleOrderStatus(o._id, e.target.value)} className="text-xs border rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                                <option value="pending">Pending</option><option value="processing">Processing</option><option value="delivered">Delivered</option><option value="cancelled">Cancelled</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                        {orders.length === 0 && <tr><td colSpan={7} className="px-5 py-12 text-center text-gray-400">No orders found</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ===== PRESCRIPTIONS ===== */}
              {activeTab === 'prescriptions' && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-500">{prescriptions.length} total prescriptions</p>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {prescriptions.map((rx: any) => (
                      <div key={rx._id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs text-gray-400">{formatDate(rx.createdAt)}</span>
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">Rx</span>
                        </div>
                        <div className="mb-3">
                          <p className="text-sm"><span className="text-gray-400">Patient:</span> <span className="font-semibold">{rx.patient?.name || 'N/A'}</span></p>
                          <p className="text-sm"><span className="text-gray-400">Doctor:</span> <span className="font-semibold">{rx.doctor?.user?.name || rx.doctor?.name || 'N/A'}</span></p>
                        </div>
                        <div className="border-t pt-3">
                          <p className="text-xs text-gray-400 mb-1">Medicines:</p>
                          {(rx.medicines || rx.items || []).slice(0, 3).map((med: any, i: number) => (
                            <p key={i} className="text-xs text-gray-600">• {med.name || med.medicine?.name || 'Medicine'} - {med.dosage || med.dosageInstructions || ''}</p>
                          ))}
                          {(rx.medicines || rx.items || []).length > 3 && <p className="text-xs text-gray-400">+{(rx.medicines || rx.items).length - 3} more</p>}
                        </div>
                      </div>
                    ))}
                    {prescriptions.length === 0 && <div className="col-span-full text-center py-16 text-gray-400"><span className="text-4xl block mb-2">📋</span>No prescriptions found</div>}
                  </div>
                </div>
              )}

              {/* ===== REVIEWS ===== */}
              {activeTab === 'reviews' && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-500">{reviews.length} total reviews</p>
                  <div className="space-y-3">
                    {reviews.map((rev: any) => (
                      <div key={rev._id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 font-bold text-sm">{rev.patient?.name?.charAt(0) || '?'}</div>
                            <div>
                              <p className="font-semibold text-sm">{rev.patient?.name || 'Anonymous'}</p>
                              <p className="text-xs text-gray-400">reviewed {rev.doctor?.user?.name || rev.doctor?.name || 'Doctor'} • {formatDate(rev.createdAt)}</p>
                              <div className="flex items-center gap-1 mt-1">
                                {[1,2,3,4,5].map(s => <span key={s} className={`text-sm ${s <= rev.rating ? 'text-amber-400' : 'text-gray-200'}`}>★</span>)}
                                <span className="text-xs text-gray-500 ml-1">{rev.rating}/5</span>
                              </div>
                              {rev.comment && <p className="text-sm text-gray-600 mt-2">{rev.comment}</p>}
                            </div>
                          </div>
                          <button onClick={() => handleDeleteReview(rev._id)} className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors">Remove</button>
                        </div>
                      </div>
                    ))}
                    {reviews.length === 0 && <div className="text-center py-16 text-gray-400"><span className="text-4xl block mb-2">⭐</span>No reviews found</div>}
                  </div>
                </div>
              )}

              {/* ===== NOTIFICATIONS ===== */}
              {activeTab === 'notifications' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">{notifications.length} notifications sent</p>
                    <button onClick={() => openModal('sendNotification')} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30">+ Send Notification</button>
                  </div>
                  <div className="space-y-3">
                    {notifications.map((n: any) => (
                      <div key={n._id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-lg">🔔</div>
                            <div>
                              <p className="font-semibold text-sm">{n.title}</p>
                              <p className="text-xs text-gray-400">To: {n.recipient?.name || 'Unknown'} ({n.recipient?.role || 'user'}) • {formatDate(n.createdAt)}</p>
                              <p className="text-sm text-gray-600 mt-1">{n.message}</p>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs font-medium capitalize">{n.type || 'system'}</span>
                        </div>
                      </div>
                    ))}
                    {notifications.length === 0 && <div className="text-center py-16 text-gray-400"><span className="text-4xl block mb-2">🔔</span>No notifications sent yet</div>}
                  </div>
                </div>
              )}

              {/* ===== WEBSITE CONTENT ===== */}
              {activeTab === 'content' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <p className="text-gray-500 text-sm">Manage website content sections</p>
                    <button onClick={handleSeedContent} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50">{saving ? 'Seeding...' : '🌱 Seed Default Content'}</button>
                  </div>
                  {['hero', 'features', 'stats', 'cta', 'footer'].map(section => {
                    const data = content[section];
                    return (
                      <div key={section} className="bg-white rounded-2xl border p-5">
                        <div className="flex items-center justify-between mb-3">
                          <div><h3 className="font-bold text-gray-900 capitalize text-lg">{section}</h3>{data?.title && <p className="text-sm text-gray-500">{data.title}</p>}</div>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${data ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{data ? 'Active' : 'Empty'}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* ===== UNIVERSAL MODAL ===== */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-start justify-center min-h-screen p-4 pt-20">
            <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={closeModal}></div>
            <div className="relative bg-white rounded-2xl max-w-2xl w-full shadow-2xl z-10 max-h-[80vh] overflow-y-auto">
              <div className="sticky top-0 bg-white px-6 py-4 border-b flex items-center justify-between z-10 rounded-t-2xl">
                <h2 className="text-lg font-bold">
                  {modalType === 'addDoctor' && '➕ Add New Doctor'}
                  {modalType === 'editDoctor' && '✏️ Edit Doctor Profile'}
                  {modalType === 'addMedicine' && '➕ Add New Medicine'}
                  {modalType === 'editMedicine' && '✏️ Edit Medicine'}
                  {modalType === 'sendNotification' && '🔔 Send Notification'}
                  {modalType === 'editUser' && '✏️ Edit User'}
                </h2>
                <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-600">✕</button>
              </div>
              <div className="p-6 space-y-4">

                {/* Add/Edit Doctor Form */}
                {(modalType === 'addDoctor' || modalType === 'editDoctor') && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label><input type="text" value={formData.name || formData.user?.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Dr. Name" /></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" value={formData.email || formData.user?.email || ''} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="doctor@email.com" disabled={modalType === 'editDoctor'} /></div>
                    </div>
                    {modalType === 'addDoctor' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone</label><input type="text" value={formData.phone || ''} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Password</label><input type="password" value={formData.password || ''} onChange={e => setFormData({ ...formData, password: e.target.value })} className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label><select value={formData.specialization || ''} onChange={e => setFormData({ ...formData, specialization: e.target.value })} className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Select</option><option>Cardiologist</option><option>Dermatologist</option><option>Gynecologist</option><option>Neurologist</option><option>Pediatrician</option><option>Orthopedic Surgeon</option><option>General Physician</option><option>Psychiatrist</option><option>ENT Specialist</option><option>Eye Specialist</option>
                      </select></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Experience (years)</label><input type="number" value={formData.experience || ''} onChange={e => setFormData({ ...formData, experience: +e.target.value })} className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label><input type="text" value={formData.qualification || ''} onChange={e => setFormData({ ...formData, qualification: e.target.value })} className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="MBBS, FCPS..." /></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Consultation Fee (৳)</label><input type="number" value={formData.consultationFee || ''} onChange={e => setFormData({ ...formData, consultationFee: +e.target.value })} className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                    </div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Bio</label><textarea value={formData.bio || ''} onChange={e => setFormData({ ...formData, bio: e.target.value })} rows={3} className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" /></div>
                  </>
                )}

                {/* Add/Edit Medicine Form */}
                {(modalType === 'addMedicine' || modalType === 'editMedicine') && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Medicine Name</label><input type="text" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Generic Name</label><input type="text" value={formData.genericName || ''} onChange={e => setFormData({ ...formData, genericName: e.target.value })} className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Brand</label><input type="text" value={formData.brand || ''} onChange={e => setFormData({ ...formData, brand: e.target.value })} className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Category</label><select value={formData.category || ''} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Select</option><option>Pain Relief</option><option>Antibiotics</option><option>Vitamins</option><option>Heart Care</option><option>Diabetes</option><option>Allergy</option><option>Digestive</option><option>Skin Care</option><option>Cough & Cold</option><option>Other</option>
                      </select></div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Price (৳)</label><input type="number" value={formData.price || ''} onChange={e => setFormData({ ...formData, price: +e.target.value })} className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Discount (%)</label><input type="number" value={formData.discount || 0} onChange={e => setFormData({ ...formData, discount: +e.target.value })} className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Stock</label><input type="number" value={formData.stockQuantity || 0} onChange={e => setFormData({ ...formData, stockQuantity: +e.target.value })} className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Dosage Form</label><input type="text" value={formData.dosageForm || ''} onChange={e => setFormData({ ...formData, dosageForm: e.target.value })} className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Tablet, Capsule, Syrup..." /></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Strength</label><input type="text" value={formData.strength || ''} onChange={e => setFormData({ ...formData, strength: e.target.value })} className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="500mg, 10ml..." /></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="rxRequired" checked={formData.prescriptionRequired || false} onChange={e => setFormData({ ...formData, prescriptionRequired: e.target.checked })} className="rounded" />
                      <label htmlFor="rxRequired" className="text-sm font-medium text-gray-700">Prescription Required</label>
                    </div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><textarea value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={3} className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" /></div>
                  </>
                )}

                {/* Send Notification Form */}
                {modalType === 'sendNotification' && (
                  <>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Title</label><input type="text" value={formData.title || ''} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Notification title" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Message</label><textarea value={formData.message || ''} onChange={e => setFormData({ ...formData, message: e.target.value })} rows={4} className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Write your message..." /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Type</label><select value={formData.type || ''} onChange={e => setFormData({ ...formData, type: e.target.value })} className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="system">System</option><option value="announcement">Announcement</option><option value="promotion">Promotion</option><option value="reminder">Reminder</option>
                      </select></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Send To</label><select value={formData.targetRole || ''} onChange={e => setFormData({ ...formData, targetRole: e.target.value })} className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Everyone</option><option value="patient">All Patients</option><option value="doctor">All Doctors</option>
                      </select></div>
                    </div>
                  </>
                )}

                {/* Edit User Form */}
                {modalType === 'editUser' && (
                  <>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Name</label><input type="text" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" value={formData.email || ''} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone</label><input type="text" value={formData.phone || ''} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                  </>
                )}
              </div>

              <div className="sticky bottom-0 bg-white px-6 py-4 border-t flex justify-end space-x-3 rounded-b-2xl">
                <button onClick={closeModal} className="px-5 py-2.5 border rounded-xl text-sm font-medium hover:bg-gray-50">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 shadow-lg shadow-blue-600/30">
                  {saving ? 'Saving...' : '💾 Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}