import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { useCreateResource } from '../../hooks/useResources';
import { ResourceCategory } from '../../types';
import {
  Layers,
  MapPin,
  ShieldCheck,
  Upload,
  CheckCircle2,
  DollarSign,
  AlertCircle,
  Eye,
  Plus,
} from 'lucide-react';

export const AddResourcePage: React.FC = () => {
  const navigate = useNavigate();
  const createResource = useCreateResource();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ResourceCategory>('equipment');
  const [location, setLocation] = useState('Engineering Hall, Lab 304');
  const [capacity, setCapacity] = useState(1);
  const [securityDeposit, setSecurityDeposit] = useState(0);
  const [imageUrl, setImageUrl] = useState(
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'
  );
  const [rules, setRules] = useState('Standard laboratory safety rules apply. Please return in clean condition.');
  const [requiresApproval, setRequiresApproval] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return setError('Please enter a resource title.');
    setError('');

    try {
      setSubmitting(true);
      await createResource.mutateAsync({
        title,
        description,
        category,
        location,
        capacity: Number(capacity),
        securityDeposit: Number(securityDeposit),
        imageUrl,
        rules: [{ id: 'rule-1', rule: rules, isStrict: false }],
      });

      navigate('/owner/resources');
    } catch (err: any) {
      setError(err?.message || 'Failed to list resource. Please review fields.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <PageHeader
        title="Add Institutional Resource"
        description="Make underutilized lab equipment, workspaces, or media gear securely accessible across campus"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 cols: Multi-section form */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6">
          {/* Section 1: Basic Information & Category */}
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                1. Resource Details & Identification
              </CardTitle>
              <CardDescription>
                Provide a descriptive title and classification for student discovery
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Resource Name"
                placeholder="e.g. Sony FX3 Cinema Line Full-Frame Kit"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ResourceCategory)}
                  options={[
                    { value: 'equipment', label: 'Field & Studio Equipment' },
                    { value: 'lab', label: 'Specialized Laboratory Facility' },
                    { value: 'room', label: 'Study or Rehearsal Space' },
                  ]}
                />

                <Input
                  label="Maximum Simultaneous Capacity"
                  type="number"
                  min="1"
                  max="100"
                  value={capacity}
                  onChange={(e) => setCapacity(Number(e.target.value))}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Description & Specifications
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed technical specifications, package inclusions, lens mounts, calibration status..."
                  className="w-full min-h-[90px] p-3 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Location, Media & Verification */}
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                2. Physical Custody & Photographic Cover
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Custody Location / Pickup Station"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Center for Media Arts, Room 210B"
                leftIcon={<MapPin className="w-4 h-4" />}
                required
              />

              <Input
                label="Image URL Preview"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
                leftIcon={<Upload className="w-4 h-4" />}
              />
            </CardContent>
          </Card>

          {/* Section 3: Governance & Security Rules */}
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                3. Governance, Approval & Safety Rules
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Security Deposit (USD, optional)"
                  type="number"
                  min="0"
                  value={securityDeposit}
                  onChange={(e) => setSecurityDeposit(Number(e.target.value))}
                  leftIcon={<DollarSign className="w-4 h-4" />}
                />

                <div className="flex flex-col justify-center">
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer pt-3">
                    <input
                      type="checkbox"
                      checked={requiresApproval}
                      onChange={(e) => setRequiresApproval(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Require Custodian Approval per Request</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Access Rules & Handling Instructions
                </label>
                <textarea
                  value={rules}
                  onChange={(e) => setRules(e.target.value)}
                  placeholder="Detail clean-room protocol, operator certification required, late return policies..."
                  className="w-full min-h-[80px] p-3 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </CardContent>
          </Card>

          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => navigate('/owner/resources')}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              isLoading={submitting}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Publish Resource Listing
            </Button>
          </div>
        </form>

        {/* Right 5 cols: Live Preview Card */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-blue-600" /> Live Marketplace Preview
            </span>
            <span className="text-[11px] text-slate-400">Student Card View</span>
          </div>

          <Card className="border-slate-200 overflow-hidden shadow-card hover:shadow-cardHover transition-all">
            <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
              <img
                src={imageUrl || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80';
                }}
              />
              <div className="absolute top-3 left-3">
                <span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-white/95 text-slate-800 shadow-xs backdrop-blur-xs">
                  {category}
                </span>
              </div>
              <div className="absolute top-3 right-3">
                <span className="px-2 py-1 rounded-md text-[10px] font-bold bg-emerald-500/90 text-white shadow-xs backdrop-blur-xs flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Available
                </span>
              </div>
            </div>

            <CardContent className="p-5 space-y-3">
              <h4 className="text-base font-bold text-slate-900 leading-snug">
                {title || 'Resource Title Preview'}
              </h4>
              <p className="text-xs text-slate-500 line-clamp-2">
                {description || 'Comprehensive description of technical capabilities and loan instructions will appear here.'}
              </p>

              <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{requiresApproval ? 'Custodian Pre-approval Required' : 'Instant Reservation'}</span>
                </div>
              </div>

              <div className="pt-3">
                <Button className="w-full bg-slate-900 text-white" size="sm" disabled>
                  Request Reservation (Preview)
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
