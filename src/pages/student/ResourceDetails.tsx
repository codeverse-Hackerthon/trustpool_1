import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useResource } from '../../hooks/useResources';
import { useAuth } from '../../hooks/useAuth';
import { BookingFlowModal } from '../../components/booking/BookingFlowModal';
import {
  MapPin,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  Calendar,
  Clock,
  ArrowLeft,
  Building,
  CheckCircle2,
  Sparkles,
  Info,
  DollarSign,
  Share2,
} from 'lucide-react';

export const ResourceDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: resource, isLoading, isError } = useResource(id || 'res-101');
  const { user } = useAuth();

  // Selected gallery image index
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const userTrustScore = user?.trustScore ?? 92;

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-6 w-32 bg-slate-200 rounded" />
        <div className="h-12 w-3/4 bg-slate-200 rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-80 bg-slate-200 rounded-xl" />
            <div className="h-48 bg-slate-100 rounded-xl" />
          </div>
          <div className="h-96 bg-slate-100 rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError || !resource) {
    return (
      <div className="p-12 text-center space-y-4">
        <p className="text-slate-600 font-semibold">Resource not found or unavailable.</p>
        <Link to="/student/resources">
          <Button variant="outline" size="sm">
            Back to Resource Catalog
          </Button>
        </Link>
      </div>
    );
  }

  const isEligible = userTrustScore >= resource.minTrustScore;
  const isAvailable = resource.status === 'available';

  // Images list (fallback to imageUrl if images array is not present)
  const galleryImages = resource.images && resource.images.length > 0
    ? resource.images
    : [resource.imageUrl || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80'];

  const currentHeroImage = galleryImages[selectedImageIndex] || galleryImages[0];

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Back button & Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/student/resources"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Resource Discovery
        </Link>
        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors px-2.5 py-1 rounded-lg border border-slate-200 bg-white"
        >
          <Share2 className="w-3.5 h-3.5" />
          {copiedLink ? 'Link Copied!' : 'Share Resource'}
        </button>
      </div>

      {/* Page Header */}
      <PageHeader
        title={resource.title}
        description={resource.description}
        tag={resource.category.replace('_', ' ').toUpperCase()}
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge
              status={isAvailable ? 'APPROVED' : 'PENDING'}
              label={isAvailable ? 'Available Now' : 'In Use / Queue'}
              size="lg"
            />
          </div>
        }
      />

      {/* Main Grid: 2 Cols Left (Gallery & Details), 1 Col Right (Custodian & Booking) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Gallery, Specs, Schedule, Rules */}
        <div className="lg:col-span-2 space-y-6">
          {/* Interactive Image Gallery */}
          <div className="space-y-3">
            <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-900 h-80 sm:h-96 relative group shadow-sm">
              <img
                src={currentHeroImage}
                alt={resource.title}
                className="w-full h-full object-cover transition-all duration-300 group-hover:scale-[1.02]"
              />
              <div className="absolute top-3 left-3">
                <span className="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-black/60 text-white backdrop-blur-md shadow-sm">
                  {resource.category}
                </span>
              </div>
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs drop-shadow-md">
                <span className="flex items-center gap-1 bg-black/50 px-2 py-1 rounded-md backdrop-blur-sm">
                  <MapPin className="w-3.5 h-3.5" />
                  {resource.location}
                </span>
                <span className="bg-black/50 px-2 py-1 rounded-md backdrop-blur-sm text-[11px]">
                  Image {selectedImageIndex + 1} of {galleryImages.length}
                </span>
              </div>
            </div>

            {/* Thumbnail selector */}
            {galleryImages.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative w-20 h-16 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                      selectedImageIndex === idx
                        ? 'border-blue-600 ring-2 ring-blue-500/30'
                        : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Angle ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Technical Specifications */}
          <Card>
            <CardHeader>
              <CardTitle>Technical Specifications</CardTitle>
              <p className="text-xs text-slate-500">
                Verified hardware benchmarks & included custodian kit accessories
              </p>
            </CardHeader>
            <CardContent className="space-y-2">
              {resource.specifications ? (
                <div className="divide-y divide-slate-100">
                  {Object.entries(resource.specifications).map(([key, val]) => (
                    <div
                      key={key}
                      className="flex flex-col sm:flex-row sm:items-center justify-between py-2 text-xs"
                    >
                      <span className="text-slate-500 font-medium sm:w-1/3">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span className="text-slate-900 font-semibold sm:w-2/3 sm:text-right">
                        {String(val)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">Standard equipment specifications apply.</p>
              )}
            </CardContent>
          </Card>

          {/* Location & Availability Calendar Schedule */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Weekly Availability & Slots</CardTitle>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Standard institutional slot rotation for the current week
                  </p>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="flex items-center gap-1 text-emerald-700">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" /> Available
                  </span>
                  <span className="flex items-center gap-1 text-slate-500">
                    <span className="w-2 h-2 rounded-full bg-slate-300" /> Booked
                  </span>
                  <span className="flex items-center gap-1 text-purple-700">
                    <span className="w-2 h-2 rounded-full bg-purple-500" /> Contested
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Available Days */}
              {resource.availableDays && (
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Operating Schedule
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(
                      (day) => {
                        const isDayAvailable = resource.availableDays?.includes(day);
                        return (
                          <span
                            key={day}
                            className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                              isDayAvailable
                                ? 'bg-slate-100 text-slate-800 border border-slate-200'
                                : 'bg-slate-50 text-slate-300 border border-slate-100 line-through'
                            }`}
                          >
                            {day.slice(0, 3)}
                          </span>
                        );
                      }
                    )}
                  </div>
                </div>
              )}

              {/* Slot Grid Preview */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Sample Daily Slots
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {(resource.scheduleSlots || [
                    { time: '09:00 - 12:00', status: 'available' },
                    { time: '12:00 - 15:00', status: 'booked' },
                    { time: '15:00 - 18:00', status: 'available' },
                    { time: '18:00 - 21:00', status: 'available' },
                  ]).map((slot, idx) => (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-lg border text-xs text-center ${
                        slot.status === 'available'
                          ? 'border-emerald-200 bg-emerald-50/50 text-emerald-900'
                          : slot.status === 'contested'
                          ? 'border-purple-200 bg-purple-50/50 text-purple-900'
                          : 'border-slate-200 bg-slate-50 text-slate-400'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5 mx-auto mb-1 opacity-70" />
                      <p className="font-bold">{slot.time}</p>
                      <p className="text-[10px] uppercase font-semibold mt-0.5">
                        {slot.status === 'available'
                          ? 'Available'
                          : slot.status === 'contested'
                          ? 'Contested'
                          : 'Reserved'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Usage & Care Rules */}
          <Card>
            <CardHeader>
              <CardTitle>Custodian Care & Return Protocol</CardTitle>
              <p className="text-xs text-slate-500">
                Borrowers must comply with all mandatory rules. Punctual return protects your Fair Access standing.
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {resource.rules && resource.rules.length > 0 ? (
                resource.rules.map((rule) => (
                  <div
                    key={rule.id}
                    className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs"
                  >
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <span className="text-slate-800 font-medium">{rule.rule}</span>
                      {rule.isStrict && (
                        <span className="ml-2 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800">
                          Mandatory
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400">Standard campus custodian protocol in effect.</p>
              )}
            </CardContent>
          </Card>

          {/* Security Deposit Policy */}
          <Card className="border-blue-200/80 bg-blue-50/20">
            <CardContent className="p-5 flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-blue-100 text-blue-800 shrink-0 mt-0.5">
                <DollarSign className="w-5 h-5" />
              </div>
              <div className="space-y-1 text-xs">
                <h4 className="font-bold text-slate-900 text-sm">
                  TrustPool Institutional Guarantee Deposit Policy
                </h4>
                <p className="text-slate-600 leading-relaxed">
                  Standard monetary deposits are <strong>100% waived ($0.00)</strong> for borrowers maintaining a Trust Score above {resource.minTrustScore}. Your institutional affiliation and pre/post QR condition audit serve as the collateral guarantee.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Custodian Verification, Trust Status & Action CTA */}
        <div className="space-y-6">
          {/* Booking Action Card */}
          <Card className="border-slate-300 shadow-md sticky top-6">
            <CardHeader className="border-b border-slate-100 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle>Reserve This Resource</CardTitle>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Free Academic Use
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              {/* Pickup station details */}
              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2.5 text-slate-600">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-900 block">{resource.location}</span>
                    <span className="text-[11px] text-slate-500">
                      {resource.building || 'Main Campus'}, {resource.roomNumber || 'Custody Hub'}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 text-slate-600 pt-1">
                  <Building className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-slate-900">{resource.ownerName}</span>
                      {resource.ownerVerified && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 block">
                      {resource.ownerRole || 'Lab Director'}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      {resource.ownerDepartment || 'Campus Shared Facilities'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Trust Score Eligibility Check Box */}
              <div
                className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                  isEligible
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                    : 'border-rose-200 bg-rose-50 text-rose-900'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold">
                  {isEligible ? (
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                  )}
                  <span>{isEligible ? 'Eligible for Allocation' : 'Trust Score Too Low'}</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Requires minimum Trust Score of <strong>{resource.minTrustScore}</strong>. Your current standing is{' '}
                  <strong className="text-emerald-700">{userTrustScore} / 100</strong>.
                </p>
                {isEligible && (
                  <p className="text-[10px] text-emerald-800 font-semibold pt-0.5 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    Priority Allocation Tier A active
                  </p>
                )}
              </div>

              {/* Booking CTA Button */}
              <div className="pt-2 space-y-2">
                <Button
                  variant="primary"
                  className="w-full text-xs font-bold"
                  size="md"
                  disabled={!isEligible}
                  onClick={() => setIsBookingModalOpen(true)}
                  leftIcon={<Calendar className="w-4 h-4" />}
                >
                  {isAvailable ? 'Request Booking Slot' : 'Join Fair Waitlist'}
                </Button>

                <p className="text-[10px] text-slate-400 text-center flex items-center justify-center gap-1">
                  <Info className="w-3 h-3" />
                  Includes automatic anti-hoarding verification
                </p>
              </div>

              {/* Quick Custodian Factoids */}
              <div className="border-t border-slate-100 pt-3 space-y-2 text-[11px] text-slate-500">
                <div className="flex justify-between">
                  <span>Max Duration:</span>
                  <span className="font-semibold text-slate-700">3 – 6 hours / loan</span>
                </div>
                <div className="flex justify-between">
                  <span>Custodian Acceptance:</span>
                  <span className="font-semibold text-slate-700">Instant / Automated</span>
                </div>
                <div className="flex justify-between">
                  <span>Access Method:</span>
                  <span className="font-semibold text-slate-700">QR Digital Scan Check-in</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Multi-step Booking Flow Modal */}
      <BookingFlowModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        resource={resource}
      />
    </div>
  );
};
