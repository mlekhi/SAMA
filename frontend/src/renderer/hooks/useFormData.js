import { useState, useEffect } from 'react';

/**
 * Simple hook for form data persistence
 * Just loads from session storage when component mounts
 */
export const useFormData = (moduleName, defaultData = {}) => {
  const [data, setData] = useState(() => {
    // Load from session storage on initialization
    const sessionData = sessionStorage.getItem(`${moduleName}_data`);
    if (sessionData) {
      try {
        const parsed = JSON.parse(sessionData);
        return { ...defaultData, ...parsed };
      } catch (e) {
        console.error(`Error parsing ${moduleName} data:`, e);
        return defaultData;
      }
    }
    return defaultData;
  });

  // Save to session storage whenever data changes
  useEffect(() => {
    sessionStorage.setItem(`${moduleName}_data`, JSON.stringify(data));
  }, [data, moduleName]);

  // Update data
  const updateData = (updates) => {
    setData(prevData => ({ ...prevData, ...updates }));
  };

  return {
    data,
    setData,
    updateData
  };
};
