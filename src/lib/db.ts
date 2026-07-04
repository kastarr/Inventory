import { openDB, DBSchema } from 'idb';

interface AcasoDB extends DBSchema {
  sync_queue: {
    key: string;
    value: {
      id: string;
      action: 'CHECKOUT' | 'RETURN';
      payload: any;
      timestamp: number;
    };
  };
  items: {
    key: string;
    value: any;
  };
}

let dbPromise: ReturnType<typeof openDB<AcasoDB>> | null = null;

if (typeof window !== 'undefined') {
  dbPromise = openDB<AcasoDB>('acaso-offline-db', 1, {
    upgrade(db) {
      db.createObjectStore('sync_queue', { keyPath: 'id' });
      db.createObjectStore('items', { keyPath: 'id' });
    },
  });
}

export async function addToSyncQueue(action: 'CHECKOUT' | 'RETURN', payload: any) {
  if (!dbPromise) return;
  const db = await dbPromise;
  await db.add('sync_queue', {
    id: Math.random().toString(36).substring(2, 9),
    action,
    payload,
    timestamp: Date.now(),
  });
  
  // Attempt sync immediately if online
  if (navigator.onLine) {
    syncOfflineData();
  }
}

export async function syncOfflineData() {
  if (!dbPromise) return;
  const db = await dbPromise;
  const tx = db.transaction('sync_queue', 'readwrite');
  const queue = await tx.objectStore('sync_queue').getAll();
  
  if (queue.length === 0) return;

  try {
    const response = await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ queue }),
    });

    if (response.ok) {
      // Clear queue if sync successful
      const clearTx = db.transaction('sync_queue', 'readwrite');
      await clearTx.objectStore('sync_queue').clear();
    }
  } catch (err) {
    console.error('Offline sync failed, will retry later:', err);
  }
}

// Set up online listener
if (typeof window !== 'undefined') {
  window.addEventListener('online', syncOfflineData);
}
