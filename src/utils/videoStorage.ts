import { VideoConfig } from '../types';

const DB_NAME = 'mario_convite_db';
const STORE_NAME = 'videos';
const CONFIG_KEY = 'mario_convite_video_config';

// Built-in sample video for Mario celebration demonstration
export const SAMPLE_VIDEOS = [
  {
    id: 'mario-video',
    title: 'Design sem nome.mp4',
    url: encodeURI('/video/Design sem nome.mp4'),
    description: 'Vídeo oficial do convite'
  }
];

export const DEFAULT_VIDEO_CONFIG: VideoConfig = {
  type: 'upload',
  src: encodeURI('/video/Design sem nome.mp4'),
  originalName: 'Design sem nome.mp4',
  autoplay: true,
  muted: false,
  loop: true,
  fit: 'cover',
  caption: 'Venha comemorar comigo!',
  updatedAt: Date.now()
};

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveVideoFileToDB(file: Blob, name: string): Promise<string> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const putReq = store.put({ file, name, date: Date.now() }, 'active_video');
    putReq.onsuccess = () => {
      const blobUrl = URL.createObjectURL(file);
      resolve(blobUrl);
    };
    putReq.onerror = () => reject(putReq.error);
  });
}

export async function loadVideoFileFromDB(): Promise<{ blob: Blob; url: string; name: string } | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const getReq = store.get('active_video');
      getReq.onsuccess = () => {
        const result = getReq.result;
        if (result && result.file) {
          const url = URL.createObjectURL(result.file);
          resolve({ blob: result.file, url, name: result.name || 'video.mp4' });
        } else {
          resolve(null);
        }
      };
      getReq.onerror = () => reject(getReq.error);
    });
  } catch {
    return null;
  }
}

export async function clearVideoFileFromDB(): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const delReq = store.delete('active_video');
      delReq.onsuccess = () => resolve();
      delReq.onerror = () => reject(delReq.error);
    });
  } catch {}
}

export function saveVideoConfig(config: VideoConfig): void {
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Error saving video config', e);
  }
}

export function loadVideoConfig(): VideoConfig {
  try {
    const stored = localStorage.getItem(CONFIG_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (
        parsed.src &&
        !parsed.src.includes('gtv-videos-bucket') &&
        !parsed.src.includes('videoplayback')
      ) {
        return { ...DEFAULT_VIDEO_CONFIG, ...parsed };
      }
    }
  } catch {}
  return DEFAULT_VIDEO_CONFIG;
}

export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();

  // Pattern 1: youtu.be/ID
  const shortMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch) return shortMatch[1];

  // Pattern 2: youtube.com/watch?v=ID
  const watchMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (watchMatch) return watchMatch[1];

  // Pattern 3: youtube.com/shorts/ID
  const shortsMatch = trimmed.match(/\/shorts\/([a-zA-Z0-9_-]{11})/);
  if (shortsMatch) return shortsMatch[1];

  // Pattern 4: youtube.com/embed/ID
  const embedMatch = trimmed.match(/\/embed\/([a-zA-Z0-9_-]{11})/);
  if (embedMatch) return embedMatch[1];

  // Direct 11-char ID check
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  return null;
}

export function buildYouTubeEmbedUrl(videoId: string, options: { autoplay?: boolean; muted?: boolean; loop?: boolean }): string {
  const params = new URLSearchParams({
    autoplay: options.autoplay ? '1' : '0',
    mute: options.muted ? '1' : '0',
    loop: options.loop ? '1' : '0',
    playlist: videoId, // required for loop=1 in YouTube
    controls: '1',
    rel: '0',
    playsinline: '1',
    modestbranding: '1'
  });
  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}
