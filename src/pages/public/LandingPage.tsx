import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Scale,
  QrCode,
  ArrowRight,
  GraduationCap,
  Layers,
  CheckCircle2,
  Sparkles,
  ClipboardCheck,
  FileText,
  AlertTriangle,
  Search,
  Check,
  Lock,
  ChevronRight,
  MapPin,
  Calendar,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '../../types';

export const LandingPage: React.FC = () => {
  const { switchRole } = useAuth();
  const navigate = useNavigate();
  const [activePersona, setActivePersona] = useState<UserRole>('student');

  const scrollToHowItWorks = () => {
    const el = document.getElementById('how-it-works');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLaunchRole = (role: UserRole) => {
    switchRole(role);
    if (role === 'student') navigate('/student/dashboard');
    if (role === 'owner') navigate('/owner/dashboard');
    if (role === 'admin') navigate('/admin/dashboard');
  };

  return (
    <div className="space-y-20 sm:space-y-28 py-6 sm:py-12">
      {/* ================= 1. HERO SECTION ================= */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headline & Value Proposition */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 text-white text-xs font-semibold shadow-xs">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold tracking-wider uppercase text-[11px] text-emerald-400">
                TrustPool
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-200">Share Resources. Build Trust.</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
              Trusted & Fair Access to Shared Resources.
            </h1>

            {/* Problem / Solution Short Explanation */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
              TrustPool eliminates equipment hoarding, chaotic sign-out sheets, and return disputes. We provide an institutional platform that connects campus facilities, labs, and specialized tools through algorithmic fairness, cryptographic QR custody, and verified trust scores.
            </p>

            {/* Primary & Secondary CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Link to="/student/resources">
                <Button
                  size="lg"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  className="w-full sm:w-auto shadow-md"
                >
                  Explore Resources
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                onClick={scrollToHowItWorks}
                className="w-full sm:w-auto bg-white"
              >
                How It Works
              </Button>
            </div>

            {/* Proof Points Ticker */}
            <div className="pt-4 border-t border-slate-200/80 grid grid-cols-3 gap-4 text-xs">
              <div>
                <div className="font-extrabold text-slate-900 text-base sm:text-lg">100%</div>
                <div className="text-slate-500 text-[11px]">Algorithmic Fairness</div>
              </div>
              <div>
                <div className="font-extrabold text-slate-900 text-base sm:text-lg">0</div>
                <div className="text-slate-500 text-[11px]">Unresolved Disputes</div>
              </div>
              <div>
                <div className="font-extrabold text-slate-900 text-base sm:text-lg">Verified</div>
                <div className="text-slate-500 text-[11px]">Chain of Custody</div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Real-Time Live Preview Mockup */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xl">
              {/* Header of Simulated Pass */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-slate-900 text-white flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block leading-tight">
                      Active Custody Pass
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      TOKEN-883921
                    </span>
                  </div>
                </div>
                <StatusBadge status="ACTIVE" size="sm" />
              </div>

              {/* Resource Preview Card */}
              <div className="py-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 shrink-0">
                    <img
                      src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=300&q=80"
                      alt="Sony FX3 Cinema Rig"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-1 flex-1 min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Media Equipment
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 truncate">
                      Sony FX3 Cinema Camera Kit
                    </h3>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>Studio 204 • Media Arts</span>
                    </div>
                  </div>
                </div>

                {/* Simulated QR Handshake Station */}
                <div className="rounded-xl bg-slate-950 p-3.5 text-center text-white space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Borrower: Alex Rivera</span>
                    <span className="text-emerald-400 font-medium">92 TrustScore</span>
                  </div>
                  <div className="w-32 h-32 mx-auto bg-white rounded-lg p-2 shadow flex items-center justify-center">
                    <QrCode className="w-28 h-28 text-slate-900" />
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    Scan at Station for Contactless Handshake
                  </div>
                </div>

                {/* Live State Steps */}
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Expected Return:</span>
                  <span className="font-semibold text-slate-900">Today @ 14:00 (On Schedule)</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100">
                <span className="flex items-center gap-1 text-emerald-700 font-medium">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Pre-use Inspection Filed
                </span>
                <span>+2 Trust on Punctual Return</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 2. HOW IT WORKS (VISUAL 6-STEP FLOW) ================= */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            End-To-End Architecture
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            How TrustPool Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            From search to return, every step is governed by peer accountability, algorithmic fairness, and verifiable digital custody.
          </p>
        </div>

        {/* 6-Step Visual Flow Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 relative">
          {/* Step 1 */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="h-8 w-8 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
                  01
                </div>
                <Search className="w-4 h-4 text-slate-400" />
              </div>
              <h3 className="text-xs font-bold text-slate-900">Discover Resources</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Browse verified campus cameras, labs, 3D printers, and event studios.
              </p>
            </div>
            <div className="text-[10px] font-semibold text-slate-400 pt-2 border-t border-slate-100">
              Live Catalog
            </div>
          </div>

          {/* Step 2 */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center text-xs font-bold border border-blue-200">
                  02
                </div>
                <Calendar className="w-4 h-4 text-blue-500" />
              </div>
              <h3 className="text-xs font-bold text-slate-900">Request Booking</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Select required slot hours and specify your project purpose.
              </p>
            </div>
            <div className="text-[10px] font-semibold text-blue-600 pt-2 border-t border-slate-100">
              Time Reservation
            </div>
          </div>

          {/* Step 3 */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="h-8 w-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center text-xs font-bold border border-purple-200">
                  03
                </div>
                <Scale className="w-4 h-4 text-purple-500" />
              </div>
              <h3 className="text-xs font-bold text-slate-900">Fair Allocation</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Anti-hoarding engine checks trust score and weekly usage quotas.
              </p>
            </div>
            <div className="text-[10px] font-semibold text-purple-600 pt-2 border-t border-slate-100">
              Zero Monopolies
            </div>
          </div>

          {/* Step 4 */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center text-xs font-bold border border-amber-200">
                  04
                </div>
                <QrCode className="w-4 h-4 text-amber-600" />
              </div>
              <h3 className="text-xs font-bold text-slate-900">QR Access</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Scan custodian terminal barcode for contactless chain of custody handshake.
              </p>
            </div>
            <div className="text-[10px] font-semibold text-amber-700 pt-2 border-t border-slate-100">
              Digital Token
            </div>
          </div>

          {/* Step 5 */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center text-xs font-bold border border-emerald-200">
                  05
                </div>
                <ClipboardCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <h3 className="text-xs font-bold text-slate-900">Use Resource</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                File 1-minute pre-inspection checklist to protect yourself from prior damage.
              </p>
            </div>
            <div className="text-[10px] font-semibold text-emerald-700 pt-2 border-t border-slate-100">
              Checklist Protected
            </div>
          </div>

          {/* Step 6 */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="h-8 w-8 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center text-xs font-bold border border-slate-300">
                  06
                </div>
                <ShieldCheck className="w-4 h-4 text-slate-700" />
              </div>
              <h3 className="text-xs font-bold text-slate-900">Return & Verify</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Custodian confirms condition. Trust score increases and slot reopens for peers.
              </p>
            </div>
            <div className="text-[10px] font-semibold text-slate-600 pt-2 border-t border-slate-100">
              Score Boosted
            </div>
          </div>
        </div>
      </section>

      {/* ================= 3. PROBLEM SECTION ================= */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-14 shadow-sm space-y-10">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600">
              The Broken Status Quo
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Shared Resource Management is Deeply Broken.
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Universities and innovation hubs spend millions on top-tier equipment and research labs, yet access remains chaotic, unfair, and fraught with distrust.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Problem 1 */}
            <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/90 space-y-2.5">
              <div className="h-8 w-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200">
                <Lock className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Resources Remain Underutilized
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Expensive cinematography gear, 3D printers, and robotics benches sit locked inside department closets because custodians fear losing custody.
              </p>
            </div>

            {/* Problem 2 */}
            <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/90 space-y-2.5">
              <div className="h-8 w-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200">
                <Scale className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Access is Often Unfair
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                First-come-first-served booking enables power users to monopolize entire weeks of lab time, blocking students with urgent coursework.
              </p>
            </div>

            {/* Problem 3 */}
            <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/90 space-y-2.5">
              <div className="h-8 w-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Manual Booking Creates Conflicts
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Paper sign-out clipboards, scattered spreadsheets, and email chains inevitably produce double-bookings, ghost reservations, and disputes.
              </p>
            </div>

            {/* Problem 4 */}
            <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/90 space-y-2.5">
              <div className="h-8 w-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Owners Lack Trust & Accountability
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Without a verifiable reputation history, equipment owners have no objective way to differentiate punctual caretakers from reckless borrowers.
              </p>
            </div>

            {/* Problem 5 */}
            <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/90 space-y-2.5">
              <div className="h-8 w-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200">
                <FileText className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Damage Disputes are Unmanageable
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                When equipment is returned damaged or missing power supplies, the lack of pre/post-use condition audits creates endless blame games.
              </p>
            </div>

            {/* TrustPool Answer */}
            <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-2.5 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-400 text-slate-950 uppercase tracking-wider">
                  The Solution
                </div>
                <h3 className="text-sm font-bold text-white">
                  The TrustPool Standard
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Cryptographic custody handshakes, mathematically fair allocation, and personal trust metrics that turn shared access into a high-trust economy.
                </p>
              </div>
              <div className="pt-2 border-t border-slate-800 flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                <Check className="w-3.5 h-3.5" />
                <span>Zero Gatekeeping • Complete Assurance</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 4. CORE FEATURES ================= */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Engineered For Excellence
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Institutional-Grade Capabilities
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Everything necessary to manage high-value shared facilities with zero friction and total transparency.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <Card hover className="p-6 space-y-3">
            <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Smart Resource Discovery
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Instant keyword search, category filtering (Equipment, Rooms, Labs, Event Spaces, Facilities), availability statuses, and minimum trust score specifications.
            </p>
            <ul className="text-xs text-slate-600 space-y-1 pt-2 border-t border-slate-100">
              <li className="flex items-center gap-1.5">
                <Check className="w-3 h-3 text-emerald-600" /> Live capacity & location tracking
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="w-3 h-3 text-emerald-600" /> Technical specification inspection
              </li>
            </ul>
          </Card>

          {/* Feature 2 */}
          <Card hover className="p-6 space-y-3">
            <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-200">
              <Scale className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Fair Allocation Engine
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Anti-hoarding mathematical algorithms prevent single users from monopolizing gear. Contested slots are assigned based on punctuality records and weekly balance.
            </p>
            <ul className="text-xs text-slate-600 space-y-1 pt-2 border-t border-slate-100">
              <li className="flex items-center gap-1.5">
                <Check className="w-3 h-3 text-emerald-600" /> Transparent priority waitlist rank
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="w-3 h-3 text-emerald-600" /> Weekly quota protection
              </li>
            </ul>
          </Card>

          {/* Feature 3 */}
          <Card hover className="p-6 space-y-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
              <QrCode className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              QR-Based Access Passes
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Backend-generated cryptographically signed QR codes enable instantaneous check-in and checkout at resource custody stations without manual paperwork.
            </p>
            <ul className="text-xs text-slate-600 space-y-1 pt-2 border-t border-slate-100">
              <li className="flex items-center gap-1.5">
                <Check className="w-3 h-3 text-emerald-600" /> Optical camera scan via html5-qrcode
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="w-3 h-3 text-emerald-600" /> One-tap mobile pass display
              </li>
            </ul>
          </Card>

          {/* Feature 4 */}
          <Card hover className="p-6 space-y-3">
            <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center border border-amber-200">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Condition Verification
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Standardized pre-use and post-use digital checklists. Borrowers document pre-existing defects so they are never unfairly penalized on return.
            </p>
            <ul className="text-xs text-slate-600 space-y-1 pt-2 border-t border-slate-100">
              <li className="flex items-center gap-1.5">
                <Check className="w-3 h-3 text-emerald-600" /> Cleanliness and accessory checks
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="w-3 h-3 text-emerald-600" /> Photo evidence filing
              </li>
            </ul>
          </Card>

          {/* Feature 5 */}
          <Card hover className="p-6 space-y-3">
            <div className="h-10 w-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center border border-slate-200">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Transparent Audit Trail
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Immutable logging of all reservations, allocation decisions, check-in timestamps, and dispute resolutions for campus compliance and auditability.
            </p>
            <ul className="text-xs text-slate-600 space-y-1 pt-2 border-t border-slate-100">
              <li className="flex items-center gap-1.5">
                <Check className="w-3 h-3 text-emerald-600" /> Timestamped custody handover
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="w-3 h-3 text-emerald-600" /> Tamper-evident ledger feed
              </li>
            </ul>
          </Card>

          {/* Feature 6 */}
          <Card hover className="p-6 space-y-3">
            <div className="h-10 w-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center border border-rose-200">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Dynamic Trust Scoring
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Borrower scores adjust based on punctuality and asset care. Higher scores grant access to Tier A cinema gear and specialized cleanroom suites.
            </p>
            <ul className="text-xs text-slate-600 space-y-1 pt-2 border-t border-slate-100">
              <li className="flex items-center gap-1.5">
                <Check className="w-3 h-3 text-emerald-600" /> Punctuality bonuses (+2 Points)
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="w-3 h-3 text-emerald-600" /> Restorative dispute arbitration
              </li>
            </ul>
          </Card>
        </div>
      </section>

      {/* ================= 5. USER TYPES (BENEFITS BY PERSONA) ================= */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Tailored Experiences
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Built For Every Campus Stakeholder
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Whether borrowing equipment for a capstone film, managing an engineering lab, or overseeing campus infrastructure.
          </p>
        </div>

        {/* Persona Selector Tabs */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1 rounded-xl bg-slate-200/80 border border-slate-300 max-w-md w-full">
            {(
              [
                { role: 'student', label: 'Students / Borrowers', icon: GraduationCap },
                { role: 'owner', label: 'Resource Owners', icon: Layers },
                { role: 'admin', label: 'Campus Admins', icon: ShieldCheck },
              ] as const
            ).map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.role}
                  type="button"
                  onClick={() => setActivePersona(item.role)}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    activePersona === item.role
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{item.label}</span>
                  <span className="sm:hidden">{item.role}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Persona Details Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm">
          {activePersona === 'student' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Borrower Persona • Student & Researcher</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Transparent, Politics-Free Access to Advanced Gear
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  No more begging for lab time or waiting weeks for manual approvals. TrustPool empowers you with equal access to the university's best creative and engineering facilities.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Fair Waiting Lists:</strong> Low weekly usage boosts your priority queue ranking.</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Pre-Use Protection:</strong> File initial condition checklists so you are never blamed for existing wear.</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Mobile QR Access:</strong> Show your pass on your smartphone for instant check-in.</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Reputation Rewards:</strong> Earn TrustScore points to unlock high-tier specialized rigs.</span>
                  </div>
                </div>
                <div className="pt-2">
                  <Button
                    size="md"
                    onClick={() => handleLaunchRole('student')}
                    rightIcon={<ChevronRight className="w-4 h-4" />}
                  >
                    Launch Student Portal
                  </Button>
                </div>
              </div>
              <div className="lg:col-span-5 bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Sample Student Journey
                </span>
                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-lg bg-white border border-slate-200">
                    <div className="font-semibold text-slate-900">1. Discover Resource</div>
                    <div className="text-slate-500 text-[11px]">Filtered 4K Cinema Kit • Media Lab</div>
                  </div>
                  <div className="p-3 rounded-lg bg-white border border-slate-200">
                    <div className="font-semibold text-slate-900">2. Algorithmic Allocation</div>
                    <div className="text-emerald-700 text-[11px] font-medium">Position #1 • Low Usage Bonus Applied</div>
                  </div>
                  <div className="p-3 rounded-lg bg-white border border-slate-200">
                    <div className="font-semibold text-slate-900">3. QR Handshake</div>
                    <div className="text-slate-500 text-[11px]">Contactless check-in at Studio 204 terminal</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activePersona === 'owner' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Custodian Persona • Lab Directors & Resource Owners</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Complete Peace of Mind & Unbroken Chain of Custody
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Lend out equipment with total confidence. TrustPool screens borrower credentials, enforces minimum trust score requirements, and documents equipment state at every handover.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>1-Click Approval Queue:</strong> Inspect student project context and verify trust standing before confirming.</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Return Checklist Verification:</strong> Confirm parts, lenses, and batteries with guided inspection.</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Incident Escalation:</strong> Seamlessly log damages with photo evidence for administrative dispute review.</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Asset Analytics:</strong> Track hourly utilization, maintenance frequency, and department demand.</span>
                  </div>
                </div>
                <div className="pt-2">
                  <Button
                    size="md"
                    onClick={() => handleLaunchRole('owner')}
                    rightIcon={<ChevronRight className="w-4 h-4" />}
                  >
                    Launch Owner Console
                  </Button>
                </div>
              </div>
              <div className="lg:col-span-5 bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Custodian Dashboard Highlights
                </span>
                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-lg bg-white border border-slate-200 flex items-center justify-between">
                    <span>4 Active Assets Tracked</span>
                    <StatusBadge status="ACTIVE" size="sm" />
                  </div>
                  <div className="p-3 rounded-lg bg-white border border-slate-200 flex items-center justify-between">
                    <span>1 Awaiting Check-In Scan</span>
                    <StatusBadge status="PENDING" size="sm" />
                  </div>
                  <div className="p-3 rounded-lg bg-white border border-slate-200 flex items-center justify-between">
                    <span>Zero Overdue Loans</span>
                    <span className="text-emerald-700 font-bold">100% On-Time</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activePersona === 'admin' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 text-xs font-bold border border-purple-200">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin Persona • Campus Trust Ops & Dean's Office</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Campus-Wide Visibility, Governance & Accountability
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Monitor multi-department shared resources, verify student identities against university registrars, arbitrate damaged asset disputes, and audit immutable event records.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Campus Utilization Metrics:</strong> Measure real equipment ROI across all academic colleges.</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Student & Faculty Verification:</strong> Verify registrar status before allocating high-risk equipment.</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Dispute Docket:</strong> Impartial administrative review for return delays and damage claims.</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Immutable Audit Logs:</strong> Cryptographic event trails for campus risk and compliance review.</span>
                  </div>
                </div>
                <div className="pt-2">
                  <Button
                    size="md"
                    onClick={() => handleLaunchRole('admin')}
                    rightIcon={<ChevronRight className="w-4 h-4" />}
                  >
                    Launch Admin Command
                  </Button>
                </div>
              </div>
              <div className="lg:col-span-5 bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Campus Trust Governance Feed
                </span>
                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-lg bg-white border border-slate-200">
                    <div className="font-semibold text-slate-900">Fairness Index: 96 / 100</div>
                    <div className="text-slate-500 text-[11px]">Optimal distribution across 12 departments</div>
                  </div>
                  <div className="p-3 rounded-lg bg-white border border-slate-200">
                    <div className="font-semibold text-slate-900">Identity Verifications: 3 Pending</div>
                    <div className="text-slate-500 text-[11px]">Registrar database match checks</div>
                  </div>
                  <div className="p-3 rounded-lg bg-white border border-slate-200">
                    <div className="font-semibold text-slate-900">616 Total Active Personas</div>
                    <div className="text-emerald-700 text-[11px] font-medium">68% Tier A • Trusted Standing</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ================= 6. FINAL CTA SECTION ================= */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-slate-900 text-white p-8 sm:p-14 text-center space-y-6 shadow-2xl relative overflow-hidden">
          {/* Subtle Decorative Grid Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-emerald-400 text-xs font-semibold border border-slate-700">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ready for Campus Deployment</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Share Resources. Build Trust.
            </h2>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Experience the future of fair and verified shared facilities. Join students, custodians, and researchers today on TrustPool.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
              <Link to="/student/resources">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-white text-slate-900 hover:bg-slate-100 border-none font-bold shadow-lg"
                  rightIcon={<ArrowRight className="w-4 h-4 text-slate-900" />}
                >
                  Explore Resources Catalog
                </Button>
              </Link>
              <Link to="/login">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto bg-slate-800 text-white border-slate-700 hover:bg-slate-700"
                >
                  Sign In to Workspace
                </Button>
              </Link>
            </div>

            <p className="text-xs text-slate-500 pt-2">
              Instant evaluation access enabled. No credit card required.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
