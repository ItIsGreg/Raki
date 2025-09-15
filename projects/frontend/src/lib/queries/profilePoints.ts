import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProfilePoints, postProfilePoint, deleteProfilePointApi } from '@/lib/api';

const keyProfilePoints = (storageId: string) => ['profilePoints', storageId];

export function useProfilePoints(storageId: string | undefined, profileId?: string) {
  return useQuery({
    queryKey: storageId ? keyProfilePoints(storageId) : ['profilePoints', 'noop'],
    queryFn: () => getProfilePoints(storageId as string),
    enabled: !!storageId && !!profileId, // do not fetch / render when no profile selected
    select: (pts: any[]) => (profileId ? pts.filter(p => p.profileId === profileId) : []),
    staleTime: 10000,
    refetchOnWindowFocus: false,
  });
}

export function useCreateProfilePoint(storageId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: any) => postProfilePoint(storageId as string, body),
    onSuccess: (_data, _vars) => {
      if (storageId) qc.invalidateQueries({ queryKey: keyProfilePoints(storageId) });
    },
  });
}

export function useDeleteProfilePoint(storageId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteProfilePointApi(storageId as string, id),
    onSuccess: (_data, _vars) => {
      if (storageId) qc.invalidateQueries({ queryKey: keyProfilePoints(storageId) });
    },
  });
}

