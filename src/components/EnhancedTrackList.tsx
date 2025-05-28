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
        className="flex flex-col items-center justify-center h-full text-muted-foreground px-4"
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
          <Music className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 mb-4" />
        </motion.div>
        <p className="text-base sm:text-lg font-medium text-center">
          No {title.toLowerCase()} yet
        </p>
        <p className="text-xs sm:text-sm text-center">
          Start by loading your music or searching online
        </p>
      </motion.div>
    );
  }

  return (
    <div className="h-full w-full max-w-full">
      <motion.div
        className="flex items-center gap-2 sm:gap-3 py-2 sm:py-3 px-2 sm:px-4"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        {icon}
        <h2 className="text-base sm:text-lg font-semibold truncate">
          {title} ({tracks.length})
        </h2>
      </motion.div>

      <ScrollArea
        className="rounded-lg w-full"
        style={{ border: `1px solid ${primaryColor}50` }}
      >
        <AnimatePresence>
          <div className="space-y-1 p-2 sm:p-3 md:p-4  sm:max-h-[calc(75vh-14rem)]">
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
                  className={`group flex items-center space-x-2 sm:space-x-3 md:space-x-4 p-2 sm:p-3 rounded-xl cursor-pointer transition-all duration-300 ${
                    isCurrentTrack
                      ? "shadow-lg border-2"
                      : `hover:bg-[${isCurrentTrack ? `${primaryColor}30` : `${primaryColor}10`}] border-2 border-transparent`
                  }`}
                  style={{
                    backgroundColor: isCurrentTrack
                      ? `${primaryColor}20`
                      : undefined,
                    borderColor: isCurrentTrack
                      ? `${primaryColor}60`
                      : undefined,
                    // hover: {
                    //   backgroundColor: isCurrentTrack
                    //     ? `${primaryColor}30`
                    //     : `${primaryColor}10`,
                    // },
                  }}
                >
                  {/* Play Button & Cover */}
                  <div className="relative w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center flex-shrink-0">
                    {track.coverArt ? (
                      <motion.img
                        src={track.coverArt}
                        alt={track.title}
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover"
                        whileHover={{ scale: 1.1 }}
                      />
                    ) : (
                      <motion.div
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center"
                        style={{
                          background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}80)`,
                        }}
                        whileHover={{ scale: 1.1 }}
                      >
                        {isCurrentTrack ? (
                          isPlaying ? (
                            <Pause className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                          ) : (
                            <Play className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                          )
                        ) : (
                          <Music className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        )}
                      </motion.div>
                    )}
                  </div>

                  {/* Track Info */}
                  <div className="flex-1 min-w-0">
                    <motion.h3
                      className={`font-medium text-sm sm:text-base text-wrap transition-colors ${
                        isCurrentTrack ? "font-semibold" : ""
                      }`}
                      style={{
                        color: isCurrentTrack ? primaryColor : undefined,
                      }}
                    >
                      {track.title}
                    </motion.h3>
                    <p className="text-muted-foreground text-xs sm:text-sm text-wrap">
                      {track.artist}
                      {track.album && ` • ${track.album}`}
                    </p>
                  </div>

                  {/* Duration & Source */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-muted-foreground text-xs sm:text-sm">
                      {formatDuration(track.duration)}
                    </p>
                    <div className="flex items-center gap-1 justify-end">
                      {track.source === "local" ? (
                        <HardDrive className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-500" />
                      ) : (
                        <Globe className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-green-500" />
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