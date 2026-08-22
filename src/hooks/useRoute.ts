import { useEffect, useState, useCallback } from 'react';

export type Route =
  | { name: 'landing' }
  | { name: 'login' }
  | { name: 'signup' }
  | { name: 'onboarding' }
  | { name: 'dashboard' }
  | { name: 'discover' }
  | { name: 'quick-match' }
  | { name: 'games' }
  | { name: 'teams' }
  | { name: 'venues' }
  | { name: 'tournaments' }
  | { name: 'notifications' }
  | { name: 'profile' }
  | { name: 'messages' }
  | { name: 'messages-with'; userId: string };

function parseHash(): Route {
  const hash = window.location.hash.replace(/^#\/?/, '');
  const parts = hash.split('/');

  switch (parts[0]) {
    case 'login':
      return { name: 'login' };
    case 'signup':
      return { name: 'signup' };
    case 'onboarding':
      return { name: 'onboarding' };
    case 'dashboard':
      return { name: 'dashboard' };
    case 'discover':
      return { name: 'discover' };
    case 'quick-match':
      return { name: 'quick-match' };
    case 'games':
      return { name: 'games' };
    case 'teams':
      return { name: 'teams' };
    case 'venues':
      return { name: 'venues' };
    case 'tournaments':
      return { name: 'tournaments' };
    case 'notifications':
      return { name: 'notifications' };
    case 'profile':
      return { name: 'profile' };
    case 'messages':
      if (parts[1]) return { name: 'messages-with', userId: parts[1] };
      return { name: 'messages' };
    default:
      return { name: 'landing' };
  }
}

export function navigate(route: string) {
  window.location.hash = route;
}

export function useRoute() {
  const [route, setRoute] = useState<Route>(parseHash());

  useEffect(() => {
    const onHashChange = () => setRoute(parseHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  return route;
}

export function useNavigate() {
  return useCallback((route: string) => {
    window.location.hash = route;
  }, []);
}
