'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useLetter } from '../context/LetterContext';
import { User, LogOut, ShieldAlert, KeyRound, Menu, X } from 'lucide-react';
import { loginUser } from '@/lib/actions';

export default function Navbar() {
  const { user, login, logout } = useLetter();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const [emailInput, setEmailInput] = useState('user@phoenix.in');
  const [passwordInput, setPasswordInput] = useState('user');
  const [loginError, setLoginError] = useState('');

  const pathname = usePathname();
  const router = useRouter();

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await loginUser(emailInput, passwordInput);
    if (res.success && res.user) {
      login(res.user);
      setShowLoginModal(false);
      setLoginError('');
      if (res.user.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } else {
      setLoginError(res.error || 'Invalid credentials. Use admin@phoenix.in (pwd: admin) or user@phoenix.in (pwd: user)');
    }
  };

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Send Letter', href: '/send-letter' },
    { name: 'Track Letter', href: '/track' },
    { name: 'FAQ', href: '/#faq' },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full glass-parchment border-b border-parchment-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-terracotta-600 to-phoenix-gold p-0.5 shadow-md flex items-center justify-center transform group-hover:scale-105 transition-transform">
                  <svg viewBox="0 0 24 24" className="w-8 h-8 text-parchment-50 fill-current" xmlns="http://www.w3.org/2000/svg">
                    {/* Stylized Phoenix bird carrying letter */}
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.5c0 .28-.22.5-.5.5h-1c-.28 0-.5-.22-.5-.5v-4c0-.28.22-.5.5-.5h1c.28 0 .5.22.5.5v4zm0-6c0 .28-.22.5-.5.5h-1c-.28 0-.5-.22-.5-.5v-1c0-.28.22-.5.5-.5h1c.28 0 .5.22.5.5v1zM12 4c.55 0 1 .45 1 1v2c0 .55-.45 1-1 1s-1-.45-1-1V5c0-.55.45-1 1-1z" opacity="0.1" />
                    <path d="M19 13v-2c0-.55-.45-1-1-1h-2v2c0 .55-.45 1-1 1h-2l-1 2.5L11 13H9c-.55 0-1-.45-1-1V8c0-.55.45-1 1-1h3c.55 0 1 .45 1 1v1h2V8c0-1.66-1.34-3-3-3H9c-1.66 0-3 1.34-3 3v4c0 1.66 1.34 3 3 3h1.22l.78 2c.26.65.89 1 1.56 1 .53 0 1.04-.21 1.41-.6l2.42-2.58C18.1 16.5 19 14.85 19 13z" fill="#fdfcf9" />
                    <polygon points="12,11.5 13,8 14,8 14.5,9.5 16,9.5 15,11.5" fill="#cca662" />
                  </svg>
                </div>
                <div>
                  <span className="font-serif text-2xl font-bold tracking-wide text-phoenix-indigo group-hover:text-terracotta-500 transition-colors">PHOENIX</span>
                  <p className="text-[10px] uppercase font-sans tracking-widest text-phoenix-gold-dark -mt-1 font-semibold">Indian Pigeon Service</p>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`font-sans font-medium text-sm transition-colors relative py-2 ${
                      isActive ? 'text-terracotta-600' : 'text-phoenix-indigo hover:text-terracotta-500'
                    }`}
                  >
                    {link.name}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-terracotta-500 rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Desktop CTAs / Login */}
            <div className="hidden md:flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-3">
                  {user.role === 'ADMIN' ? (
                    <Link
                      href="/admin"
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-phoenix-forest/10 border border-phoenix-forest/20 text-phoenix-forest text-xs font-semibold hover:bg-phoenix-forest/25 transition-colors"
                    >
                      <ShieldAlert size={14} />
                      Admin Control
                    </Link>
                  ) : (
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-phoenix-indigo/5 border border-phoenix-indigo/10 text-phoenix-indigo text-xs font-semibold hover:bg-phoenix-indigo/10 transition-colors"
                    >
                      <User size={14} />
                      Dashboard
                    </Link>
                  )}
                  
                  <button
                    onClick={logout}
                    className="p-2 rounded-lg text-phoenix-indigo hover:text-terracotta-600 hover:bg-terracotta-50 transition-colors"
                    title="Logout"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="px-4 py-2 text-xs font-semibold text-phoenix-indigo hover:text-terracotta-600 transition-colors"
                >
                  Log In
                </button>
              )}

              <Link
                href="/send-letter"
                className="vintage-btn text-xs font-bold px-6 py-2.5 rounded-lg shadow-sm"
              >
                Send a Letter
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-2">
              <Link
                href="/send-letter"
                className="vintage-btn text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-sm"
              >
                Send
              </Link>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-phoenix-indigo focus:outline-none"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-parchment-100 border-t border-parchment-200 px-4 pt-4 pb-6 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="block font-sans font-medium text-base text-phoenix-indigo hover:text-terracotta-600 py-2 border-b border-parchment-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            
            <div className="pt-4 flex flex-col gap-3">
              {user ? (
                <>
                  <Link
                    href={user.role === 'ADMIN' ? '/admin' : '/dashboard'}
                    className="w-full text-center px-4 py-2.5 rounded-lg bg-phoenix-indigo/5 border border-phoenix-indigo/10 text-phoenix-indigo font-medium text-sm"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {user.role === 'ADMIN' ? 'Admin Dashboard' : 'My Dashboard'}
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-center px-4 py-2.5 rounded-lg text-terracotta-600 border border-terracotta-500/20 text-sm font-medium"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setShowLoginModal(true);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-center px-4 py-2.5 rounded-lg text-phoenix-indigo border border-parchment-300 text-sm font-semibold"
                >
                  Log In
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-phoenix-navy/60 backdrop-blur-sm" onClick={() => setShowLoginModal(false)} />
          
          <div className="relative w-full max-w-md parchment-texture rounded-2xl shadow-2xl border border-phoenix-gold overflow-hidden z-10 animate-float">
            <div className="h-2 bg-gradient-to-r from-terracotta-500 via-phoenix-gold to-phoenix-indigo" />
            
            <div className="px-6 py-8">
              <button
                onClick={() => setShowLoginModal(false)}
                className="absolute top-4 right-4 text-parchment-800 hover:text-phoenix-indigo"
              >
                <X size={20} />
              </button>

              <div className="text-center mb-6">
                <span className="font-serif text-2xl font-bold text-phoenix-indigo">Phoenix Portals</span>
                <p className="text-xs text-parchment-800 mt-1">Unlock emotional pigeon dispatches</p>
              </div>

              {loginError && (
                <div className="mb-4 p-3 bg-terracotta-50 border border-terracotta-500/20 text-terracotta-700 text-xs rounded-lg flex items-center gap-2">
                  <ShieldAlert size={16} className="flex-shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-phoenix-indigo uppercase tracking-wider mb-1">Select Role Profile</label>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <button
                      type="button"
                      onClick={() => {
                        setEmailInput('user@phoenix.in');
                        setPasswordInput('user');
                      }}
                      className={`p-3 border rounded-xl flex flex-col items-center gap-1 transition-all ${
                        emailInput === 'user@phoenix.in'
                          ? 'border-terracotta-600 bg-terracotta-50/50 text-terracotta-700 font-semibold'
                          : 'border-parchment-300 text-parchment-800 hover:bg-parchment-200'
                      }`}
                    >
                      <User size={18} />
                      <span className="text-xs">Customer</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEmailInput('admin@phoenix.in');
                        setPasswordInput('admin');
                      }}
                      className={`p-3 border rounded-xl flex flex-col items-center gap-1 transition-all ${
                        emailInput === 'admin@phoenix.in'
                          ? 'border-phoenix-indigo bg-phoenix-indigo/5 text-phoenix-indigo font-semibold'
                          : 'border-parchment-300 text-parchment-800 hover:bg-parchment-200'
                      }`}
                    >
                      <ShieldAlert size={18} />
                      <span className="text-xs">Administrator</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-phoenix-indigo uppercase tracking-wider mb-1">Email Address</label>
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="w-full px-4 py-2 border border-parchment-300 rounded-lg bg-parchment-50 text-phoenix-indigo text-sm focus:outline-none focus:border-phoenix-indigo"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-phoenix-indigo uppercase tracking-wider mb-1">Password</label>
                    <input
                      type="password"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="w-full px-4 py-2 border border-parchment-300 rounded-lg bg-parchment-50 text-phoenix-indigo text-sm focus:outline-none focus:border-phoenix-indigo"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-6 vintage-btn py-3 rounded-lg text-sm font-bold shadow-md flex items-center justify-center gap-2"
                >
                  <KeyRound size={16} />
                  Authorize Access
                </button>
              </form>

              <div className="mt-4 pt-4 border-t border-parchment-300 text-center">
                <p className="text-[10px] text-parchment-800 uppercase tracking-widest font-semibold">Credentials for Local Mock Run</p>
                <div className="mt-1 flex justify-center gap-4 text-xs font-mono text-phoenix-indigo">
                  <div>User: <span className="font-semibold underline">user/user</span></div>
                  <div>Admin: <span className="font-semibold underline">admin/admin</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
