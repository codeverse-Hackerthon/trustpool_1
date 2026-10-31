import { api } from './apiClient';
import {
  Resource,
  ResourceFilterParams,
  ApiResponse,
  PaginatedResponse,
} from '../types';
import { mockResources } from '../data/mockResources';

export const resourceService = {
  /**
   * Fetch all discoverable resources with filter support
   */
  getResources: async (params?: ResourceFilterParams): Promise<Resource[]> => {
    try {
      const response = await api.get<PaginatedResponse<Resource> | ApiResponse<Resource[]>>(
        '/resources',
        { params }
      );
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return mockResources;
    } catch {
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
      const response = await api.get<ApiResponse<Resource>>(`/resources/${id}`);
      return response.data;
    } catch {
      const found = mockResources.find((r) => r.id === id);
      if (found) return found;
      return mockResources[0];
    }
  },

  /**
   * Fetch resources owned by specific owner
   */
  getOwnerResources: async (ownerId?: string): Promise<Resource[]> => {
    try {
      const response = await api.get<ApiResponse<Resource[]>>('/owner/resources', {
        params: { ownerId },
      });
      return response.data;
    } catch {
      return mockResources;
    }
  },

  /**
   * Create a new resource
   */
  createResource: async (data: Partial<Resource>): Promise<Resource> => {
    try {
      const response = await api.post<ApiResponse<Resource>>('/resources', data);
      return response.data;
    } catch {
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
      const response = await api.put<ApiResponse<Resource>>(`/resources/${id}`, data);
      return response.data;
    } catch {
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
