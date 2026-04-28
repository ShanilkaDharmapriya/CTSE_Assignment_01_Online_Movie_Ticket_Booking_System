import { createContext, useCallback, useContext, useMemo, useState } from "react";

const PopupContext = createContext(null);

export function PopupProvider({ children }) {
  const [toast, setToast] = useState(null);
  const [confirmState, setConfirmState] = useState(null);

  const notify = useCallback((message, type = "success", timeout = 2800) => {
    const id = Date.now();
    setToast({ id, message, type });

    window.setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, timeout);
  }, []);

  const confirm = useCallback((options = {}) => {
    return new Promise((resolve) => {
      setConfirmState({
        title: options.title || "Please confirm",
        message: options.message || "Are you sure you want to continue?",
        confirmText: options.confirmText || "Confirm",
        cancelText: options.cancelText || "Cancel",
        intent: options.intent || "danger",
        resolve,
      });
    });
  }, []);

  const closeConfirm = useCallback((value) => {
    setConfirmState((current) => {
      if (current?.resolve) {
        current.resolve(Boolean(value));
      }
      return null;
    });
  }, []);

  const value = useMemo(
    () => ({
      notify,
      confirm,
    }),
    [notify, confirm]
  );

  return (
    <PopupContext.Provider value={value}>
      {children}

      {toast && (
        <div className={`popup-toast popup-toast--${toast.type}`} role="status" aria-live="polite">
          {toast.message}
        </div>
      )}

      {confirmState && (
        <div className="popup-modal-backdrop" role="presentation">
          <div className="popup-modal" role="dialog" aria-modal="true" aria-label={confirmState.title}>
            <h3>{confirmState.title}</h3>
            <p>{confirmState.message}</p>
            <div className="popup-modal__actions">
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => closeConfirm(false)}
              >
                {confirmState.cancelText}
              </button>
              <button
                type="button"
                className={`btn ${confirmState.intent === "danger" ? "btn--danger" : "btn--primary"}`}
                onClick={() => closeConfirm(true)}
              >
                {confirmState.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </PopupContext.Provider>
  );
}

export function usePopup() {
  const ctx = useContext(PopupContext);
  if (!ctx) throw new Error("usePopup must be used within PopupProvider");
  return ctx;
}
