import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';

export function useOwnerAuth() {
  const { actor, isFetching: actorFetching } = useActor();

  const { data: isAdmin, isLoading, error } = useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    isAdmin: isAdmin ?? false,
    isLoading: actorFetching || isLoading,
    error,
  };
}
