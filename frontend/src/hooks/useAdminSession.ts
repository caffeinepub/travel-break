import { useState, useCallback } from 'react';
import { useActor } from './useActor';

const SESSION_KEY = 'adminAuthenticated';

export function useAdminSession() {
  const { actor } = useActor();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem(SESSION_KEY) === 'true';
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(
    async (username: string, password: string): Promise<boolean> => {
      if (!actor) {
        setError('Service not available. Please try again.');
        return false;
      }
      setIsLoading(true);
      setError(null);
      try {
        const success = await actor.verifyAdminCredentials(username, password);
        if (success) {
          sessionStorage.setItem(SESSION_KEY, 'true');
          setIsAuthenticated(true);
          return true;
        } else {
          setError('Invalid username or password. Please try again.');
          return false;
        }
      } catch (err) {
        setError('An error occurred. Please try again.');
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [actor]
  );

  const logout = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY);
    setIsAuthenticated(false);
    setError(null);
  }, []);

  return { isAuthenticated, isLoading, error, login, logout };
}
