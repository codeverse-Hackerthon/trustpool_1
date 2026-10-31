import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/ui/PageHeader';
import { SearchBar } from '../../components/ui/SearchBar';
import { Select } from '../../components/ui/Select';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { EmptyState } from '../../components/ui/EmptyState';
import { useResources } from '../../hooks/useResources';
import { useAuth } from '../../hooks/useAuth';
import {
  MapPin,
  ShieldCheck,
  ArrowRight,
  Filter,
  CheckCircle2,
  X,
  Layers,
  Sparkles,
  SlidersHorizontal,
  Building,
  Bot,
  Zap,
} from 'lucide-react';
import { ResourceCategory, ResourceStatus } from '../../types';
import { aiSearchService, ParsedNLQuery } from '../../services/aiService';
import { AIFeatureBadge } from '../../components/ui/AIFeatureBadge';


// Category options
const CATEGORY_OPTIONS = [
  { value: 'all', label: 'All Categories' },
  { value: 'equipment', label: 'Equipment & Cinema Kits' },
  { value: 'lab', label: 'Laboratories & Prototyping' },
  { value: 'room', label: 'Rooms & Soundstages' },
  { value: 'facility', label: 'Facilities & Collaboration' },
];

// Location filter options
const LOCATION_OPTIONS = [
  { value: 'all', label: 'All Campus Locations' },
  { value: 'Media Arts Center', label: 'Media Arts Center' },
  { value: 'Makerspace Innovation Hub', label: 'Makerspace Innovation Hub' },
  { value: 'Student Union', label: 'Student Union & East Campus' },
  { value: 'CS Technology Tower', label: 'CS Technology Tower' },
  { value: 'BioSciences Complex', label: 'BioSciences Complex' },
  { value: 'Engineering Block B', label: 'Engineering Block B' },
  { value: 'Creative Arts Complex', label: 'Creative Arts Complex' },
];

// Availability options
const AVAILABILITY_OPTIONS = [
  { value: 'all', label: 'All Availability' },
  { value: 'available', label: 'Available Now' },
  { value: 'in_use', label: 'In Use / Queueing' },
];

// Sort options
const SORT_OPTIONS = [
  { value: 'recommended', label: 'Recommended (Fairness First)' },
  { value: 'trust_asc', label: 'Min Trust Score (Low to High)' },
  { value: 'trust_desc', label: 'Min Trust Score (High to Low)' },
  { value: 'title_asc', label: 'Name (A to Z)' },
];

