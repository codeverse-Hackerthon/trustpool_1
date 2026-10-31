import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  X,
  LayoutDashboard,
  Search,
  CalendarCheck,
  Scale,
  QrCode,
  ClipboardCheck,
  History,
  Layers,
  Inbox,
  Clock,
  RotateCcw,
  AlertTriangle,
  BarChart3,
  Users,
  CheckCircle,
  Activity,
  FileText,
  PlusCircle,
  Calendar,
  Settings,
  Bell,
  User,
  LogOut,
} from 'lucide-react';
import { UserRole } from '../../types';
import { useAuth } from '../../hooks/useAuth';

export interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
}

export interface SidebarProps {
  role: UserRole;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  role,
  isMobileOpen,
  onCloseMobile,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const studentNav: NavItem[] = [
    { label: 'Overview', path: '/student/dashboard', icon: LayoutDashboard },
    { label: 'Explore Resources', path: '/student/resources', icon: Search },
    { label: 'My Bookings', path: '/student/bookings', icon: CalendarCheck },
    { label: 'Fair Allocation', path: '/student/allocation', icon: Scale },
    { label: 'QR Access', path: '/student/qr-access', icon: QrCode },
    { label: 'Condition Reports', path: '/student/condition-reports', icon: ClipboardCheck },
    { label: 'Incident Reports', path: '/student/incidents', icon: AlertTriangle },
    { label: 'History', path: '/student/history', icon: History },
    { label: 'Notifications', path: '/student/notifications', icon: Bell },
    { label: 'My Profile', path: '/student/profile', icon: User },
  ];

  const ownerNav: NavItem[] = [
    { label: 'Overview', path: '/owner/dashboard', icon: LayoutDashboard },
    { label: 'My Resources', path: '/owner/resources', icon: Layers },
    { label: 'Add Resource', path: '/owner/resources/add', icon: PlusCircle },
    { label: 'Booking Requests', path: '/owner/requests', icon: Inbox },
    { label: 'Active Bookings', path: '/owner/active-bookings', icon: Clock },
    { label: 'Availability', path: '/owner/availability', icon: Calendar },
    { label: 'Return Management', path: '/owner/returns', icon: RotateCcw },
    { label: 'Incidents', path: '/owner/incidents', icon: AlertTriangle },
    { label: 'Analytics', path: '/owner/analytics', icon: BarChart3 },
    { label: 'Notifications', path: '/owner/notifications', icon: Bell },
    { label: 'Profile', path: '/owner/profile', icon: User },
  ];

  const adminNav: NavItem[] = [
    { label: 'Overview', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Users', path: '/admin/users', icon: Users },
    { label: 'Institutions', path: '/admin/verification', icon: CheckCircle },
    { label: 'Resources', path: '/admin/resources', icon: Activity },
    { label: 'Bookings', path: '/admin/bookings', icon: CalendarCheck },
    { label: 'Incidents', path: '/admin/incidents', icon: AlertTriangle },
    { label: 'Disputes', path: '/admin/disputes', icon: Scale },
    { label: 'Audit Logs', path: '/admin/audit-logs', icon: FileText },
    { label: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
    { label: 'Settings', path: '/admin/settings', icon: Settings },
    { label: 'Notifications', path: '/admin/notifications', icon: Bell },
    { label: 'Profile', path: '/admin/profile', icon: User },
  ];

  const navMap: Record<UserRole, NavItem[]> = {
    student: studentNav,
    owner: ownerNav,
    admin: adminNav,
  };

  const currentNav = navMap[role] || studentNav;

  const roleMeta = {
    student: { title: 'Borrower Portal', sub: 'Student Access' },
    owner: { title: 'Owner Console', sub: 'Resource Custodian' },
    admin: { title: 'Admin Command', sub: 'Campus Trust Ops' },
  };

  const navContent = (
    <div className="flex h-full flex-col justify-between overflow-y-auto">
      {/* Brand & Section Header */}
      <div>
        <div className="flex h-16 items-center justify-between px-5 border-b border-slate-200">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#14213D] text-white shadow-xs group-hover:bg-[#1d2f56] transition-colors">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-slate-900">
                TrustPool
              </span>
              <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                {roleMeta[role].sub}
              </span>
            </div>
          </Link>
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Navigation
          </div>
          {currentNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`w-4 h-4 transition-colors ${
                          isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-700'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span
                        className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isActive
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* User Profile Section & Logout Action at Bottom */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/60 mt-4 space-y-2">
        <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#14213D] text-white flex items-center justify-center text-xs font-bold shrink-0">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">{user?.name || 'User'}</p>
              <p className="text-[10px] text-slate-500 capitalize truncate">{role} Member</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign Out"
            className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-1.5 px-2 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Verified Institutional Node</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:border-r lg:border-slate-200 lg:bg-white z-40">
        {navContent}
      </aside>

      {/* Mobile Sliding Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Mobile Sliding Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl transition-transform duration-200 ease-in-out lg:hidden ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {navContent}
      </aside>
    </>
  );
};
