import { useEffect, useState } from 'react';
import { Workbox } from 'workbox-window';

interface PWAState {
  isInstallable: boolean;
  isOffline: boolean;
  hasUpdate: boolean;
  needRefresh: boolean;
}

interface PWAActions {
  install: () => Promise<void>;
  updateServiceWorker: () => Promise<void>;
}

export const usePWA = (): PWAState & PWAActions => {
  const [state, setState] = useState<PWAState>({
    isInstallable: false,
    isOffline: !navigator.onLine,
    hasUpdate: false,
    needRefresh: false
  });

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [workbox, setWorkbox] = useState<Workbox | null>(null);

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator && import.meta.env.PROD) {
      const wb = new Workbox('/sw.js');
      
      wb.addEventListener('waiting', () => {
        setState(prev => ({ ...prev, hasUpdate: true, needRefresh: true }));
      });

      wb.addEventListener('controlling', () => {
        window.location.reload();
      });

      wb.register();
      setWorkbox(wb);
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setState(prev => ({ ...prev, isInstallable: true }));
    };

    // Listen for online/offline status
    const handleOnline = () => setState(prev => ({ ...prev, isOffline: false }));
    const handleOffline = () => setState(prev => ({ ...prev, isOffline: true }));

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const install = async (): Promise<void> => {
    if (!deferredPrompt) return;

    try {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        setState(prev => ({ ...prev, isInstallable: false }));
      }
      
      setDeferredPrompt(null);
    } catch (error) {
      console.error('PWA installation failed:', error);
    }
  };

  const updateServiceWorker = async (): Promise<void> => {
    if (!workbox) return;

    try {
      // Skip waiting and claim clients
      workbox.messageSkipWaiting();
      setState(prev => ({ ...prev, hasUpdate: false, needRefresh: false }));
    } catch (error) {
      console.error('Service worker update failed:', error);
    }
  };

  return {
    ...state,
    install,
    updateServiceWorker
  };
};
