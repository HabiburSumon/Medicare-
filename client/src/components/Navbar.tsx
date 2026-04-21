'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/doctors', label: 'Find Doctors' },
  { href: '/medicines', label: 'Medicines' },
  { href: '/symptom-checker', label: 'Symptom Checker' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    const fetchUnread = async () => {
      try {
        const res = await api.get('/notifications/unread-count');
        setUnreadCount(res.data.unreadCount);
      } catch {}
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <nav className="bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2.5 group">
              <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                <span className="text-white font-bold text-sm">M+</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Medi<span className="text-primary-600">Care</span><span className="text-accent-500">+</span></span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center">
            <div className="flex items-center space-x-1">
              {navLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={
                      'relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ' +
                      (active
                        ? 'text-primary-700 bg-primary-50'
                        : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50')
                    }
                  >
                    {link.label}
                    {active && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-primary-600 rounded-full"></span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Desktop Right Side */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className={
                    'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ' +
                    (isActive('/dashboard') ? 'text-primary-700 bg-primary-50' : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50')
                  }
                >
                  Dashboard
                </Link>
                <Link
                  href="/chat"
                  className={
                    'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ' +
                    (isActive('/chat') ? 'text-primary-700 bg-primary-50' : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50')
                  }
                >
                  Messages
                </Link>
                <Link
                  href="/prescriptions"
                  className={
                    'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ' +
                    (isActive('/prescriptions') ? 'text-primary-700 bg-primary-50' : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50')
                  }
                >
                  Prescriptions
                </Link>
                {user.role === 'admin' && (
                  <Link
                    href="/admin"
                    className={
                      'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ' +
                      (isActive('/admin') ? 'text-primary-700 bg-primary-50' : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50')
                    }
                  >
                    🛡️ Admin
                  </Link>
                )}
                <div className="flex items-center space-x-3 ml-2 pl-3 border-l border-gray-200">
                  <button onClick={() => router.push('/notifications')} className="relative p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">{unreadCount > 99 ? '99+' : unreadCount}</span>
                    )}
                  </button>
                  <Link href="/profile" className="flex items-center space-x-2 hover:bg-gray-50 px-2 py-1 rounded-lg transition-colors">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center shadow-sm overflow-hidden">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white font-medium text-sm">{user.name?.charAt(0)}</span>
                      )}
                    </div>
                    <span className="text-sm font-medium text-gray-700">{user.name}</span>
                  </Link>
                  <button onClick={logout} className="text-sm text-red-500 hover:text-red-600 hover:bg-red-50 px-2 py-1 rounded-md font-medium transition-colors">
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-primary-600 rounded-lg hover:bg-gray-50 transition-all">
                  Login
                </Link>
                <Link href="/register" className="px-5 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 shadow-sm hover:shadow-md transition-all">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button className="md:hidden flex items-center p-2 rounded-lg hover:bg-gray-50" onClick={() => setMobileOpen(!mobileOpen)}>
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 pt-2 space-y-1 border-t border-gray-100 mt-2">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={
                    'block px-4 py-2.5 rounded-lg font-medium transition-colors ' +
                    (active ? 'text-primary-700 bg-primary-50' : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50')
                  }
                >
                  {link.label}
                </Link>
              );
            })}
            <hr className="my-2" />
            {user ? (
              <>
                <Link href="/dashboard" onClick={() => setMobileOpen(false)} className={'block px-4 py-2.5 rounded-lg font-medium ' + (isActive('/dashboard') ? 'text-primary-700 bg-primary-50' : 'text-gray-600')}>Dashboard</Link>
                <Link href="/chat" onClick={() => setMobileOpen(false)} className={'block px-4 py-2.5 rounded-lg font-medium ' + (isActive('/chat') ? 'text-primary-700 bg-primary-50' : 'text-gray-600')}>Messages</Link>
                <Link href="/prescriptions" onClick={() => setMobileOpen(false)} className={'block px-4 py-2.5 rounded-lg font-medium ' + (isActive('/prescriptions') ? 'text-primary-700 bg-primary-50' : 'text-gray-600')}>📋 Prescriptions</Link>
                <Link href="/notifications" onClick={() => setMobileOpen(false)} className={'block px-4 py-2.5 rounded-lg font-medium ' + (isActive('/notifications') ? 'text-primary-700 bg-primary-50' : 'text-gray-600')}>
                  🔔 Notifications {unreadCount > 0 && <span className="ml-1 bg-red-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5">{unreadCount}</span>}
                </Link>
                {user.role === 'admin' && (
                  <Link href="/admin" onClick={() => setMobileOpen(false)} className={'block px-4 py-2.5 rounded-lg font-medium ' + (isActive('/admin') ? 'text-primary-700 bg-primary-50' : 'text-gray-600')}>🛡️ Admin Panel</Link>
                )}
                <Link href="/profile" onClick={() => setMobileOpen(false)} className={'block px-4 py-2.5 rounded-lg font-medium ' + (isActive('/profile') ? 'text-primary-700 bg-primary-50' : 'text-gray-600')}>👤 My Profile</Link>
                <button onClick={() => { logout(); setMobileOpen(false); }} className="block w-full text-left px-4 py-2.5 text-red-600 font-medium rounded-lg hover:bg-red-50">Logout ({user.name})</button>
              </>
            ) : (
              <div className="space-y-2 px-4 pt-2">
                <Link href="/login" onClick={() => setMobileOpen(false)} className="block btn-secondary text-center text-sm py-2.5">Login</Link>
                <Link href="/register" onClick={() => setMobileOpen(false)} className="block btn-primary text-center text-sm py-2.5">Sign Up</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}