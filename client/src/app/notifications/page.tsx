'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface Notification {
  _id: string;
  recipient: string;
  sender?: { name: string; email: string; role: string };
  type: string;
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export default function NotificationsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (user) fetchNotifications();
  }, [user, authLoading, page]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get(`/notifications?page=${page}&limit=15`);
      setNotifications(res.data.data);
      setUnreadCount(res.data.unreadCount);
      setTotalPages(res.data.pagination.pages);
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  const markAsRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) { console.error(error); }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/mark-all/read');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) { console.error(error); }
  };

  const deleteNotification = async (id: string) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (error) { console.error(error); }
  };

  const handleClick = (notification: Notification) => {
    if (!notification.isRead) markAsRead(notification._id);
    if (notification.link) router.push(notification.link);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'appointment_booked': return '📅';
      case 'appointment_confirmed': return '✅';
      case 'appointment_cancelled': return '❌';
      case 'prescription_sent': return '💊';
      case 'test_result_uploaded': return '📄';
      case 'new_message': return '💬';
      default: return '🔔';
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'appointment_booked': return 'border-l-blue-500';
      case 'appointment_confirmed': return 'border-l-green-500';
      case 'appointment_cancelled': return 'border-l-red-500';
      case 'prescription_sent': return 'border-l-purple-500';
      case 'test_result_uploaded': return 'border-l-amber-500';
      case 'new_message': return 'border-l-cyan-500';
      default: return 'border-l-gray-500';
    }
  };

  const formatTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(diff / 3600000);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(diff / 86400000);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
  };

  if (authLoading || loading) return (<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div></div>);
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-500 mt-1">{unreadCount > 0 ? `You have ${unreadCount} unread` : 'All caught up!'}</p>
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllAsRead} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">Mark all read</button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">🔔</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No notifications yet</h3>
            <p className="text-gray-500">We will notify you about appointments, prescriptions, and more.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <div key={n._id} onClick={() => handleClick(n)}
                className={`bg-white rounded-xl shadow-sm border-l-4 ${getColor(n.type)} ${!n.isRead ? 'bg-blue-50/50' : ''} ${n.link ? 'cursor-pointer hover:shadow-md' : ''} transition-all p-4`}>
                <div className="flex items-start gap-4">
                  <div className="text-2xl flex-shrink-0 mt-1">{getIcon(n.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className={`font-semibold ${!n.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                          {n.title}
                          {!n.isRead && <span className="ml-2 inline-block w-2 h-2 bg-blue-600 rounded-full"></span>}
                        </h3>
                        <p className="text-gray-600 mt-0.5 text-sm">{n.message}</p>
                        {n.sender && <p className="text-xs text-gray-400 mt-1">From: {n.sender.name}</p>}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs text-gray-400">{formatTime(n.createdAt)}</span>
                        <button onClick={(e) => { e.stopPropagation(); deleteNotification(n._id); }}
                          className="text-gray-300 hover:text-red-500 transition p-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 bg-white rounded-lg border disabled:opacity-50 hover:bg-gray-50">Prev</button>
            <span className="px-4 py-2 text-gray-600">{page} / {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-4 py-2 bg-white rounded-lg border disabled:opacity-50 hover:bg-gray-50">Next</button>
          </div>
        )}
      </div>
    </div>
  );
}