import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Shield, Sparkles, Search, HelpCircle, X } from 'lucide-react';
import { NotificationDrawer } from './NotificationDrawer';
import { UserProfileMenu } from './UserProfileMenu';
import { useAuth } from '../../hooks/useAuth';

export interface NavbarProps {
  onToggleMobileSidebar: () => void;
  title?: string;
  roleBadgeText?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleMobileSidebar,
  title,
  roleBadgeText,
}) => {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      if (role === 'student') {
        navigate(`/student/resources?search=${encodeURIComponent(searchQuery)}`);
      } else if (role === 'owner') {
        navigate(`/owner/resources?search=${encodeURIComponent(searchQuery)}`);
      } else {
        navigate(`/admin/resources?search=${encodeURIComponent(searchQuery)}`);
      }
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/90 bg-white/95 px-4 sm:px-6 backdrop-blur-sm shadow-xs">
        {/* Left: Mobile hamburger & breadcrumb/title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleMobileSidebar}
            className="p-2 text-slate-600 hover:text-slate-900 rounded-lg border border-slate-200 lg:hidden hover:bg-slate-50 transition-colors"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            {title && (
              <h1 className="text-base font-semibold text-slate-900 tracking-tight hidden sm:block">
                {title}
              </h1>
            )}
            {roleBadgeText && (
              <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 uppercase tracking-wider">
                {roleBadgeText}
              </span>
            )}
          </div>
        </div>

        {/* Center: Global Search Entry Point */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center max-w-xs w-full mx-4">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search resources, labs, spaces..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
            />
          </div>
        </form>

        {/* Right items: Trust Score, Help, Notifications, User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {user && (
            <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-lg border border-emerald-200 bg-emerald-50/70 text-emerald-900">
              <Shield className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <div className="text-left text-xs">
                <span className="font-bold">{user.trustScore}</span>
                <span className="text-emerald-700 font-normal text-[11px]"> / 100 Trust</span>
              </div>
              <Sparkles className="w-3 h-3 text-emerald-500 ml-0.5" />
            </div>
          )}

          {/* Help & Support Button */}
          <button
            type="button"
            onClick={() => setShowHelpModal(true)}
            title="Help & Support"
            className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <NotificationDrawer />

          <div className="h-5 w-px bg-slate-200 hidden sm:block" />

          <UserProfileMenu />
        </div>
      </header>

      {/* Help & Documentation Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">TrustPool Help & Guidance</h3>
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <h4 className="font-bold text-slate-900 mb-1">How Resource Allocation Works</h4>
                <p>TrustPool balances academic need, queue priority, and borrower trust scores to ensure fair shared equipment access without hoarding.</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <h4 className="font-bold text-slate-900 mb-1">Check-In & Check-Out via QR</h4>
                <p>Once approved, generate your secure QR pass in the QR Access tab and present it at the resource custody station.</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <h4 className="font-bold text-slate-900 mb-1">Custodian Contact</h4>
                <p>For urgent hardware issues or room access emergencies, contact your department equipment manager or campus facilities at support@trustpool.edu.</p>
              </div>
            </div>

            <button
              onClick={() => setShowHelpModal(false)}
              className="w-full py-2 bg-[#14213D] text-white text-xs font-semibold rounded-lg hover:bg-[#1d2f56]"
            >
              Got it, close
            </button>
          </div>
        </div>
      )}
    </>
  );
};
