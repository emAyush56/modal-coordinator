const getStorage = (storageType) => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window[storageType] || null;
  } catch (error) {
    return null;
  }
};

const canAccessStorage = (storageType) => {
  try {
    const storage = getStorage(storageType);
    if (!storage) return false;
    const testKey = '__platinumrx_storage_test__';
    storage.setItem(testKey, '1');
    storage.removeItem(testKey);
    return true;
  } catch (error) {
    return false;
  }
};

const readFromStorage = (storageType, key) => {
  try {
    const storage = getStorage(storageType);
    const res = storage ? storage.getItem(key) : null;
    if (typeof res === 'string' && res.indexOf('{') > -1)
      try {
        return JSON.parse(res);
      } catch (error) {
        return res;
      }
    else return res;
  } catch (error) {
    return null;
  }
};

const writeToStorage = (storageType, key, value) => {
  try {
    const storage = getStorage(storageType);
    if (!storage) return false;
    if (typeof value === 'object') value = JSON.stringify(value);
    storage.setItem(key, value);
    return true;
  } catch (error) {
    return false;
  }
};

const removeFromStorage = (storageType, key) => {
  try {
    const storage = getStorage(storageType);
    if (!storage) return false;
    storage.removeItem(key);
    return true;
  } catch (error) {
    return false;
  }
};

export const safeLocalStorage = {
  getItem: (key) => readFromStorage('localStorage', key),
  setItem: (key, value) => writeToStorage('localStorage', key, value),
  removeItem: (key) => removeFromStorage('localStorage', key),
};

export const safeSessionStorage = {
  getItem: (key) => readFromStorage('sessionStorage', key),
  setItem: (key, value) => writeToStorage('sessionStorage', key, value),
  removeItem: (key) => removeFromStorage('sessionStorage', key),
};

export const isStorageAccessible = {
  localStorage: () => canAccessStorage('localStorage'),
  sessionStorage: () => canAccessStorage('sessionStorage'),
};