export const DiscoverResources: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Search and filter states
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [location, setLocation] = useState<string>('all');
  const [availability, setAvailability] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recommended');
  const [onlyEligible, setOnlyEligible] = useState<boolean>(false);
  const [showFiltersMobile, setShowFiltersMobile] = useState<boolean>(false);

  const userTrustScore = user?.trustScore ?? 92;

  // AI Natural Language Search states
  const [nlQuery, setNlQuery] = useState('');
  const [parsedNL, setParsedNL] = useState<ParsedNLQuery | null>(null);

  const handleRunNLSearch = (promptText?: string) => {
    const textToParse = promptText !== undefined ? promptText : nlQuery;
    if (!textToParse.trim()) return;

    const parsed = aiSearchService.parseNaturalLanguageQuery(textToParse);
    setParsedNL(parsed);
    setNlQuery(textToParse);

    // Apply parsed filters
    if (parsed.detectedCategory && parsed.detectedCategory !== 'all') {
      setCategory(parsed.detectedCategory);
    }
    if (parsed.detectedLocation) {
      setLocation(parsed.detectedLocation);
    }
    if (parsed.detectedKeywords.length > 0) {
      setSearch(parsed.detectedKeywords[0]);
    }
  };

  const handleClearNLSearch = () => {
    setParsedNL(null);
    setNlQuery('');
    handleResetFilters();
  };

  // Query resources with hook

  const { data: rawResources, isLoading, isError, refetch } = useResources({
    category: category as ResourceCategory | 'all',
    status: availability as ResourceStatus | 'all',
    location: location !== 'all' ? location : undefined,
    search: search.trim() || undefined,
  });

  // Client-side filtering & sorting
  const resources = useMemo(() => {
    if (!rawResources) return [];
    let list = [...rawResources];

    // Filter by eligible trust score if toggled
    if (onlyEligible) {
      list = list.filter((r) => r.minTrustScore <= userTrustScore);
    }

    // Sort
    if (sortBy === 'recommended') {
      // Sort: Available first, then by lowest minTrustScore
      list.sort((a, b) => {
        if (a.status === 'available' && b.status !== 'available') return -1;
        if (a.status !== 'available' && b.status === 'available') return 1;
        return a.minTrustScore - b.minTrustScore;
      });
    } else if (sortBy === 'trust_asc') {
      list.sort((a, b) => a.minTrustScore - b.minTrustScore);
    } else if (sortBy === 'trust_desc') {
      list.sort((a, b) => b.minTrustScore - a.minTrustScore);
    } else if (sortBy === 'title_asc') {
      list.sort((a, b) => a.title.localeCompare(b.title));
    }

    return list;
  }, [rawResources, onlyEligible, userTrustScore, sortBy]);

  const activeFiltersCount = [
    category !== 'all',
    location !== 'all',
    availability !== 'all',
    onlyEligible,
  ].filter(Boolean).length;

  const handleResetFilters = () => {
    setSearch('');
    setCategory('all');
    setLocation('all');
    setAvailability('all');
    setOnlyEligible(false);
    setSortBy('recommended');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Explore Resources"
        description="Find the spaces and equipment you need."
        tag="Campus Shared Inventory"
        actions={
          <div className="flex items-center gap-2">
            <Link to="/student/allocation">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Sparkles className="w-3.5 h-3.5 text-purple-600" />}
              >
                Fair Allocation Engine
              </Button>
            </Link>
            <Link to="/student/bookings">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Layers className="w-3.5 h-3.5 text-blue-600" />}
              >
                My Bookings
              </Button>
            </Link>
          </div>
        }
      />

      {/* Trust Status Notice Banner */}
      <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/50 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800 shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <p className="font-semibold text-emerald-950">
              Verified Student Standing • Trust Score: {userTrustScore} / 100 (Tier A)
            </p>
            <p className="text-emerald-700 mt-0.5">
              You are eligible for direct allocation on 100% of campus resources with zero security deposit required.
            </p>
          </div>
        </div>
        <button
          onClick={() => setOnlyEligible(!onlyEligible)}
          className={`shrink-0 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
            onlyEligible
              ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
              : 'bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-100/50'
          }`}
        >
          {onlyEligible ? '✓ Showing Only Eligible' : 'Filter by My Eligibility'}
        </button>
      </div>

      {/* AI Natural Language Resource Search Interface */}
      <div className="rounded-2xl border border-purple-200/90 bg-gradient-to-r from-purple-50/70 via-indigo-50/50 to-blue-50/60 p-4 sm:p-5 space-y-3.5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-100 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-purple-600 text-white shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <span>Natural Language Resource Search</span>
                <AIFeatureBadge label="AI Assistant (Simulated Preview)" variant="purple" size="sm" />
              </h3>
              <p className="text-[11px] text-slate-500">
                Describe what you need in natural English. Backend LLM vector search will infer intent, category, and campus proximity.
              </p>
            </div>
          </div>
          <span className="text-[10px] text-purple-700 bg-purple-100/70 px-2 py-0.5 rounded font-mono font-medium self-start sm:self-auto">
            NLP Intent Engine
          </span>
        </div>

        {/* Search Input with Execute Button */}
        <div className="flex flex-col sm:flex-row items-stretch gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={nlQuery}
              onChange={(e) => setNlQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRunNLSearch()}
              placeholder="e.g. Find a projector near my college for tomorrow."
              className="w-full text-xs rounded-xl border border-purple-200 bg-white px-3.5 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-2xs"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              variant="primary"
              size="sm"
              className="bg-purple-600 hover:bg-purple-700 border-purple-700 text-xs font-semibold shrink-0"
              onClick={() => handleRunNLSearch()}
              leftIcon={<Sparkles className="w-3.5 h-3.5" />}
            >
              Parse Intent & Search
            </Button>
            {parsedNL && (
              <Button
                variant="outline"
                size="sm"
                className="text-xs shrink-0"
                onClick={handleClearNLSearch}
              >
                Reset
              </Button>
            )}
          </div>
        </div>

        {/* Quick Query Example Chips */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
          <span className="text-slate-400 font-medium text-[10px] uppercase tracking-wider">
            Quick Prompts:
          </span>
          {[
            'Find a projector near my college for tomorrow.',
            'High-Speed Sony FX3 Cinema Camera Kit for weekend',
            'Precision 3D printer for drone prototyping in makerspace',
            'Acoustic soundstage for recording podcast episode',
          ].map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => handleRunNLSearch(prompt)}
              className="px-2.5 py-1 rounded-lg border border-purple-200/80 bg-white/80 hover:bg-white text-purple-900 hover:border-purple-400 transition-all font-medium text-[11px] shadow-2xs text-left"
            >
              💡 "{prompt}"
            </button>
          ))}
        </div>

        {/* Parsed AI Interpretation Panel */}
        {parsedNL && (
          <div className="p-3.5 rounded-xl border border-purple-200 bg-white/90 space-y-2.5 animate-fadeIn text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                <Zap className="w-3.5 h-3.5 text-purple-600" />
                Parsed Semantic Intent Extraction
              </span>
              <span className="font-mono text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-bold">
                {parsedNL.confidenceScore}% Confidence Match
              </span>
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed">
              {parsedNL.aiExplanation}
            </p>

            <div className="flex flex-wrap gap-2 text-[10px] pt-1">
              <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-semibold border border-purple-200">
                Category: {parsedNL.detectedCategory?.toUpperCase()}
              </span>
              {parsedNL.detectedLocation && (
                <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold border border-blue-200">
                  Location: {parsedNL.detectedLocation}
                </span>
              )}
              {parsedNL.detectedTimeframe && (
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
                  Timeframe: {parsedNL.detectedTimeframe}
                </span>
              )}
              {parsedNL.detectedKeywords.map((kw) => (
                <span key={kw} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                  #{kw}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Search & Control Row */}
      <div className="space-y-3">

        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="flex-1">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search equipment, laboratories, spaces or facilities..."
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-48 sm:w-56">
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                options={SORT_OPTIONS}
              />
            </div>
            <Button
              variant="outline"
              size="md"
              className="md:hidden"
              onClick={() => setShowFiltersMobile(!showFiltersMobile)}
              leftIcon={<SlidersHorizontal className="w-4 h-4" />}
            >
              Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
            </Button>
          </div>
        </div>

        {/* Desktop & Collapsible Filter Row */}
        <div
          className={`grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 ${
            showFiltersMobile ? 'block' : 'hidden md:grid'
          }`}
        >
          <div>
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={CATEGORY_OPTIONS}
            />
          </div>
          <div>
            <Select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              options={LOCATION_OPTIONS}
            />
          </div>
          <div>
            <Select
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              options={AVAILABILITY_OPTIONS}
            />
          </div>
        </div>

        {/* Active Filter Chips & Counter */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-slate-500">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-slate-700">
              {resources.length} {resources.length === 1 ? 'resource' : 'resources'} found
            </span>
            {activeFiltersCount > 0 && (
              <>
                <span className="text-slate-300">•</span>
                <span className="text-slate-500">Active filters:</span>
                {category !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-medium">
                    {category}
                    <button onClick={() => setCategory('all')}>
                      <X className="w-3 h-3 text-slate-400 hover:text-slate-600" />
                    </button>
                  </span>
                )}
                {location !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-medium">
                    {location}
                    <button onClick={() => setLocation('all')}>
                      <X className="w-3 h-3 text-slate-400 hover:text-slate-600" />
                    </button>
                  </span>
                )}
                {availability !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-medium">
                    {availability === 'available' ? 'Available Now' : 'In Use'}
                    <button onClick={() => setAvailability('all')}>
                      <X className="w-3 h-3 text-slate-400 hover:text-slate-600" />
                    </button>
                  </span>
                )}
                {onlyEligible && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-medium">
                    Score ≤ {userTrustScore}
                    <button onClick={() => setOnlyEligible(false)}>
                      <X className="w-3 h-3 text-emerald-600 hover:text-emerald-800" />
                    </button>
                  </span>
                )}
                <button
                  onClick={handleResetFilters}
                  className="text-blue-600 hover:text-blue-800 font-medium ml-1 underline"
                >
                  Clear all
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden animate-pulse">
              <div className="h-48 bg-slate-200" />
              <CardContent className="p-5 space-y-3">
                <div className="h-4 bg-slate-200 rounded w-1/3" />
                <div className="h-6 bg-slate-200 rounded w-3/4" />
                <div className="h-12 bg-slate-100 rounded" />
                <div className="h-8 bg-slate-200 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Error State */}
      {isError && (
        <Card className="p-8 text-center space-y-4 border-rose-200 bg-rose-50/30">
          <p className="text-sm text-rose-800 font-semibold">
            Unable to load campus shared resources right now.
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry Connection
          </Button>
        </Card>
      )}

      {/* Resources Cards Grid */}
      {!isLoading && !isError && resources.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((res) => {
            const isEligible = userTrustScore >= res.minTrustScore;
            const isAvailable = res.status === 'available';

            return (
              <Card
                key={res.id}
                hover
                className="flex flex-col justify-between overflow-hidden group border-slate-200/90 hover:border-slate-300"
              >
                <div>
                  {/* Image Container with Badges */}
                  <div className="h-48 w-full overflow-hidden bg-slate-100 relative">
                    {res.imageUrl ? (
                      <img
                        src={res.imageUrl}
                        alt={res.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <Layers className="w-12 h-12" />
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none" />

                    {/* Top status badges */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white/90 backdrop-blur-sm text-slate-800 shadow-sm">
                        {res.category.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3">
                      <StatusBadge
                        status={isAvailable ? 'APPROVED' : 'PENDING'}
                        label={isAvailable ? 'Available Now' : 'In Use / Queue'}
                        size="sm"
                      />
                    </div>

                    {/* Bottom overlay: Location */}
                    <div className="absolute bottom-2.5 left-3 right-3 text-white text-[11px] font-medium flex items-center gap-1 drop-shadow-sm truncate">
                      <MapPin className="w-3.5 h-3.5 text-white/90 shrink-0" />
                      <span className="truncate">{res.location}</span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <CardContent className="p-5 space-y-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 leading-snug">
                        {res.title}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                        {res.description}
                      </p>
                    </div>

                    {/* Specifications teaser */}
                    {res.specifications && (
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                        {Object.entries(res.specifications)
                          .slice(0, 2)
                          .map(([k, v]) => (
                            <div
                              key={k}
                              className="flex items-center justify-between text-[11px]"
                            >
                              <span className="text-slate-400 font-medium truncate max-w-[120px]">
                                {k}
                              </span>
                              <span className="font-semibold text-slate-700 truncate max-w-[150px]">
                                {String(v)}
                              </span>
                            </div>
                          ))}
                      </div>
                    )}

                    {/* Custodian Verification & Trust Requirement */}
                    <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                      {/* Custodian */}
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span className="flex items-center gap-1 truncate">
                          <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{res.ownerName}</span>
                        </span>
                        {res.ownerVerified && (
                          <span className="inline-flex items-center gap-0.5 text-emerald-700 font-semibold text-[10px]">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Verified Custodian
                          </span>
                        )}
                      </div>

                      {/* Trust Eligibility Comparison */}
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-1.5">
                          <ShieldCheck
                            className={`w-4 h-4 ${
                              isEligible ? 'text-emerald-600' : 'text-amber-500'
                            }`}
                          />
                          <span className="text-slate-600 font-medium text-[11px]">
                            Min Score: <strong>{res.minTrustScore}</strong>
                          </span>
                        </div>
                        {isEligible ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                            You're Eligible ✓
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                            Requires {res.minTrustScore}+
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </div>

                {/* Card Action Footer */}
                <div className="p-5 pt-0">
                  <Button
                    variant={isAvailable ? 'primary' : 'outline'}
                    size="sm"
                    className="w-full text-xs font-semibold"
                    rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                    onClick={() => navigate(`/student/resources/${res.id}`)}
                  >
                    {isAvailable ? 'View Details & Book' : 'View Schedule & Join Waitlist'}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* No Results Empty State */}
      {!isLoading && !isError && resources.length === 0 && (
        <EmptyState
          title="No resources match your search"
          description="Try broadening your search keywords, clearing specific category or location filters, or resetting."
          actionLabel="Reset All Filters"
          onAction={handleResetFilters}
          icon={<Filter className="w-6 h-6 text-slate-400" />}
        />
      )}
    </div>
  );
};
