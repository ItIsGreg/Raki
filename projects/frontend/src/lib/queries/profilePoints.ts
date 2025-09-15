import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProfilePoints, postProfilePoint } from '@/lib/api';

const keyProfilePoints = (storageId: string) => ['profilePoints', storageId];

export function useProfilePoints(storageId: string | undefined, profileId?: string) {
  return useQuery({
    queryKey: storageId ? keyProfilePoints(storageId) : ['profilePoints', 'noop'],
    queryFn: () => getProfilePoints(storageId as string),
    enabled: !!storageId,
    select: (pts: any[]) => (profileId ? pts.filter(p => p.profileId === profileId) : pts),
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

