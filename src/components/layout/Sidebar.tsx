import React from 'react';
import { NavLink, Link } from 'react-router-dom';
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
} from 'lucide-react';
import { UserRole } from '../../types';

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
  // Navigation structure adhering strictly to architecture requirements
  const studentNav: NavItem[] = [
    { label: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { label: 'Discover Resources', path: '/student/resources', icon: Search },
    { label: 'My Bookings', path: '/student/bookings', icon: CalendarCheck, badge: 2 },
    { label: 'Fair Allocation', path: '/student/allocation', icon: Scale },
    { label: 'QR Access', path: '/student/qr-access', icon: QrCode },
    { label: 'Condition Reports', path: '/student/condition-reports', icon: ClipboardCheck },
    { label: 'History', path: '/student/history', icon: History },
  ];

  const ownerNav: NavItem[] = [
    { label: 'Dashboard', path: '/owner/dashboard', icon: LayoutDashboard },
    { label: 'My Resources', path: '/owner/resources', icon: Layers },
    { label: 'Booking Requests', path: '/owner/requests', icon: Inbox, badge: 1 },
    { label: 'Active Bookings', path: '/owner/active-bookings', icon: Clock },
    { label: 'Returns', path: '/owner/returns', icon: RotateCcw },
    { label: 'Incidents', path: '/owner/incidents', icon: AlertTriangle },
    { label: 'Analytics', path: '/owner/analytics', icon: BarChart3 },
  ];

  const adminNav: NavItem[] = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'User Management', path: '/admin/users', icon: Users },
    { label: 'Verification', path: '/admin/verification', icon: CheckCircle, badge: 3 },
    { label: 'Resource Monitoring', path: '/admin/resources', icon: Activity },
    { label: 'Booking Monitoring', path: '/admin/bookings', icon: CalendarCheck },
    { label: 'Incidents', path: '/admin/incidents', icon: AlertTriangle },
    { label: 'Audit Logs', path: '/admin/audit-logs', icon: FileText },
    { label: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
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
    <div className="flex h-full flex-col justify-between">
      {/* Brand & Section Header */}
      <div>
        <div className="flex h-16 items-center justify-between px-5 border-b border-slate-200">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white shadow-sm group-hover:bg-slate-800 transition-colors">
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
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`w-4 h-4 transition-colors ${
                          isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-700'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span
                        className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isActive
                            ? 'bg-slate-700 text-white'
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

      {/* Trust & Accountability Footer Assurance */}
      <div className="p-4 m-3 rounded-xl bg-slate-50 border border-slate-200/80">
        <div className="flex items-center gap-2 text-slate-800 text-xs font-semibold mb-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Fair Share Protocol</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Peer accountability & verified credentials guarantee equal campus access.
        </p>
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

