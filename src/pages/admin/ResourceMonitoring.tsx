import React, { useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { SearchBar } from '../../components/ui/SearchBar';
import { Select } from '../../components/ui/Select';
import { useResources } from '../../hooks/useResources';
import {
  Layers,
  Wrench,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Building,
} from 'lucide-react';
import { RESOURCE_CATEGORIES } from '../../utils/constants';
import { Resource } from '../../types';

export const ResourceMonitoring: React.FC = () => {
  const { data: resources, isLoading } = useResources();

  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterState, setFilterState] = useState<string>('all');
  const [maintenanceOverrideIds, setMaintenanceOverrideIds] = useState<string[]>([]);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const filteredResources = (resources || []).filter((r) => {
    const isOverridden = maintenanceOverrideIds.includes(r.id);
    const effectiveStatus = isOverridden ? 'maintenance' : r.status;

    const matchesCat = filterCategory === 'all' || r.category === filterCategory;
    const matchesState = filterState === 'all' || effectiveStatus === filterState;
    const matchesSearch =
      !search ||
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.location.toLowerCase().includes(search.toLowerCase()) ||
      r.ownerName.toLowerCase().includes(search.toLowerCase());

    return matchesCat && matchesState && matchesSearch;
  });

  const handleToggleMaintenance = (res: Resource) => {
    const isCurrentlyMaint =
      maintenanceOverrideIds.includes(res.id) || res.status === 'maintenance';

    if (isCurrentlyMaint) {
      setMaintenanceOverrideIds(maintenanceOverrideIds.filter((id) => id !== res.id));
      setActionNotice(`Restored ${res.title} to available operational status.`);
    } else {
      setMaintenanceOverrideIds([...maintenanceOverrideIds, res.id]);
      setActionNotice(
        `Emergency maintenance hold placed on ${res.title}. Reservation slots temporarily suspended.`
      );
    }
    setTimeout(() => setActionNotice(null), 4000);
  };

  const totalCount = resources?.length || 8;
  const inUseCount = resources?.filter((r) => r.status === 'in_use').length || 2;
  const maintenanceCount =
    (resources?.filter((r) => r.status === 'maintenance').length || 0) +
    maintenanceOverrideIds.length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Campus Resource Monitoring"
        description="Cross-departmental asset monitoring, custody status, and operational maintenance controls."
        tag="Campus Operations"
      />

      {/* Action Notice */}
      {actionNotice && (
        <div className="p-4 rounded-xl border border-blue-200 bg-blue-50 text-blue-900 flex items-center justify-between text-xs animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="font-semibold">{actionNotice}</span>
          </div>
          <button
            onClick={() => setActionNotice(null)}
            className="text-blue-700 font-bold ml-2 hover:text-blue-950"
          >
            ✕
          </button>
        </div>
      )}

      {/* Quick Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-emerald-200/80 bg-emerald-50/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Operational Assets
              </p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                {totalCount - maintenanceCount}
              </h3>
              <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
                Ready for student reservation
              </p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200/80 bg-blue-50/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Currently In Use
              </p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{inUseCount}</h3>
              <p className="text-[11px] text-blue-700 font-medium mt-0.5">
                Active circulation across campus
              </p>
            </div>
            <div className="p-3 rounded-xl bg-blue-100 text-blue-700">
              <Clock className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-200/80 bg-amber-50/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
                Maintenance Holds
              </p>
              <h3 className="text-2xl font-bold text-amber-950 mt-1">{maintenanceCount}</h3>
              <p className="text-[11px] text-amber-700 font-medium mt-0.5">
                Hardware inspection in progress
              </p>
            </div>
            <div className="p-3 rounded-xl bg-amber-100 text-amber-700">
              <Wrench className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex-1">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search by asset title, custodian, or location..."
          />
        </div>
        <div className="w-48">
          <Select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            options={RESOURCE_CATEGORIES}
          />
        </div>
        <div className="w-48">
          <Select
            value={filterState}
            onChange={(e) => setFilterState(e.target.value)}
            options={[
              { value: 'all', label: 'All Operational States' },
              { value: 'available', label: 'Available' },
              { value: 'in_use', label: 'In Use' },
              { value: 'maintenance', label: 'Maintenance' },
            ]}
          />
        </div>
      </div>

      {/* Master Asset Registry Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Master Asset Registry</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Centralized oversight across Creative Arts, Engineering, Computer Science, and BioSciences
              </p>
            </div>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded">
              {filteredResources.length} Assets Registered
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset Title / ID</TableHead>
                <TableHead>Department / Custodian</TableHead>
                <TableHead>Location Access</TableHead>
                <TableHead>Min Trust Score</TableHead>
                <TableHead>Operational State</TableHead>
                <TableHead className="text-right">Administrative Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-400">
                    Loading resources...
                  </TableCell>
                </TableRow>
              ) : filteredResources.length > 0 ? (
                filteredResources.map((res) => {
                  const isMaint =
                    maintenanceOverrideIds.includes(res.id) || res.status === 'maintenance';

                  return (
                    <TableRow key={res.id}>
                      <TableCell className="font-semibold text-slate-900 text-xs">
                        <div className="font-bold">{res.title}</div>
                        <span className="font-mono text-[10px] text-slate-400 block">
                          {res.id} • {res.category.toUpperCase()}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-slate-700">
                        <div className="flex items-center gap-1 font-medium">
                          <Building className="w-3.5 h-3.5 text-slate-400" />
                          <span>{res.ownerName}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 block">
                          {res.ownerDepartment || 'Campus Facility'}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-slate-600">
                        <div>{res.location}</div>
                        <span className="text-[10px] text-slate-400">
                          {res.building || 'Main Campus'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono font-bold text-xs text-emerald-700">
                          {res.minTrustScore} / 100
                        </span>
                      </TableCell>
                      <TableCell>
                        {isMaint ? (
                          <StatusBadge status="PENDING" label="Maintenance Hold" size="sm" />
                        ) : (
                          <StatusBadge
                            status={res.status === 'available' ? 'APPROVED' : 'ACTIVE'}
                            label={res.status === 'available' ? 'Available' : 'In Use'}
                            size="sm"
                          />
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant={isMaint ? 'outline' : 'ghost'}
                          size="sm"
                          className={`text-xs ${
                            isMaint
                              ? 'text-emerald-700 border-emerald-300 hover:bg-emerald-50'
                              : 'text-amber-700 hover:bg-amber-50'
                          }`}
                          leftIcon={<Wrench className="w-3.5 h-3.5" />}
                          onClick={() => handleToggleMaintenance(res)}
                        >
                          {isMaint ? 'End Maintenance' : 'Flag Maintenance'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-400 text-xs">
                    No resources match your search or filter.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
