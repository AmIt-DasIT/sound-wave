import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Music, HardDrive, Globe } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Track } from "@/types/music";
import { useColor } from "@/contexts/ColorContext";

interface EnhancedTrackListProps {
  tracks: Track[];
  currentTrack: Track | null;
  onTrackSelect: (track: Track) => void;
  isPlaying: boolean;
  title: string;
  icon: React.ReactNode;
}

const EnhancedTrackList: React.FC<EnhancedTrackListProps> = ({
  tracks,
  currentTrack,
  onTrackSelect,
  isPlaying,
  title,
  icon,
}) => {
  const { primaryColor } = useColor();

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (tracks.length === 0) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center h-full text-muted-foreground"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <motion.div
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Music className="w-16 h-16 mb-4" />
        </motion.div>
        <p className="text-lg font-medium">No {title.toLowerCase()} yet</p>
        <p className="text-sm">
          Start by loading your music or searching online
        </p>
      </motion.div>
    );
  }

  return (
    <div className="h-full">
      <motion.div
        className="flex items-center gap-3 py-3"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        {icon}
        <h2 className="text-lg font-semibold">
          {title} ({tracks.length})
        </h2>
      </motion.div>

      <ScrollArea
        className="rounded-lg"
        style={{ border: `1px solid ${primaryColor}50` }}
      >
        <AnimatePresence>
          <div className="space-y-1 p-2 max-h-[calc(70vh-200px)]">
            {tracks.map((track, index) => {
              const isCurrentTrack = currentTrack?.id === track.id;

              return (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onTrackSelect(track)}
                  className={`group flex items-center space-x-4 p-3 rounded-xl cursor-pointer transition-all duration-300 ${
                    isCurrentTrack
                      ? "shadow-lg border-2"
                      : `hover:bg-muted/50 border-2 border-transparent`
                  }`}
                  style={{
                    backgroundColor: isCurrentTrack
                      ? `${primaryColor}20`
                      : undefined,
                    borderColor: isCurrentTrack
                      ? `${primaryColor}60`
                      : undefined,
                  }}
                >
                  {/* Play Button & Cover */}
                  <div className="relative w-12 h-12 flex items-center justify-center flex-shrink-0">
                    {track.coverArt ? (
                      <motion.img
                        src={track.coverArt}
                        alt={track.title}
                        className="w-12 h-12 rounded-lg object-cover"
                        whileHover={{ scale: 1.1 }}
                      />
                    ) : (
                      <motion.div
                        className="w-12 h-12 rounded-lg flex items-center justify-center"
                        style={{
                          background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}80)`,
                        }}
                        whileHover={{ scale: 1.1 }}
                      >
                        {isCurrentTrack ? (
                          isPlaying ? (
                            <Pause className="w-5 h-5 text-white" />
                          ) : (
                            <Play className="w-5 h-5 text-white" />
                          )
                        ) : (
                          <Music className="w-6 h-6 text-white" />
                        )}
                      </motion.div>
                    )}

                  </div>

                  {/* Track Info */}
                  <div className="flex-1 min-w-0">
                    <motion.h3
                      className={`font-medium text-wrap transition-colors ${
                        isCurrentTrack ? "font-semibold" : ""
                      }`}
                      style={{
                        color: isCurrentTrack ? primaryColor : undefined,
                      }}
                    >
                      {track.title}
                    </motion.h3>
                    <p className="text-muted-foreground text-sm truncate">
                      {track.artist}
                      {track.album && ` • ${track.album}`}
                    </p>
                  </div>

                  {/* Duration & Source */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-muted-foreground text-sm">
                      {formatDuration(track.duration)}
                    </p>
                    <div className="flex items-center gap-1 justify-end">
                      {track.source === "local" ? (
                        <HardDrive className="w-3 h-3 text-blue-500" />
                      ) : (
                        <Globe className="w-3 h-3 text-green-500" />
                      )}
                      <span
                        className={`text-xs ${
                          track.source === "local"
                            ? "text-blue-500"
                            : "text-green-500"
                        }`}
                      >
                        {track.source === "local" ? "Local" : "Online"}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </AnimatePresence>
      </ScrollArea>
    </div>
  );
};

export default EnhancedTrackList;
