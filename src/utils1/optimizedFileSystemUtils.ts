
import { Track } from '@/types/music';
import { dbManager } from './indexedDBUtils';

interface FileMetadata {
  name: string;
  size: number;
  lastModified: number;
  path: string;
}

export const loadMusicFromIndexedFolder = async (): Promise<Track[]> => {
  try {
    if (!('showDirectoryPicker' in window)) {
      console.error('File System Access API not supported');
      return [];
    }

    const dirHandle = await (window as any).showDirectoryPicker({
      mode: 'read',
      startIn: 'music'
    });

    // Cache the directory handle for future use
    await dbManager.setCache('lastDirectoryHandle', dirHandle);
    
    const tracks: Track[] = [];
    const audioExtensions = ['.mp3', '.wav', '.ogg', '.m4a', '.flac', '.aac', '.opus'];
    const processedFiles = new Set<string>();
    
    // Get existing tracks to avoid reprocessing
    const existingTracks = await dbManager.getTracksBySource('local');
    const existingTrackPaths = new Map(existingTracks.map(t => [t.url, t]));

    async function processDirectory(dirHandle: any, basePath = ''): Promise<void> {
      const promises: Promise<void>[] = [];
      
      for await (const [name, handle] of dirHandle.entries()) {
        if (handle.kind === 'file') {
          promises.push(processFile(handle, basePath, name));
        } else if (handle.kind === 'directory') {
          promises.push(processDirectory(handle, `${basePath}${name}/`));
        }
      }
      
      // Process files in batches for better performance
      const batchSize = 10;
      for (let i = 0; i < promises.length; i += batchSize) {
        const batch = promises.slice(i, i + batchSize);
        await Promise.all(batch);
      }
    }

    async function processFile(fileHandle: any, basePath: string, fileName: string): Promise<void> {
      try {
        const isAudioFile = audioExtensions.some(ext => 
          fileName.toLowerCase().endsWith(ext)
        );
        
        if (!isAudioFile) return;

        const file = await fileHandle.getFile();
        const filePath = `${basePath}${fileName}`;
        
        if (processedFiles.has(filePath)) return;
        processedFiles.add(filePath);

        // Check if we already have this file processed
        const fileKey = `${filePath}-${file.lastModified}-${file.size}`;
        const existing = existingTrackPaths.get(fileKey);
        
        if (existing && existing.url) {
          // Verify the blob URL is still valid
          try {
            const response = await fetch(existing.url, { method: 'HEAD' });
            if (response.ok) {
              tracks.push(existing);
              return;
            }
          } catch {
            // URL is invalid, need to recreate
          }
        }

        console.log('Processing new file:', fileName);
        
        // Create blob URL
        const url = URL.createObjectURL(file);
        const metadata = await extractOptimizedMetadata(file);
        
        const track: Track = {
          id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title: metadata.title,
          artist: metadata.artist,
          album: metadata.album,
          url: fileKey, // Use file key for storage
          source: 'local',
          duration: 0
        };

        // Cache the blob URL separately
        await dbManager.setCache(`blob-${track.id}`, url);
        
        // Get duration efficiently
        try {
          const duration = await getAudioDuration(url);
          track.duration = duration;
        } catch (error) {
          console.warn('Could not get duration for:', fileName);
        }
        
        tracks.push(track);
      } catch (error) {
        console.warn('Error processing file:', fileName, error);
      }
    }
    
    await processDirectory(dirHandle);
    
    // Store tracks in IndexedDB
    if (tracks.length > 0) {
      await dbManager.addTracks(tracks);
    }
    
    console.log('Loaded and cached tracks:', tracks.length);
    return tracks;
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('User cancelled folder selection');
    } else {
      console.error('Error loading music folder:', error);
    }
    return [];
  }
};

const getAudioDuration = (url: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    const timeout = setTimeout(() => {
      audio.src = '';
      reject(new Error('Timeout'));
    }, 5000);

    audio.addEventListener('loadedmetadata', () => {
      clearTimeout(timeout);
      resolve(audio.duration);
      audio.src = '';
    });

    audio.addEventListener('error', () => {
      clearTimeout(timeout);
      reject(new Error('Audio load error'));
    });

    audio.src = url;
    audio.load();
  });
};

export const extractOptimizedMetadata = async (file: File): Promise<{ title: string; artist: string; album?: string }> => {
  const filename = file.name.replace(/\.[^/.]+$/, '');
  
  let title = filename;
  let artist = 'Unknown Artist';
  let album: string | undefined;
  
  // Enhanced pattern matching
  const patterns = [
    // Pattern: Track Number - Artist - Title
    /^(\d+)\s*[-\.]\s*(.+?)\s*[-\.]\s*(.+)$/,
    // Pattern: Artist - Title
    /^(.+?)\s*[-\.]\s*(.+)$/,
    // Pattern: Title (Artist)
    /^(.+?)\s*\((.+?)\)$/,
  ];

  for (const pattern of patterns) {
    const match = filename.match(pattern);
    if (match) {
      if (match.length === 4) {
        // Track number - Artist - Title
        artist = match[2].trim();
        title = match[3].trim();
      } else if (match.length === 3) {
        if (pattern.source.includes('\\(')) {
          // Title (Artist)
          title = match[1].trim();
          artist = match[2].trim();
        } else {
          // Artist - Title
          artist = match[1].trim();
          title = match[2].trim();
        }
      }
      break;
    }
  }
  
  // Clean up common prefixes
  title = title.replace(/^\d+\s*[-\.]\s*/, '').trim();
  
  return { title, artist, album };
};

export const getBlobUrlForTrack = async (trackId: string): Promise<string | null> => {
  try {
    return await dbManager.getCache(`blob-${trackId}`);
  } catch {
    return null;
  }
};
