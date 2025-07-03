import { useState, useCallback } from "react";

// Simple toast state management
const toastQueue = [];
const listeners = new Set();

const addToast = (toast) => {
  const id = Math.random().toString(36).substr(2, 9);
  const newToast = { id, ...toast };
  toastQueue.push(newToast);
  
  // Notify all listeners
  listeners.forEach(listener => listener([...toastQueue]));
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    removeToast(id);
  }, 5000);
  
  return id;
};

const removeToast = (id) => {
  const index = toastQueue.findIndex(toast => toast.id === id);
  if (index > -1) {
    toastQueue.splice(index, 1);
    listeners.forEach(listener => listener([...toastQueue]));
  }
};

export function useToast() {
  const [toasts, setToasts] = useState([...toastQueue]);

  // Subscribe to toast updates
  useState(() => {
    listeners.add(setToasts);
    return () => listeners.delete(setToasts);
  }, []);

  const toast = useCallback(({ title, description, variant = "default" }) => {
    return addToast({ title, description, variant });
  }, []);

  const dismiss = useCallback((id) => {
    removeToast(id);
  }, []);

  return {
    toast,
    dismiss,
    toasts,
  };
}

// Export individual toast functions for convenience
export const toast = {
  success: (message) => addToast({ 
    title: "Success", 
    description: message, 
    variant: "success" 
  }),
  error: (message) => addToast({ 
    title: "Error", 
    description: message, 
    variant: "destructive" 
  }),
  info: (message) => addToast({ 
    title: "Info", 
    description: message, 
    variant: "default" 
  }),
  warning: (message) => addToast({ 
    title: "Warning", 
    description: message, 
    variant: "warning" 
  }),
};