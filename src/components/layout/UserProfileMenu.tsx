import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import {
  User,
  LogOut,
  Shield,
  Layers,
  GraduationCap,
  ChevronDown,
  Check,
} from 'lucide-react';
import { UserRole } from '../../types';
import { mocksEnabled } from '../../services/config';

export const UserProfileMenu: React.FC = () => {
  const { user, role, switchRole, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRoleChange = (newRole: UserRole) => {
    switchRole(newRole);
    setIsOpen(false);
    if (newRole === 'student') navigate('/student/dashboard');
    if (newRole === 'owner') navigate('/owner/dashboard');
    if (newRole === 'admin') navigate('/admin/dashboard');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user) {
    return (
      <button
        onClick={() => navigate('/login')}
        className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800"
      >
        Sign In
      </button>
    );
  }

  const roleLabels: Record<UserRole, { label: string; icon: React.ReactNode }> = {
    student: {
      label: 'Student / Borrower',
      icon: <GraduationCap className="w-3.5 h-3.5 text-blue-600" />,
    },
    owner: {
      label: 'Resource Owner',
      icon: <Layers className="w-3.5 h-3.5 text-emerald-600" />,
    },
    admin: {
      label: 'System Admin',
      icon: <Shield className="w-3.5 h-3.5 text-purple-600" />,
    },
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
      >
        <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-semibold">
          {user.name.charAt(0)}
        </div>
        <div className="hidden sm:block text-left">
          <div className="text-xs font-semibold text-slate-900 leading-tight">
            {user.name}
          </div>
          <div className="text-[10px] text-slate-500 capitalize">
            {roleLabels[role]?.label || role}
          </div>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-200 bg-white shadow-xl py-2 z-50 text-slate-800 animate-in fade-in-50">
          {/* User Details */}
          <div className="px-4 py-2.5 border-b border-slate-100">
            <p className="text-xs font-semibold text-slate-900">{user.name}</p>
            <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
            {user.department && (
              <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                {user.department}
              </p>
            )}
            <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[10px] font-medium text-slate-700">
              <Shield className="w-3 h-3 text-emerald-600" />
              <span>Trust Score: <strong>{user.trustScore}/100</strong></span>
            </div>
          </div>

          {/* Available only in the explicitly enabled local demo mode. */}
          {mocksEnabled && <div className="px-3 py-2 border-b border-slate-100">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1 mb-1">
              Switch Perspective
            </p>
            {(['student', 'owner', 'admin'] as UserRole[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => handleRoleChange(r)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  role === r
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  {roleLabels[r].icon}
                  <span>{roleLabels[r].label}</span>
                </div>
                {role === r && <Check className="w-3.5 h-3.5 text-slate-900" />}
              </button>
            ))}
          </div>}

          {/* Actions */}
          <div className="p-1">
            <button
              onClick={() => {
                setIsOpen(false);
                navigate(`/${role}/profile`);
              }}
              className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-xs text-slate-600 hover:bg-slate-50"
            >
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>User Profile & Settings</span>
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-xs text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-500" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

