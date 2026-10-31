import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { resourceService } from '../services/resourceService';
import { Resource, ResourceFilterParams } from '../types';

export const RESOURCE_KEYS = {
  all: ['resources'] as const,
  list: (params?: ResourceFilterParams) => ['resources', 'list', params] as const,
  details: (id: string) => ['resources', 'detail', id] as const,
  owner: (ownerId?: string) => ['resources', 'owner', ownerId] as const,
};

export function useResources(params?: ResourceFilterParams) {
  return useQuery({
    queryKey: RESOURCE_KEYS.list(params),
    queryFn: () => resourceService.getResources(params),
  });
}

export function useResource(id: string) {
  return useQuery({
    queryKey: RESOURCE_KEYS.details(id),
    queryFn: () => resourceService.getResourceById(id),
    enabled: !!id,
  });
}

export function useOwnerResources(ownerId?: string) {
  return useQuery({
    queryKey: RESOURCE_KEYS.owner(ownerId),
    queryFn: () => resourceService.getOwnerResources(ownerId),
  });
}

export function useCreateResource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Resource>) => resourceService.createResource(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RESOURCE_KEYS.all });
    },
  });
}

