import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Calendar, Ticket, LayoutDashboard, Shield, LogOut, LogIn, Menu, X } from 'lucide-react';

export const Navbar = ({ currentTab, setCurrentTab, onOpenAuth }) => {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { id: 'events', label: 'Kalender & Event', icon: Calendar, public: true },
    { id: 'tickets', label: 'Tiket Saya', icon: Ticket, roles: ['user', 'organizer', 'admin'] },
    { id: 'organizer', label: 'Dashboard UKM', icon: LayoutDashboard, roles: ['organizer', 'admin'] },
    { id: 'admin', label: 'Admin Sistem', icon: Shield, roles: ['admin'] },
  ];

  const visible = navItems.filter(item => {
    if (item.public) return true;
    return user && item.roles.includes(user.role);
  });

  const roleBadgeColor = {
    admin: 'bg-red-100 text-red-800',
    organizer: 'bg-violet-100 text-violet-800',
    user: 'bg-sky-100 text-sky-800',
  };

  return (
    <>
      {/* Amber identity bar: functional brand anchor, distinguishes this app from generic navbars */}
      <div className="h-1 bg-warm-600" aria-hidden="true" />

      <header className="bg-slate-900 text-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <button
              onClick={() => setCurrentTab('events')}
              className="flex items-center gap-2.5 text-left group"
              aria-label="Halaman utama kegiatan kampus"
            >
              <span className="text-lg font-bold tracking-tight text-white group-hover:text-warm-500 transition-colors">
                Kalender
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-warm-500 mx-1 mb-0.5" aria-hidden="true" />
                Kampus
              </span>
              <span className="hidden sm:block text-xs text-slate-400 border-l border-slate-700 pl-2.5 ml-0.5">
                Portal Kegiatan Mahasiswa
              </span>
            </button>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1" aria-label="Menu utama">
              {visible.map(item => {
                const Icon = item.icon;
                const active = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentTab(item.id)}
                    className={`relative flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors rounded ${
                      active ? 'text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Icon size={16} aria-hidden="true" />
                    <span>{item.label}</span>
                    {/* Amber underline: active indicator. Purpose: wayfinding without background color swap */}
                    {active && (
                      <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-warm-500 rounded-full" />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Auth area desktop */}
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-white leading-none">{user.name}</p>
                    <span className={`inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${roleBadgeColor[user.role] || 'bg-slate-200 text-slate-700'}`}>
                      {user.role === 'admin' ? 'Administrator' : user.role === 'organizer' ? 'Penyelenggara' : 'Mahasiswa'}
                    </span>
                  </div>
                  <button
                    onClick={logout}
                    className="p-2 text-slate-400 hover:text-red-400 transition-colors rounded"
                    aria-label="Keluar dari akun"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={onOpenAuth}
                  className="flex items-center gap-2 bg-warm-600 hover:bg-warm-500 text-white font-semibold px-4 py-2 rounded text-sm transition-colors"
                >
                  <LogIn size={16} aria-hidden="true" />
                  Masuk
                </button>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 text-slate-300 hover:text-white rounded min-w-[44px] min-h-[44px] flex items-center justify-center"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Tutup menu' : 'Buka menu'}
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile fullscreen overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-slate-900 flex flex-col">
          <div className="flex items-center justify-between px-4 h-16 border-b border-slate-800">
            <span className="text-lg font-bold text-white">Menu</span>
            <button
              onClick={() => setMobileOpen(false)}
              className="p-2 text-slate-300 hover:text-white min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Tutup menu"
            >
              <X size={24} />
            </button>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2" aria-label="Menu utama">
            {visible.map(item => {
              const Icon = item.icon;
              const active = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { setCurrentTab(item.id); setMobileOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-base font-medium min-h-[48px] transition-colors ${
                    active ? 'bg-slate-800 text-warm-500' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon size={20} aria-hidden="true" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="px-4 py-6 border-t border-slate-800">
            {user ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white">{user.name}</p>
                  <p className="text-xs text-slate-400 capitalize">{user.role}</p>
                </div>
                <button
                  onClick={() => { logout(); setMobileOpen(false); }}
                  className="px-4 py-2 text-sm font-semibold text-red-400 border border-red-800 rounded hover:bg-red-950 min-h-[44px]"
                >
                  Keluar
                </button>
              </div>
            ) : (
              <button
                onClick={() => { onOpenAuth(); setMobileOpen(false); }}
                className="w-full py-3 bg-warm-600 text-white font-semibold rounded-lg text-base min-h-[48px]"
              >
                Masuk ke Akun
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};
