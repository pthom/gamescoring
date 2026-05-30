import { useRegisterSW } from "virtual:pwa-register/react";

/** Shows a small toast when a new deployed version is ready, so the user can
 *  apply it with one tap instead of fighting the service-worker cache. */
export function UpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  if (!needRefresh) return null;

  return (
    <div className="update-toast" role="status">
      <span className="update-text">New version available</span>
      <button className="btn btn-primary update-btn" onClick={() => updateServiceWorker(true)}>
        Reload
      </button>
      <button
        className="icon-btn sm"
        aria-label="Dismiss"
        onClick={() => setNeedRefresh(false)}
      >
        ✕
      </button>
    </div>
  );
}
