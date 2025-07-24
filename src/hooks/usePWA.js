import { useEffect, useState } from 'react';
import { Workbox } from 'workbox-window';
export const usePWA = () => {
    const [state, setState] = useState({
        isInstallable: false,
        isOffline: !navigator.onLine,
        hasUpdate: false,
        needRefresh: false
    });
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [workbox, setWorkbox] = useState(null);
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
        const handleBeforeInstallPrompt = (e) => {
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
    const install = async () => {
        if (!deferredPrompt)
            return;
        try {
            deferredPrompt.prompt();
            const choiceResult = await deferredPrompt.userChoice;
            if (choiceResult.outcome === 'accepted') {
                setState(prev => ({ ...prev, isInstallable: false }));
            }
            setDeferredPrompt(null);
        }
        catch (error) {
            console.error('PWA installation failed:', error);
        }
    };
    const updateServiceWorker = async () => {
        if (!workbox)
            return;
        try {
            // Skip waiting and claim clients
            workbox.messageSkipWaiting();
            setState(prev => ({ ...prev, hasUpdate: false, needRefresh: false }));
        }
        catch (error) {
            console.error('Service worker update failed:', error);
        }
    };
    return {
        ...state,
        install,
        updateServiceWorker
    };
};
