import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Music } from "lucide-react";
import Header from "../components/Header";
import EnhancedSearch from "../components/EnhancedSearch";
import EnhancedTrackList from "../components/EnhancedTrackList";
import EnhancedPlayerControls from "../components/EnhancedPlayerControls";
import { Track } from "@/types/music";
import {
  loadMusicFromIndexedFolder,
  getBlobUrlForTrack,
} from "@/utils/optimizedFileSystemUtils";
import { dbManager } from "@/utils/indexedDBUtils";
import { useColor } from "@/contexts/ColorContext";

const MusicPlayer = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { primaryColor } = useColor();

  // Initialize IndexedDB and load stored data
  useEffect(() => {
    const initializeDB = async () => {
      try {
        await dbManager.init();

        // Load stored settings
        const [storedTracks, storedVolume, storedCurrentTrackId] =
          await Promise.all([
            dbManager.getTracks(),
            dbManager.getSetting("volume", 0.7),
            dbManager.getSetting("currentTrackId", null),
          ]);

        setTracks(storedTracks);
        setVolume(storedVolume);

        if (storedCurrentTrackId && storedTracks.length > 0) {
          const track = storedTracks.find((t) => t.id === storedCurrentTrackId);
          if (track) setCurrentTrack(track);
        }

        // Clean old cache
        await dbManager.clearOldCache();
      } catch (error) {
        console.error("Failed to initialize database:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeDB();
  }, []);

  // Store settings when they change
  useEffect(() => {
    if (!isLoading) {
      dbManager.setSetting("volume", volume);
    }
  }, [volume, isLoading]);

  useEffect(() => {
    if (!isLoading && currentTrack) {
      dbManager.setSetting("currentTrackId", currentTrack.id);
    }
  }, [currentTrack, isLoading]);

  // Audio event listeners with performance optimization
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnd = () => {
      setIsPlaying(false);
      playNext();
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleEnd);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleEnd);
    };
  }, [currentTrack]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const handleLoadFolder = async () => {
    try {
      setIsLoading(true);
      console.log("Loading music folder...");
      const newTracks = await loadMusicFromIndexedFolder();

      if (newTracks.length > 0) {
        const allTracks = await dbManager.getTracks();
        setTracks(allTracks);
      }
    } catch (error) {
      console.error("Failed to load music folder:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const searchJamendoAPI = useCallback(async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      // Check cache first
      const cacheKey = `jamendo-search-${searchQuery}`;
      let cachedResults = await dbManager.getCache(cacheKey);

      if (!cachedResults) {
        const response = await fetch(
          `https://api.jamendo.com/v3.0/tracks/?client_id=4de2ab0c&format=json&limit=20&search=${encodeURIComponent(
            searchQuery
          )}&include=musicinfo`
        );

        if (!response.ok) throw new Error("API request failed");

        const data = await response.json();
        cachedResults = data.results || [];

        // Cache results for 1 hour
        await dbManager.setCache(cacheKey, cachedResults);
      }

      if (cachedResults.length > 0) {
        const apiTracks: Track[] = cachedResults.map((track: any) => ({
          id: `jamendo-${track.id}`,
          title: track.name,
          artist: track.artist_name,
          album: track.album_name,
          duration: track.duration,
          url: track.audio,
          coverArt: track.album_image,
          source: "api" as const,
        }));

        await dbManager.addTracks(apiTracks);
        const allTracks = await dbManager.getTracks();
        setTracks(allTracks);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery]);

  const playTrack = async (track: Track) => {
    console.log("Playing track:", track.title);

    try {
      let audioUrl = track.url;

      // For local tracks, get the blob URL from cache
      if (track.source === "local") {
        const blobUrl = await getBlobUrlForTrack(track.id);
        if (blobUrl) {
          audioUrl = blobUrl;
        } else {
          console.error("No blob URL found for local track");
          return;
        }
      }

      setCurrentTrack({ ...track, url: audioUrl });
      setIsPlaying(true);

      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        await audioRef.current.play();
      }
    } catch (error) {
      console.error("Error playing track:", error);
      setIsPlaying(false);
    }
  };

  const togglePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) {
      console.warn("No audio element or current track available");
      return;
    }
    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        playTrack(currentTrack);
        await audio.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error("Error toggling play/pause:", error);
    }
  };

  const playNext = useCallback(() => {
    const currentIndex = tracks.findIndex(
      (track) => track.id === currentTrack?.id
    );
    const nextTrack = tracks[currentIndex + 1] || tracks[0];
    if (nextTrack) {
      playTrack(nextTrack);
    }
  }, [tracks, currentTrack]);

  const playPrevious = useCallback(() => {
    const currentIndex = tracks.findIndex(
      (track) => track.id === currentTrack?.id
    );
    const previousTrack = tracks[currentIndex - 1] || tracks[tracks.length - 1];
    if (previousTrack) {
      playTrack(previousTrack);
    }
  }, [tracks, currentTrack]);

  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  // Filter tracks based on search
  const localTracks = tracks.filter(
    (track) =>
      track.source === "local" &&
      (track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.artist.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const jamendoTracks = tracks.filter(
    (track) =>
      track.source === "api" &&
      (track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.artist.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen transition-all duration-500"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div
        style={{
          background: `linear-gradient(135deg, ${primaryColor}40, ${primaryColor}20, transparent)`,
          backdropFilter: "blur(10px)",
        }}
        className="fixed inset-0 z-[-1] transition-all duration-500"
      ></div>
      <Header onLoadFolder={handleLoadFolder} />

      <EnhancedPlayerControls
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        onPlayPause={togglePlayPause}
        onNext={playNext}
        onPrevious={playPrevious}
        onSeek={seek}
        onVolumeChange={setVolume}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-8 space-y-3 sm:space-y-8 sm:pb-32">
        <EnhancedSearch
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onJamendoSearch={searchJamendoAPI}
          isSearching={isSearching}
        />

        {tracks.length > 0 ? (
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <EnhancedTrackList
              tracks={localTracks}
              currentTrack={currentTrack}
              onTrackSelect={playTrack}
              isPlaying={isPlaying}
              title="Local Music"
              icon={<Music className="w-5 h-5 text-blue-500" />}
            />

            <EnhancedTrackList
              tracks={jamendoTracks}
              currentTrack={currentTrack}
              onTrackSelect={playTrack}
              isPlaying={isPlaying}
              title="Online Music"
              icon={<Music className="w-5 h-5 text-green-500" />}
            />
          </motion.div>
        ) : (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <motion.div
              className="w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{
                background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}80)`,
              }}
              animate={{
                scale: [1, 1.05, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Music className="w-16 h-16 text-white" />
            </motion.div>
            <motion.h3
              className="text-3xl font-bold mb-4"
              style={{ color: primaryColor }}
            >
              Welcome to SoundWave
            </motion.h3>
            <p className="text-muted-foreground text-lg mb-6">
              Your musical journey starts here
            </p>
            <p className="text-muted-foreground">
              Load your music folder or search for tracks online to begin
            </p>
          </motion.div>
        )}
      </main>

      <audio
        ref={audioRef}
        onLoadedData={() => {
          if (isPlaying && audioRef.current) {
            audioRef.current.play().catch(console.error);
          }
        }}
      />
    </motion.div>
  );
};

export default MusicPlayer;
