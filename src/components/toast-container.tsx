"use client";

import { useToast, type Toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

function ToastItem({
  toast,
  onRemove,
}: {
  toast: Toast;
  onRemove: (id: string) => void;
}) {
  const getIcon = () => {
    switch (toast.type) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "info":
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStyles = () => {
    switch (toast.type) {
      case "success":
        return "border-green-200 bg-green-50 text-green-800";
      case "error":
        return "border-red-200 bg-red-50 text-red-800";
      case "warning":
        return "border-yellow-200 bg-yellow-50 text-yellow-800";
      case "info":
        return "border-blue-200 bg-blue-50 text-blue-800";
    }
  };

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 rounded-lg border shadow-lg animate-in slide-in-from-right-full",
        getStyles()
      )}
    >
      {getIcon()}
      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className="font-geist font-semibold text-sm">{toast.title}</p>
        )}
        <p className="font-manrope text-sm">{toast.message}</p>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onRemove(toast.id)}
        className="h-6 w-6 p-0"
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
}

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
}
