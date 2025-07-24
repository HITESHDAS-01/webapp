import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { usePWA } from '../hooks/usePWA';
export const PWAInstallBanner = ({ className = '' }) => {
    const { isInstallable, isOffline, hasUpdate, install, updateServiceWorker } = usePWA();
    const bannerStyle = {
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
    const buttonStyle = {
        backgroundColor: 'white',
        color: '#1976d2',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: 'bold',
        fontSize: '14px'
    };
    const closeButtonStyle = {
        ...buttonStyle,
        backgroundColor: 'transparent',
        color: 'white',
        border: '1px solid white',
        marginLeft: '8px',
        padding: '4px 8px'
    };
    // Show update notification
    if (hasUpdate) {
        return (_jsxs("div", { style: bannerStyle, className: className, children: [_jsxs("div", { children: [_jsx("strong", { children: "App Update Available!" }), _jsx("br", {}), _jsx("small", { children: "A new version of Easy Khata is ready to install." })] }), _jsx("div", { children: _jsx("button", { style: buttonStyle, onClick: updateServiceWorker, children: "Update Now" }) })] }));
    }
    // Show offline notification
    if (isOffline) {
        return (_jsx("div", { style: { ...bannerStyle, backgroundColor: '#f44336' }, className: className, children: _jsxs("div", { children: [_jsx("strong", { children: "You're Offline" }), _jsx("br", {}), _jsx("small", { children: "Some features may be limited while offline." })] }) }));
    }
    // Show install banner
    if (isInstallable) {
        return (_jsxs("div", { style: bannerStyle, className: className, children: [_jsxs("div", { children: [_jsx("strong", { children: "Install Easy Khata" }), _jsx("br", {}), _jsx("small", { children: "Add to your home screen for a better experience!" })] }), _jsxs("div", { children: [_jsx("button", { style: buttonStyle, onClick: install, children: "Install" }), _jsx("button", { style: closeButtonStyle, onClick: () => { }, children: "\u00D7" })] })] }));
    }
    return null;
};
export default PWAInstallBanner;
