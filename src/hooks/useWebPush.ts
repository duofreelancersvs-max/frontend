import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/** Detect Brave browser (exposes navigator.brave) */
function isBraveBrowser(): boolean {
  return !!(navigator as any).brave;
}

function getPushBlockedMessage(): string {
  if (isBraveBrowser()) {
    return (
      'Brave blocks push notifications by default. To enable them: ' +
      'go to brave://settings/privacy and turn on "Use Google services for push messaging", ' +
      'then reload this page and try again.'
    );
  }
  return (
    'Could not activate browser push (your browser may block this). ' +
    'You will still receive in-app notifications.'
  );
}

/**
 * Get the service worker registration with a timeout.
 * navigator.serviceWorker.ready hangs forever if no SW is registered,
 * so we race it against a timeout.
 */
async function getSwRegistration(timeoutMs = 3000): Promise<ServiceWorkerRegistration | null> {
  try {
    const result = await Promise.race([
      navigator.serviceWorker.ready,
      new Promise<null>((resolve) => setTimeout(() => resolve(null), timeoutMs)),
    ]);
    return result;
  } catch {
    return null;
  }
}

export function useWebPush() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [pushError, setPushError] = useState<string | null>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
      syncSubscriptionState();
    }
  }, []);

  /** Sync React state with the browser's actual push subscription state */
  const syncSubscriptionState = async () => {
    try {
      const registration = await getSwRegistration();
      if (!registration) {
        setIsSubscribed(false);
        return;
      }
      const getSubPromise = registration.pushManager.getSubscription();
      const subscription = await Promise.race([
        getSubPromise,
        new Promise<null>((_, reject) => setTimeout(() => reject(new Error('Push API timeout')), 3000))
      ]).catch(() => null);
      
      if (subscription) {
        setIsSubscribed(true);
      } else {
        setIsSubscribed(false);
      }
    } catch (error) {
      console.error('Error checking push subscription:', error);
      setIsSubscribed(false);
    }
  };

  const subscribe = useCallback(async () => {
    if (!isSupported) return false;
    setPushError(null);
    setIsSubscribed(true);

    try {
      const permissionResult = await Notification.requestPermission();
      setPermission(permissionResult);

      if (permissionResult !== 'granted') {
        throw new Error('Notification permission was denied.');
      }

      const registration = await getSwRegistration();
      if (!registration) {
        throw new Error('Service worker is unavailable. Push notifications won\'t work.');
      }
      
      const publicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
      if (!publicKey) {
        throw new Error('Push configuration is missing.');
      }

      // Try to reuse existing browser subscription first
      // Wrap in timeout because some webviews (like Helium) hang infinitely on PushManager methods
      const getSubPromise = registration.pushManager.getSubscription();
      let subscription = await Promise.race([
        getSubPromise,
        new Promise<null>((_, reject) => setTimeout(() => reject(new Error('Push API timeout')), 5000))
      ]).catch(() => null) as PushSubscription | null;
      
      if (!subscription) {
        try {
          const subscribePromise = registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicKey),
          });
          
          subscription = await Promise.race([
            subscribePromise,
            new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Browser blocked or timed out push subscription.')), 5000))
          ]) as PushSubscription;
        } catch (pushErr: any) {
          console.warn('Browser push subscribe failed or timed out:', pushErr?.message);
          throw new Error(getPushBlockedMessage());
        }
      }

      // Send subscription to backend
      await api.post('/notifications/push/subscribe', subscription.toJSON());
      return true;
    } catch (error: any) {
      console.error('Error subscribing to web push:', error);
      setPushError(error.message || 'Could not fully activate push notifications.');
      setIsSubscribed(false);
      return false;
    }
  }, [isSupported]);

  const unsubscribe = useCallback(async () => {
    if (!isSupported) return false;
    setIsSubscribed(false);

    try {
      const registration = await getSwRegistration();
      if (!registration) return true;

      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        // Only remove from backend — don't call subscription.unsubscribe()
        // Chromium browsers corrupt push state if you unsubscribe and re-subscribe
        const endpoint = subscription.endpoint;
        await api.post('/notifications/push/unsubscribe', { endpoint });
      }
      
      return true;
    } catch (error: any) {
      console.error('Error unsubscribing from web push:', error);
      // Revert state on failure
      setIsSubscribed(true);
      return false;
    }
  }, [isSupported]);

  return {
    isSupported,
    isSubscribed,
    permission,
    pushError,
    subscribe,
    unsubscribe,
  };
}
