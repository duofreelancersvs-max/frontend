import { forwardRef, useState, useCallback, useImperativeHandle, useRef } from 'react';
import { Turnstile } from '@marsidev/react-turnstile';
import type { TurnstileInstance } from '@marsidev/react-turnstile';
import { RefreshCw } from 'lucide-react';

export interface TurnstileWidgetHandle {
  reset: () => void;
}

interface TurnstileWidgetProps {
  onSuccess: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
  theme?: 'light' | 'dark' | 'auto';
}

export const TurnstileWidget = forwardRef<TurnstileWidgetHandle, TurnstileWidgetProps>(
  ({ onSuccess, onError, onExpire, theme = 'auto' }, ref) => {
    const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;
    const [hasError, setHasError] = useState(false);
    const [widgetKey, setWidgetKey] = useState(0);
    const internalRef = useRef<TurnstileInstance>(null);

    const handleRetry = useCallback(() => {
      setHasError(false);
      setWidgetKey((prev) => prev + 1);
    }, []);

    const handleError = useCallback(() => {
      setHasError(true);
      onError?.();
    }, [onError]);

    const handleSuccess = useCallback((token: string) => {
      setHasError(false);
      onSuccess(token);
    }, [onSuccess]);

    useImperativeHandle(ref, () => ({
      reset: handleRetry,
    }));

    if (!siteKey) {
      console.warn('VITE_TURNSTILE_SITE_KEY is not configured');
      return null;
    }

    return (
      <div className="my-4">
        {hasError && (
          <div className="mb-2 p-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-xs flex items-center justify-between">
            <span>Security check failed. Tap retry or open in Chrome/Safari.</span>
            <button
              type="button"
              onClick={handleRetry}
              className="flex items-center gap-1 text-amber-800 font-medium hover:underline"
            >
              <RefreshCw size={12} />
              Retry
            </button>
          </div>
        )}
        <Turnstile
          key={widgetKey}
          ref={internalRef}
          siteKey={siteKey}
          onSuccess={handleSuccess}
          onError={handleError}
          onExpire={onExpire}
          options={{
            theme,
            size: 'normal',
          }}
        />
      </div>
    );
  }
);

TurnstileWidget.displayName = 'TurnstileWidget';
