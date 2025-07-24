import React from 'react';
import { usePWA } from '../hooks/usePWA';

interface PWAInstallBannerProps {
  className?: string;
}

export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({ className = '' }) => {
  const { isInstallable, isOffline, hasUpdate, install, updateServiceWorker } = usePWA();

  const bannerStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: '#1976d2',
    color: 'white',
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  };

  const buttonStyle: React.CSSProperties = {
    backgroundColor: 'white',
    color: '#1976d2',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '14px'
  };

  const closeButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: 'transparent',
    color: 'white',
    border: '1px solid white',
    marginLeft: '8px',
    padding: '4px 8px'
  };

  // Show update notification
  if (hasUpdate) {
    return (
      <div style={bannerStyle} className={className}>
        <div>
          <strong>App Update Available!</strong>
          <br />
          <small>A new version of Easy Khata is ready to install.</small>
        </div>
        <div>
          <button
            style={buttonStyle}
            onClick={updateServiceWorker}
          >
            Update Now
          </button>
        </div>
      </div>
    );
  }

  // Show offline notification
  if (isOffline) {
    return (
      <div style={{ ...bannerStyle, backgroundColor: '#f44336' }} className={className}>
        <div>
          <strong>You're Offline</strong>
          <br />
          <small>Some features may be limited while offline.</small>
        </div>
      </div>
    );
  }

  // Show install banner
  if (isInstallable) {
    return (
      <div style={bannerStyle} className={className}>
        <div>
          <strong>Install Easy Khata</strong>
          <br />
          <small>Add to your home screen for a better experience!</small>
        </div>
        <div>
          <button
            style={buttonStyle}
            onClick={install}
          >
            Install
          </button>
          <button
            style={closeButtonStyle}
            onClick={() => {/* Implement close logic */}}
          >
            ×
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default PWAInstallBanner;
