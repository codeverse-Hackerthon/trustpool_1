import React from 'react';
import { Menu, Shield, Sparkles } from 'lucide-react';
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
  const { user } = useAuth();

  return (
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

      {/* Right items: Trust Score, Notifications, User Profile */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        {user && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-lg border border-emerald-200 bg-emerald-50/70 text-emerald-900">
            <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
            <div className="text-left text-xs">
              <span className="font-semibold">{user.trustScore}</span>
              <span className="text-emerald-700 font-normal"> / 100 Trust</span>
            </div>
            <Sparkles className="w-3 h-3 text-emerald-500 ml-0.5" />
          </div>
        )}

        <NotificationDrawer />

        <div className="h-6 w-px bg-slate-200 hidden sm:block" />

        <UserProfileMenu />
      </div>
    </header>
  );
};

