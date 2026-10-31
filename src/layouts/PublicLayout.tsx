import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Menu, X, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';

export const PublicLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { switchRole } = useAuth();

  const isAuthPage =
    location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-slate-900 selection:text-white">
      {/* Public SaaS Navigation Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white shadow-xs">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-slate-900">
                TrustPool
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Fair Resource Allocation
              </span>
            </div>
          </Link>

          {/* Desktop Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link to="/" className="hover:text-slate-900 transition-colors">
              Platform
            </Link>
            <Link
              to="/student/resources"
              className="hover:text-slate-900 transition-colors"
            >
              Discover Resources
            </Link>
            <Link
              to="/student/allocation"
              className="hover:text-slate-900 transition-colors"
            >
              Fair Share System
            </Link>
          </nav>

          {/* Action Buttons & Fast Role Portals */}
          <div className="hidden sm:flex items-center gap-3">
            {!isAuthPage ? (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button
                    variant="primary"
                    size="sm"
                    rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  >
                    Get Started
                  </Button>
                </Link>
              </>
            ) : (
              <Link to="/">
                <Button variant="outline" size="sm">
                  Back to Home
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-200 bg-white px-4 py-4 space-y-3">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-slate-700 py-1"
            >
              Platform Overview
            </Link>
            <Link
              to="/student/resources"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-slate-700 py-1"
            >
              Discover Resources
            </Link>
            <Link
              to="/student/allocation"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-slate-700 py-1"
            >
              Fair Share System
            </Link>
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" size="sm" className="w-full">
                  Sign In
                </Button>
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="primary" size="sm" className="w-full">
                  Create Account
                </Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Outlet */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Trust & Accountability Footer */}
      <footer className="border-t border-slate-200 bg-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded bg-slate-900 text-white flex items-center justify-center">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                </div>
                <span className="font-bold text-slate-900 text-sm">TrustPool</span>
              </div>
              <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                The institutional shared-resource platform enforcing fair allocation,
                digital chain of custody, and verified trust across equipment, labs,
                and research facilities.
              </p>
              <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1">
                <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Campus Verified
                </span>
                <span>•</span>
                <span>Cryptographic QR Passes</span>
                <span>•</span>
                <span>Algorithmic Fairness</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2.5">
                Explore Portals
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-600">
                <li>
                  <Link
                    to="/student/dashboard"
                    onClick={() => switchRole('student')}
                    className="hover:text-slate-900"
                  >
                    Student Borrower Portal
                  </Link>
                </li>
                <li>
                  <Link
                    to="/owner/dashboard"
                    onClick={() => switchRole('owner')}
                    className="hover:text-slate-900"
                  >
                    Owner Management Console
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/dashboard"
                    onClick={() => switchRole('admin')}
                    className="hover:text-slate-900"
                  >
                    Campus Admin Command
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2.5">
                Compliance & Trust
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-600">
                <li>Institutional Verification</li>
                <li>Fairness Index Protocol</li>
                <li>Chain of Custody Logs</li>
                <li>Privacy & Data Integrity</li>
              </ul>
            </div>
          </div>

          <div className="pt-8 mt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
            <p>© {new Date().getFullYear()} TrustPool Platform. Built for Fair Resource Governance.</p>
            <p className="font-mono text-[11px]">System Status: Operational • All Clusters Healthy</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

