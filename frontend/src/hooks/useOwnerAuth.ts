import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';

export function useOwnerAuth() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity, isInitializing } = useInternetIdentity();

  const { data: isAdmin, isLoading, error } = useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      if (!identity) return false;
      if (identity.getPrincipal().isAnonymous()) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !actorFetching && !!identity && !isInitializing,
    retry: false,
  });

  return {
    isAdmin: isAdmin ?? false,
    isLoading: actorFetching || isLoading || isInitializing,
    error,
  };
}
