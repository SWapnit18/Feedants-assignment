/**
 * IndexedDB Video Storage Utility for Feedants
 * Provides persistent local video blob storage across browser reloads
 */

const DB_NAME = 'feedants_video_db';
const DB_VERSION = 1;
const STORE_NAME = 'videos';

function openDB() {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      resolve(null);
      return;
    }

    const req = window.indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => resolve(null);
  });
}

export async function storeSubmissionVideo(key, fileOrBlob, meta = {}) {
  try {
    const db = await openDB();
    if (!db || !fileOrBlob) return null;

    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);

      const record = {
        id: String(key),
        blob: fileOrBlob,
        name: meta.name || fileOrBlob.name || 'performance.mp4',
        type: fileOrBlob.type || 'video/mp4',
        size: fileOrBlob.size,
        updatedAt: Date.now(),
      };

      store.put(record);

      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    });
  } catch (err) {
    console.warn('[videoStorage] Store failed:', err);
    return null;
  }
}

export async function retrieveSubmissionVideoUrl(key) {
  try {
    const db = await openDB();
    if (!db) return null;

    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(String(key));

      req.onsuccess = () => {
        const record = req.result;
        if (record && record.blob) {
          const blobUrl = URL.createObjectURL(record.blob);
          resolve(blobUrl);
        } else {
          resolve(null);
        }
      };

      req.onerror = () => resolve(null);
    });
  } catch (err) {
    console.warn('[videoStorage] Retrieve failed:', err);
    return null;
  }
}
