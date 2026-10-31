import { api } from './apiClient';
import {
  Resource,
  ResourceCategory,
  ResourceStatus,
  ResourceFilterParams,
} from '../types';
import { mockResources } from '../data/mockResources';
import { mocksEnabled } from './config';

const normalizeResource = (r: any): Resource => {
  const images = (r.images || []).map((img: any) => (typeof img === 'string' ? img : img.url));
  const coverImage = r.imageUrl || (images.length > 0 ? images[0] : 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80');

  let cat: ResourceCategory = 'equipment';
  const rawCat = (r.category || '').toLowerCase();
  if (rawCat.includes('room') || rawCat.includes('studio') || rawCat.includes('space')) cat = 'room';
  else if (rawCat.includes('lab') || rawCat.includes('proto')) cat = 'lab';
  else if (rawCat.includes('facility') || rawCat.includes('hall')) cat = 'facility';
  else if (rawCat.includes('event')) cat = 'event_space';

  let status: ResourceStatus = 'available';
  const rawStatus = (r.status || r.status_raw || '').toUpperCase();
  if (rawStatus === 'UNDER_MAINTENANCE' || rawStatus === 'MAINTENANCE') status = 'maintenance';
  else if (rawStatus === 'INACTIVE' || rawStatus === 'RESERVED') status = 'reserved';
  else if (rawStatus === 'IN_USE') status = 'in_use';

  return {
    id: String(r.id),
    title: r.title || r.name || 'Shared Resource',
    description: r.description || '',
    category: cat,
    status,
    location: r.location || 'Campus Center',
    building: r.building || r.location?.split(',')[0] || 'Main Campus',
    capacity: r.capacity || 1,
    ownerId: String(r.owner_id || r.ownerId || 'owner'),
    ownerName: r.ownerName || 'Dr. Sarah Chen',
    ownerEmail: r.ownerEmail || 'sarah.chen@university.edu',
    imageUrl: coverImage,
    images: images.length ? images : [coverImage],
    minTrustScore: r.minTrustScore ?? (r.requires_training ? 75 : 70),
    isFree: r.isFree ?? (r.deposit_amount === 0 || !r.deposit_amount),
    securityDeposit: r.deposit_amount ?? 0,
    tags: r.tags || [cat.toUpperCase(), 'Verified'],
    specifications: r.specifications || {},
    createdAt: r.created_at || r.createdAt || new Date().toISOString(),
    updatedAt: r.updated_at || r.updatedAt || new Date().toISOString(),
    qrCodeData: `TRUSTPOOL:RES:${r.id}`,
  };
};

export const resourceService = {
  /**
   * Fetch all discoverable resources with filter support
   */
  getResources: async (params?: ResourceFilterParams): Promise<Resource[]> => {
    try {
      const response = await api.get<any>('/resources', { params });
      const rawList =
        response?.data?.items ||
        (Array.isArray(response?.data) ? response.data : null) ||
        (Array.isArray(response?.items) ? response.items : null) ||
        (Array.isArray(response) ? response : null);

      if (Array.isArray(rawList) && rawList.length > 0) {
        return rawList.map(normalizeResource);
      }
      return mockResources;
    } catch (error) {
      if (!mocksEnabled) throw error;
      let filtered = [...mockResources];
      if (params?.category && params.category !== 'all') {
        filtered = filtered.filter((r) => r.category === params.category);
      }
      if (params?.status && params.status !== 'all') {
        filtered = filtered.filter((r) => r.status === params.status);
      }
      if (params?.location && params.location !== 'all') {
        const loc = params.location.toLowerCase();
        filtered = filtered.filter(
          (r) =>
            r.location.toLowerCase().includes(loc) ||
            (r.building && r.building.toLowerCase().includes(loc))
        );
      }
      if (params?.minTrustScore) {
        filtered = filtered.filter((r) => r.minTrustScore <= params.minTrustScore!);
      }
      if (params?.search) {
        const query = params.search.toLowerCase();
        filtered = filtered.filter(
          (r) =>
            r.title.toLowerCase().includes(query) ||
            r.description.toLowerCase().includes(query) ||
            r.location.toLowerCase().includes(query) ||
            r.tags.some((t) => t.toLowerCase().includes(query))
        );
      }
      return filtered;
    }
  },

  /**
   * Fetch single resource by ID
   */
  getResourceById: async (id: string): Promise<Resource> => {
    try {
      const response = await api.get<any>(`/resources/${id}`);
      const data = response?.data || response;
      if (data && data.id) {
        return normalizeResource(data);
      }
      const found = mockResources.find((r) => r.id === id);
      return found || mockResources[0];
    } catch (error) {
      if (!mocksEnabled) throw error;
      const found = mockResources.find((r) => r.id === id);
      if (found) return found;
      return mockResources[0];
    }
  },

  /**
   * Fetch resources owned by specific owner
   */
  getOwnerResources: async (_ownerId?: string): Promise<Resource[]> => {
    try {
      const response = await api.get<any>('/resources/owner/me');
      const rawList = response?.data || response;
      if (Array.isArray(rawList) && rawList.length > 0) {
        return rawList.map(normalizeResource);
      }
      return mockResources;
    } catch (error) {
      if (!mocksEnabled) throw error;
      return mockResources;
    }
  },

  /**
   * Create a new resource
   */
  createResource: async (data: Partial<Resource>): Promise<Resource> => {
    try {
      const response = await api.post<any>('/resources', {
        name: data.title || (data as any).name || 'New Institutional Resource',
        description: data.description || '',
        category: (data.category || 'equipment').toUpperCase(),
        resource_type: data.category === 'room' ? 'SPACE' : 'EQUIPMENT',
        location: data.location || 'Campus Center',
        capacity: data.capacity || 1,
        deposit_amount: data.securityDeposit || 0,
        requires_approval: true,
        requires_training: false,
        is_public: true,
        images: (data.images || [data.imageUrl]).filter(Boolean).map((url, idx) => ({
          url,
          position: idx,
          is_cover: idx === 0,
        })),
        availability_windows: [
          { weekday: 0, opens_at: '08:00:00', closes_at: '20:00:00', timezone: 'UTC' },
          { weekday: 1, opens_at: '08:00:00', closes_at: '20:00:00', timezone: 'UTC' },
          { weekday: 2, opens_at: '08:00:00', closes_at: '20:00:00', timezone: 'UTC' },
          { weekday: 3, opens_at: '08:00:00', closes_at: '20:00:00', timezone: 'UTC' },
          { weekday: 4, opens_at: '08:00:00', closes_at: '20:00:00', timezone: 'UTC' },
        ],
      });
      const res = response?.data || response;
      return normalizeResource(res);
    } catch (error) {
      if (!mocksEnabled) throw error;
      const newRes: Resource = {
        id: `res-${Date.now()}`,
        title: data.title || 'New Resource',
        description: data.description || '',
        category: data.category || 'equipment',
        status: 'available',
        location: data.location || 'Campus Center',
        ownerId: data.ownerId || 'user-own-1',
        ownerName: data.ownerName || 'Dr. Sarah Chen',
        minTrustScore: data.minTrustScore || 70,
        isFree: true,
        tags: data.tags || ['Shared'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        qrCodeData: `TRUSTPOOL:RES:res-${Date.now()}`,
      };
      return newRes;
    }
  },

  /**
   * Update existing resource
   */
  updateResource: async (id: string, data: Partial<Resource>): Promise<Resource> => {
    try {
      const response = await api.put<any>(`/resources/${id}`, data);
      return normalizeResource(response?.data || response);
    } catch (error) {
      if (!mocksEnabled) throw error;
      const found = mockResources.find((r) => r.id === id) || mockResources[0];
      return { ...found, ...data, updatedAt: new Date().toISOString() };
    }
  },

  /**
   * Delete resource
   */
  deleteResource: async (id: string): Promise<void> => {
    await api.delete(`/resources/${id}`).catch(() => {});
  },
};
