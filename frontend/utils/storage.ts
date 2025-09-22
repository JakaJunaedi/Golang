// utils/storage.ts
export const storage = {
  get: (key: string) => {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  
  set: (key: string, value: string) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, value);
    } catch {
      // Handle quota exceeded or other errors
    }
  },
  
  remove: (key: string) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(key);
    } catch {
      // Handle errors
    }
  },
  
  clear: () => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.clear();
    } catch {
      // Handle errors
    }
  }
};