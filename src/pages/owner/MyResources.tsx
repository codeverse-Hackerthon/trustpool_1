import React, { useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { SearchBar } from '../../components/ui/SearchBar';
import { useOwnerResources, useCreateResource } from '../../hooks/useResources';
import {
  Plus,
  MapPin,
  ShieldCheck,
  Edit2,
  Trash2,
  Upload,
  X,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { RESOURCE_CATEGORIES } from '../../utils/constants';
import { Resource, ResourceCategory, ResourceStatus } from '../../types';

export const MyResources: React.FC = () => {
  const { data: resources, isLoading } = useOwnerResources();
  const createResource = useCreateResource();

  // Search & Filter
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Modal State (Add & Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ResourceCategory>('equipment');
  const [status, setStatus] = useState<ResourceStatus>('available');
  const [location, setLocation] = useState('');
  const [building, setBuilding] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [minTrustScore, setMinTrustScore] = useState('75');
  const [securityDeposit, setSecurityDeposit] = useState('0');
  const [specKey, setSpecKey] = useState('Resolution');
  const [specVal, setSpecVal] = useState('4K 120fps');
  const [ruleInput, setRuleInput] = useState('');
  const [rules, setRules] = useState<string[]>([
    'Clean equipment before and after use',
    'Transport strictly in hard protective case',
  ]);
  const [photoUrls, setPhotoUrls] = useState<string[]>([
    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
  ]);

  // Delete Dialog state
  const [deleteTarget, setDeleteTarget] = useState<Resource | null>(null);

  // Filtered resources
  const filteredList = (resources || []).filter((r) => {
    const matchesCat = filterCategory === 'all' || r.category === filterCategory;
    const matchesSearch =
      !search ||
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.location.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleOpenAdd = () => {
    setEditingResource(null);
    setTitle('');
    setDescription('Institutional asset managed by campus facility department.');
    setCategory('equipment');
    setStatus('available');
    setLocation('Media Arts Center, Level 2');
    setBuilding('Creative Arts Complex');
    setRoomNumber('Studio 204');
    setMinTrustScore('75');
    setSecurityDeposit('0');
    setRules(['Clean equipment before and after use', 'Transport strictly in hard protective case']);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (res: Resource) => {
    setEditingResource(res);
    setTitle(res.title);
    setDescription(res.description);
    setCategory(res.category);
    setStatus(res.status);
    setLocation(res.location);
    setBuilding(res.building || '');
    setRoomNumber(res.roomNumber || '');
    setMinTrustScore(String(res.minTrustScore));
    setSecurityDeposit(String(res.securityDeposit || 0));
    setRules(res.rules?.map((r) => r.rule) || ['Standard custodian protocol']);
    setPhotoUrls(res.images && res.images.length > 0 ? res.images : [res.imageUrl || '']);
    setIsModalOpen(true);
  };

  const handleAddRule = () => {
    if (!ruleInput.trim()) return;
    setRules([...rules, ruleInput.trim()]);
    setRuleInput('');
  };

  const handleRemoveRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const handleAddSamplePhoto = () => {
    const samples = [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80',
    ];
    setPhotoUrls([...photoUrls, samples[photoUrls.length % samples.length]]);
  };

  const handleSaveResource = () => {
    if (!title.trim() || !location.trim()) return;

    createResource.mutate({
      title,
      description,
      category,
      status,
      location,
      building,
      roomNumber,
      minTrustScore: Number(minTrustScore),
      securityDeposit: Number(securityDeposit),
      imageUrl: photoUrls[0],
      images: photoUrls,
      specifications: { [specKey]: specVal },
      rules: rules.map((r, idx) => ({ id: `rule-${idx}`, rule: r, isStrict: true })),
    });

    setIsModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    // Simulated delete
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Managed Resources & Equipment"
        description="Register and configure campus equipment, research laboratories, broadcast soundstages, and facilities."
        tag="Custodian Inventory"
        actions={
          <Button
            size="sm"
            onClick={handleOpenAdd}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Register Resource
          </Button>
        }
      />

      {/* Search and Category Filter Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex-1">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search your managed assets by title or location..."
          />
        </div>
        <div className="w-56">
          <Select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            options={RESOURCE_CATEGORIES}
          />
        </div>
      </div>

      {/* Resources Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-3 text-center py-8 text-slate-400">Loading resources...</div>
        ) : filteredList.length > 0 ? (
          filteredList.map((res) => (
            <Card
              key={res.id}
              hover
              className="flex flex-col justify-between overflow-hidden group border-slate-200"
            >
              <div>
                {/* Image */}
                <div className="h-44 w-full overflow-hidden bg-slate-900 relative">
                  {res.imageUrl ? (
                    <img
                      src={res.imageUrl}
                      alt={res.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500">
                      <Layers className="w-8 h-8" />
                    </div>
                  )}
                  <div className="absolute top-2.5 left-2.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-black/60 text-white backdrop-blur-sm">
                      {res.category.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="absolute top-2.5 right-2.5">
                    <StatusBadge
                      status={res.status === 'available' ? 'APPROVED' : 'PENDING'}
                      label={res.status}
                      size="sm"
                    />
                  </div>
                </div>

                <CardContent className="p-5 space-y-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {res.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                      {res.description}
                    </p>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{res.location}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-emerald-700 font-medium">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        Min Score: {res.minTrustScore}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500">
                        Deposit: ${res.securityDeposit || 0}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </div>

              {/* Action Buttons */}
              <div className="p-5 pt-0 flex items-center gap-2 border-t border-slate-100 pt-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                  leftIcon={<Edit2 className="w-3 h-3" />}
                  onClick={() => handleOpenEdit(res)}
                >
                  Edit Asset
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-rose-600 hover:text-rose-700 px-2.5"
                  onClick={() => setDeleteTarget(res)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </Card>
          ))
        ) : (
          <div className="col-span-3 text-center py-12 text-slate-400">
            No resources match your search criteria.
          </div>
        )}
      </div>

      {/* ── MODAL: ADD / EDIT RESOURCE ── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingResource ? `Edit Resource: ${editingResource.title}` : 'Register New Campus Resource'}
        description="Configure hardware specifications, location access, trust requirements, and care protocols."
        size="lg"
      >
        <div className="space-y-4 text-xs max-h-[75vh] overflow-y-auto pr-1">
          <Input
            label="Resource Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. High-Speed Sony FX3 Cinema Camera Kit"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Resource Category"
              value={category}
              onChange={(e) => setCategory(e.target.value as ResourceCategory)}
              options={RESOURCE_CATEGORIES.filter((c) => c.value !== 'all')}
            />
            <Select
              label="Operational Availability"
              value={status}
              onChange={(e) => setStatus(e.target.value as ResourceStatus)}
              options={[
                { value: 'available', label: 'Available (Active for booking)' },
                { value: 'in_use', label: 'In Use (Currently checked out)' },
                { value: 'maintenance', label: 'Maintenance (Under repair)' },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Campus Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Media Arts Center"
              required
            />
            <Input
              label="Building Complex"
              value={building}
              onChange={(e) => setBuilding(e.target.value)}
              placeholder="e.g. Creative Arts Complex"
            />
            <Input
              label="Room Number / Station"
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              placeholder="e.g. Studio 204"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Minimum Trust Score Required"
              type="number"
              min="0"
              max="100"
              value={minTrustScore}
              onChange={(e) => setMinTrustScore(e.target.value)}
              helperText="Only borrowers at or above this score can reserve directly."
            />
            <Input
              label="Institutional Security Deposit ($)"
              type="number"
              min="0"
              value={securityDeposit}
              onChange={(e) => setSecurityDeposit(e.target.value)}
              helperText="$0 for institutional waiver with verified score."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Resource Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
            />
          </div>

          {/* Photo Upload Section */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Resource Photos
            </label>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              {photoUrls.map((photo, idx) => (
                <div
                  key={idx}
                  className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200"
                >
                  <img src={photo} alt={`Asset ${idx}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setPhotoUrls(photoUrls.filter((_, i) => i !== idx))}
                    className="absolute top-1 right-1 p-1 rounded-full bg-black/70 text-white hover:bg-rose-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddSamplePhoto}
                className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 flex flex-col items-center justify-center text-slate-500 hover:text-blue-600 text-[10px] font-semibold"
              >
                <Upload className="w-4 h-4 mb-1" />
                <span>+ Photo</span>
              </button>
            </div>
          </div>

          {/* Technical Specifications */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="font-bold text-slate-900 block uppercase tracking-wider text-[11px]">
              Primary Technical Specification
            </span>
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Spec Name (e.g. Sensor)"
                value={specKey}
                onChange={(e) => setSpecKey(e.target.value)}
              />
              <Input
                placeholder="Spec Value (e.g. Full-Frame 12.1 MP)"
                value={specVal}
                onChange={(e) => setSpecVal(e.target.value)}
              />
            </div>
          </div>

          {/* Care & Return Rules */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="font-bold text-slate-900 block uppercase tracking-wider text-[11px]">
              Custodian Care Rules
            </span>
            <div className="space-y-1.5">
              {rules.map((rule, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200"
                >
                  <span className="text-slate-800">{rule}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveRule(idx)}
                    className="text-slate-400 hover:text-rose-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 pt-1">
              <Input
                placeholder="Add rule (e.g. Always clean glass before checkout)"
                value={ruleInput}
                onChange={(e) => setRuleInput(e.target.value)}
              />
              <Button variant="outline" size="sm" type="button" onClick={handleAddRule}>
                Add Rule
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveResource}
              rightIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
            >
              {editingResource ? 'Save Modifications' : 'Register Resource'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── CONFIRM DELETE DIALOG ── */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title={`De-register ${deleteTarget?.title}?`}
        message="This will remove the resource from public student discovery. Existing active reservations will not be affected."
        confirmText="De-register Resource"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
};
