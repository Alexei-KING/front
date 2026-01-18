"use client";

import { useState, useCallback, useEffect } from "react";

export interface Toast {
  id: string;
  title?: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
  duration?: number;
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    if (toasts.length > 0) {
      const timer = setTimeout(() => {
        setToasts((prev) => prev.slice(1));
      }, toasts[0].duration || 5000);

      return () => clearTimeout(timer);
    }
  }, [toasts]);

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };

    setToasts((prev) => [...prev, newToast]);

    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback(
    (message: string, title?: string) => {
      return addToast({ message, title, type: "success" });
    },
    [addToast]
  );

  const error = useCallback(
    (message: string, title?: string) => {
      return addToast({ message, title, type: "error" });
    },
    [addToast]
  );

  const warning = useCallback(
    (message: string, title?: string) => {
      return addToast({ message, title, type: "warning" });
    },
    [addToast]
  );

  const info = useCallback(
    (message: string, title?: string) => {
      return addToast({ message, title, type: "info" });
    },
    [addToast]
  );

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
  };
}
