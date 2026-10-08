import { useState, useEffect, useCallback } from 'react';

export function useBackNavigation(currentTab: string, onNavigateToHome: () => void) {
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [isAtHome, setIsAtHome] = useState(true);

  useEffect(() => { setIsAtHome(currentTab === 'dashboard'); }, [currentTab]);

  const handleBackNavigation = useCallback(() => {
    if (isAtHome) setShowExitConfirm(true);
    else onNavigateToHome();
  }, [isAtHome, onNavigateToHome]);

  const handleConfirmExit = useCallback(() => {
    setShowExitConfirm(false);
    if (window.history.length > 1) window.history.back();
    else window.close();
  }, []);

  const handleCancelExit = useCallback(() => { setShowExitConfirm(false); }, []);

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      event.preventDefault();
      handleBackNavigation();
      window.history.pushState({ page: 'home' }, '', window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    window.history.pushState({ page: 'home' }, '', window.location.pathname);
    return () => { window.removeEventListener('popstate', handlePopState); };
  }, [handleBackNavigation]);

  return { showExitConfirm, handleConfirmExit, handleCancelExit, isAtHome };
}
