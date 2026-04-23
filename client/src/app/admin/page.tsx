'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

interface ContentSection {
  section: string;
  title: string;
  subtitle?: string;
  description?: string;
  image?: string;
  items?: Array<{ icon?: string; title: string; description?: string; link?: string; image?: string }>;
  settings?: Record<string, any>;
}

interface Stats { users: number; doctors: number; appointments: number; medicines: number; orders: number; recentUsers: any[]; recentAppointments: any[]; }
interface User { _id: string; name: string; email: string; phone: string; role: string; isActive: boolean; createdAt: string; }

export default function AdminDashboardPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [content, setContent] = useState<Record<string, ContentSection>>({});
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<ContentSection | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

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

  useEffect(() => {
    if (isAdmin) { fetchAll(); }
  }, [isAdmin]);

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([fetchStats(), fetchUsers(), fetchAppointments(), fetchOrders(), fetchDoctors(), fetchContent()]);
    setLoading(false);
  };

  const fetchStats = async () => { try { const r = await api.get('/admin/stats'); setStats(r.data.data); } catch {} };
  const fetchUsers = async () => { try { const r = await api.get('/admin/users'); setUsers(r.data.data || []); } catch {} };
  const fetchAppointments = async () => { try { const r = await api.get('/admin/appointments'); setAppointments(r.data.data || []); } catch {} };
  const fetchOrders = async () => { try { const r = await api.get('/admin/orders'); setOrders(r.data.data || []); } catch {} };
  const fetchDoctors = async () => { try { const r = await api.get('/admin/doctors'); setDoctors(r.data.data || []); } catch {} };
  const fetchContent = async () => { try { const r = await api.get('/content'); setContent(r.data.data || {}); } catch {} };

  const handleSeedContent = async () => {
    if (!confirm('Seed default content? This will overwrite existing content.')) return;
    setSaving(true);
    try { const r = await api.post('/content/seed'); setContent(r.data.data || {}); alert('Content seeded!'); } catch { alert('Failed to seed'); }
    setSaving(false);
  };

  const handleSaveContent = async () => {
    if (!editForm) return;
    setSaving(true);
    try {
      await api.post('/content', editForm);
      await fetchContent();
      setEditingSection(null);
      setEditForm(null);
    } catch { alert('Failed to save'); }
    setSaving(false);
  };

  const startEdit = (section: string) => {
    const data = content[section];
    setEditForm(data ? { ...data, items: data.items ? [...data.items] : [] } : { section, title: '', subtitle: '', description: '', items: [] });
    setEditingSection(section);
  };

  const addItem = () => {
    if (!editForm) return;
    const items = [...(editForm.items || []), { icon: '', title: '', description: '', link: '' }];
    setEditForm({ ...editForm, items });
  };

  const updateItem = (index: number, field: string, value: string) => {
    if (!editForm?.items) return;
    const items = [...editForm.items];
    items[index] = { ...items[index], [field]: value };
    setEditForm({ ...editForm, items });
  };

  const removeItem = (index: number) => {
    if (!editForm?.items) return;
    setEditForm({ ...editForm, items: editForm.items.filter((_, i) => i !== index) });
  };

  const handleLogout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); router.push('/admin/login'); };
  const handleDeleteUser = async (id: string) => { if (!confirm('Delete this user?')) return; try { await api.delete(`/admin/users/${id}`); fetchUsers(); fetchStats(); } catch {} };
  const handleAppointmentStatus = async (id: string, status: string) => { try { await api.put(`/admin/appointments/${id}/status`, { status }); fetchAppointments(); } catch {} };
  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  const getStatusColor = (s: string) => ({ pending: 'bg-yellow-50 text-yellow-700', confirmed: 'bg-blue-50 text-blue-700', completed: 'bg-green-50 text-green-700', cancelled: 'bg-red-50 text-red-700', 'in-progress': 'bg-purple-50 text-purple-700', delivered: 'bg-green-50 text-green-700' }[s] || 'bg-gray-50 text-gray-700');
  const getRoleColor = (r: string) => ({ admin: 'bg-red-50 text-red-700', doctor: 'bg-blue-50 text-blue-700', patient: 'bg-green-50 text-green-700' }[r] || 'bg-gray-50 text-gray-700');

  if (checking) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full"></div></div>;
  if (!isAdmin) return null;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'content', label: 'Website Content', icon: '🎨' },
    { id: 'doctors', label: 'Doctors', icon: '👨‍⚕️' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'appointments', label: 'Appointments', icon: '📅' },
    { id: 'orders', label: 'Orders', icon: '🛒' },
  ];

  const contentSections = ['hero', 'features', 'stats', 'cta', 'footer'];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gray-900 text-white transition-all duration-300 flex flex-col min-h-screen fixed left-0 top-0 z-40`}>
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center flex-shrink-0"><span className="text-lg">🛡️</span></div>
            {sidebarOpen && <div><h1 className="font-bold text-lg">Medicare</h1><p className="text-xs text-gray-400">Admin Panel</p></div>}
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-primary-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
              <span className="text-lg">{tab.icon}</span>
              {sidebarOpen && <span>{tab.label}</span>}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-800 space-y-1">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-all">
            <span>↔️</span>{sidebarOpen && <span>Collapse</span>}
          </button>
          <Link href="/" className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-all">
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
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{tabs.find(t => t.id === activeTab)?.icon} {tabs.find(t => t.id === activeTab)?.label}</h2>
          </div>

          {loading ? (
            <div className="text-center py-20"><div className="animate-spin w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full mx-auto"></div></div>
          ) : (
            <>
              {/* OVERVIEW */}
              {activeTab === 'overview' && stats && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {[
                      { label: 'Users', value: stats.users, color: 'from-blue-500 to-blue-600' },
                      { label: 'Doctors', value: stats.doctors, color: 'from-green-500 to-green-600' },
                      { label: 'Appointments', value: stats.appointments, color: 'from-purple-500 to-purple-600' },
                      { label: 'Medicines', value: stats.medicines, color: 'from-orange-500 to-orange-600' },
                      { label: 'Orders', value: stats.orders, color: 'from-pink-500 to-pink-600' },
                    ].map(s => (
                      <div key={s.label} className="bg-white rounded-2xl border overflow-hidden">
                        <div className={`h-1.5 bg-gradient-to-r ${s.color}`}></div>
                        <div className="p-4"><p className="text-xs text-gray-400 uppercase font-medium">{s.label}</p><p className="text-3xl font-bold text-gray-900 mt-1">{s.value}</p></div>
                      </div>
                    ))}
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl border p-6">
                      <h3 className="font-bold mb-4">Recent Users</h3>
                      {(stats.recentUsers || []).map((u: any) => (
                        <div key={u._id} className="flex items-center justify-between py-2 border-b last:border-0">
                          <div><p className="text-sm font-medium">{u.name}</p><p className="text-xs text-gray-400">{u.email}</p></div>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRoleColor(u.role)}`}>{u.role}</span>
                        </div>
                      ))}
                      {(!stats.recentUsers?.length) && <p className="text-gray-400 text-sm text-center py-4">No users yet</p>}
                    </div>
                    <div className="bg-white rounded-2xl border p-6">
                      <h3 className="font-bold mb-4">Recent Appointments</h3>
                      {(stats.recentAppointments || []).map((a: any) => (
                        <div key={a._id} className="flex items-center justify-between py-2 border-b last:border-0">
                          <div><p className="text-sm font-medium">{a.patientId?.name || 'Patient'} → {a.doctorId?.name || 'Doctor'}</p><p className="text-xs text-gray-400">{formatDate(a.createdAt)}</p></div>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(a.status)}`}>{a.status}</span>
                        </div>
                      ))}
                      {(!stats.recentAppointments?.length) && <p className="text-gray-400 text-sm text-center py-4">No appointments yet</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* CONTENT MANAGEMENT */}
              {activeTab === 'content' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <p className="text-gray-500 text-sm">Manage all website content. Changes appear instantly.</p>
                    <button onClick={handleSeedContent} disabled={saving} className="px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 disabled:opacity-50">
                      {saving ? 'Seeding...' : '🌱 Seed Default Content'}
                    </button>
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {contentSections.map((section) => {
                      const data = content[section];
                      return (
                        <div key={section} className="bg-white rounded-2xl border hover:shadow-lg transition-shadow">
                          <div className="p-5">
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="font-bold text-gray-900 capitalize">{section}</h3>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${data ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'}`}>{data ? 'Active' : 'Empty'}</span>
                            </div>
                            {data && (
                              <div className="space-y-1 mb-3">
                                <p className="text-sm text-gray-600 line-clamp-2">{data.title}</p>
                                {data.subtitle && <p className="text-xs text-gray-400 line-clamp-1">{data.subtitle}</p>}
                                {data.items && data.items.length > 0 && <p className="text-xs text-gray-400">{data.items.length} items</p>}
                              </div>
                            )}
                            <button onClick={() => startEdit(section)} className="w-full py-2 bg-primary-50 text-primary-700 rounded-xl text-sm font-semibold hover:bg-primary-100 transition-colors">
                              {data ? '✏️ Edit Section' : '➕ Create Section'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {editingSection && editForm && (
                    <div className="fixed inset-0 z-50 overflow-y-auto">
                      <div className="flex items-start justify-center min-h-screen p-4 pt-20">
                        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => { setEditingSection(null); setEditForm(null); }}></div>
                        <div className="relative bg-white rounded-2xl max-w-2xl w-full shadow-2xl z-10 max-h-[80vh] overflow-y-auto">
                          <div className="sticky top-0 bg-white px-6 py-4 border-b flex items-center justify-between z-10">
                            <div><h2 className="text-lg font-bold">Edit "{editingSection}" Section</h2><p className="text-xs text-gray-400">Changes reflect immediately</p></div>
                            <button onClick={() => { setEditingSection(null); setEditForm(null); }} className="p-2 hover:bg-gray-100 rounded-xl">✕</button>
                          </div>
                          <div className="p-6 space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                              <input type="text" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                              <textarea value={editForm.subtitle || ''} onChange={(e) => setEditForm({ ...editForm, subtitle: e.target.value })} rows={2} className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                              <textarea value={editForm.description || ''} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} rows={3} className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
                            </div>
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium text-gray-700">Items / Cards</label>
                                <button onClick={addItem} className="text-xs px-3 py-1 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 font-medium">+ Add Item</button>
                              </div>
                              <div className="space-y-3">
                                {(editForm.items || []).map((item, idx) => (
                                  <div key={idx} className="bg-gray-50 rounded-xl p-3 space-y-2 relative">
                                    <button onClick={() => removeItem(idx)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-xs">✕</button>
                                    <div className="grid grid-cols-2 gap-2">
                                      <input type="text" value={item.icon || ''} onChange={(e) => updateItem(idx, 'icon', e.target.value)} placeholder="Icon (emoji)" className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                                      <input type="text" value={item.title} onChange={(e) => updateItem(idx, 'title', e.target.value)} placeholder="Title" className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                                    </div>
                                    <textarea value={item.description || ''} onChange={(e) => updateItem(idx, 'description', e.target.value)} placeholder="Description" rows={2} className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
                                    <input type="text" value={item.link || ''} onChange={(e) => updateItem(idx, 'link', e.target.value)} placeholder="Link URL (optional)" className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="sticky bottom-0 bg-white px-6 py-4 border-t flex justify-end space-x-3">
                            <button onClick={() => { setEditingSection(null); setEditForm(null); }} className="px-5 py-2.5 border rounded-xl text-sm font-medium hover:bg-gray-50">Cancel</button>
                            <button onClick={handleSaveContent} disabled={saving} className="px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 disabled:opacity-50">{saving ? 'Saving...' : '💾 Save Changes'}</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* DOCTORS */}
              {activeTab === 'doctors' && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {doctors.map((doc: any) => (
                    <div key={doc._id} className="bg-white rounded-2xl border p-5">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-lg">{doc.user?.name?.charAt(0) || 'D'}</div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">{doc.user?.name || 'Unknown'}</p>
                          <p className="text-xs text-gray-400">{doc.specialization}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${doc.isAvailable !== false ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{doc.isAvailable !== false ? 'Active' : 'Inactive'}</span>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between"><span className="text-gray-400">Experience</span><span className="font-medium">{doc.experience} yrs</span></div>
                        <div className="flex justify-between"><span className="text-gray-400">Fee</span><span className="font-bold text-primary-600">৳{doc.consultationFee}</span></div>
                        <div className="flex justify-between"><span className="text-gray-400">Rating</span><span>⭐ {doc.rating?.toFixed(1) || '0.0'}</span></div>
                      </div>
                    </div>
                  ))}
                  {doctors.length === 0 && <div className="col-span-full text-center py-12 text-gray-400">No doctors found</div>}
                </div>
              )}

              {/* USERS */}
              {activeTab === 'users' && (
                <div className="bg-white rounded-2xl border overflow-hidden overflow-x-auto">
                  <table className="w-full">
                    <thead><tr className="bg-gray-50 border-b">
                      <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase">User</th>
                      <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase">Role</th>
                      <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase">Status</th>
                      <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase">Joined</th>
                      <th className="text-right px-6 py-3 text-xs font-bold text-gray-500 uppercase">Actions</th>
                    </tr></thead>
                    <tbody className="divide-y">
                      {users.map(u => (
                        <tr key={u._id} className="hover:bg-gray-50/50">
                          <td className="px-6 py-4"><div className="flex items-center space-x-3"><div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold text-xs">{u.name?.charAt(0)}</div><div><p className="text-sm font-semibold">{u.name}</p><p className="text-xs text-gray-400">{u.email}</p></div></div></td>
                          <td className="px-6 py-4"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRoleColor(u.role)}`}>{u.role}</span></td>
                          <td className="px-6 py-4"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.isActive !== false ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{u.isActive !== false ? 'Active' : 'Inactive'}</span></td>
                          <td className="px-6 py-4 text-sm text-gray-500">{formatDate(u.createdAt)}</td>
                          <td className="px-6 py-4 text-right"><button onClick={() => handleDeleteUser(u._id)} className="text-xs text-red-500 hover:text-red-700">Delete</button></td>
                        </tr>
                      ))}
                      {users.length === 0 && <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400">No users found</td></tr>}
                    </tbody>
                  </table>
                </div>
              )}

              {/* APPOINTMENTS */}
              {activeTab === 'appointments' && (
                <div className="bg-white rounded-2xl border overflow-hidden overflow-x-auto">
                  <table className="w-full">
                    <thead><tr className="bg-gray-50 border-b">
                      <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase">Serial #</th>
                      <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase">Patient</th>
                      <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase">Doctor</th>
                      <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase">Date</th>
                      <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase">Status</th>
                      <th className="text-right px-6 py-3 text-xs font-bold text-gray-500 uppercase">Actions</th>
                    </tr></thead>
                    <tbody className="divide-y">
                      {appointments.map((apt: any) => (
                        <tr key={apt._id} className="hover:bg-gray-50/50">
                          <td className="px-6 py-4"><span className="font-mono text-sm font-bold text-primary-600">{apt.serialNumber || apt._id?.slice(-6)}</span></td>
                          <td className="px-6 py-4 text-sm">{apt.patientId?.name || 'N/A'}</td>
                          <td className="px-6 py-4 text-sm">{apt.doctorId?.name || 'N/A'}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">{apt.appointmentDate ? formatDate(apt.appointmentDate) : formatDate(apt.createdAt)}</td>
                          <td className="px-6 py-4"><span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(apt.status)}`}>{apt.status}</span></td>
                          <td className="px-6 py-4 text-right">
                            <select value={apt.status} onChange={(e) => handleAppointmentStatus(apt._id, e.target.value)} className="text-xs border rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500">
                              <option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="in-progress">In Progress</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                      {appointments.length === 0 && <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400">No appointments found</td></tr>}
                    </tbody>
                  </table>
                </div>
              )}

              {/* ORDERS */}
              {activeTab === 'orders' && (
                <div className="bg-white rounded-2xl border overflow-hidden overflow-x-auto">
                  <table className="w-full">
                    <thead><tr className="bg-gray-50 border-b">
                      <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase">Order ID</th>
                      <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase">Customer</th>
                      <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase">Items</th>
                      <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase">Total</th>
                      <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase">Status</th>
                      <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase">Date</th>
                    </tr></thead>
                    <tbody className="divide-y">
                      {orders.map((o: any) => (
                        <tr key={o._id} className="hover:bg-gray-50/50">
                          <td className="px-6 py-4"><span className="font-mono text-sm font-bold">#{o._id?.slice(-8)}</span></td>
                          <td className="px-6 py-4 text-sm">{o.userId?.name || 'N/A'}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">{o.items?.length || 0} items</td>
                          <td className="px-6 py-4 text-sm font-bold">৳{o.totalAmount || '0'}</td>
                          <td className="px-6 py-4"><span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(o.status)}`}>{o.status}</span></td>
                          <td className="px-6 py-4 text-sm text-gray-500">{formatDate(o.createdAt)}</td>
                        </tr>
                      ))}
                      {orders.length === 0 && <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400">No orders found</td></tr>}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}