import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Repeat,
  Shuffle,
  Heart,
  MoreHorizontal,
  Music,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Track } from "@/types/music";
import { useColor } from "@/contexts/ColorContext";

interface EnhancedPlayerControlsProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
}

const EnhancedPlayerControls: React.FC<EnhancedPlayerControlsProps> = ({
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  volume,
  onPlayPause,
  onNext,
  onPrevious,
  onSeek,
  onVolumeChange,
}) => {
  const { primaryColor } = useColor();
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progressPercentage = duration ? (currentTime / duration) * 100 : 0;

  if (!currentTrack) {
    return (
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed bottom-4 left-4 right-4 mx-auto max-w-6xl"
      >
        <Card className="bg-background/95 backdrop-blur-lg border p-6">
          <div className="text-center text-muted-foreground">
            <Music className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-lg">
              Select a track to start your musical journey
            </p>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-4 left-4 right-4 mx-auto max-w-7xl"
    >
      <Card className="bg-background/95 backdrop-blur-lg border p-6">
        <div className="flex flex-col space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="relative w-full h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="absolute left-0 top-0 h-full rounded-full"
                style={{
                  width: `${progressPercentage}%`,
                  background: `linear-gradient(90deg, ${primaryColor}, ${primaryColor}80)`,
                }}
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
              />
              <input
                type="range"
                min={0}
                max={duration || 0}
                value={currentTime}
                onChange={(e) => onSeek(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Main Controls */}
          <div className="flex items-center justify-between">
            {/* Track Info */}
            <div className="flex items-center space-x-4 flex-1 min-w-0">
              <motion.div
                className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden"
                whileHover={{ scale: 1.05 }}
              >
                {currentTrack.coverArt ? (
                  <img
                    src={currentTrack.coverArt}
                    alt={currentTrack.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}80)`,
                    }}
                  >
                    <span className="text-white font-bold text-xl">
                      {currentTrack.title.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </motion.div>

              <div className="min-w-0 flex-1">
                <motion.h3
                  className="font-semibold truncate text-lg"
                  style={{ color: primaryColor }}
                >
                  {currentTrack.title}
                </motion.h3>
                <p className="text-muted-foreground truncate">
                  {currentTrack.artist}
                </p>
                {currentTrack.album && (
                  <p className="text-muted-foreground text-sm truncate">
                    {currentTrack.album}
                  </p>
                )}
              </div>

              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsLiked(!isLiked)}
                  className={`rounded-full ${
                    isLiked ? "text-red-500" : "text-muted-foreground"
                  }`}
                >
                  <Heart
                    className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`}
                  />
                </Button>
              </motion.div>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center space-x-3">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsShuffle(!isShuffle)}
                  className={`rounded-full ${
                    isShuffle ? "" : "text-muted-foreground"
                  }`}
                  style={{ color: isShuffle ? primaryColor : undefined }}
                >
                  <Shuffle className="w-4 h-4" />
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onPrevious}
                  className="text-foreground hover:text-foreground/80 rounded-full"
                >
                  <SkipBack className="w-6 h-6" />
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={onPlayPause}
                  className="w-14 h-14 rounded-full text-white shadow-lg"
                  style={{ backgroundColor: primaryColor }}
                >
                  <AnimatePresence mode="wait">
                    {isPlaying ? (
                      <motion.div
                        key="pause"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                      >
                        <Pause className="w-6 h-6" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="play"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                      >
                        <Play className="w-6 h-6 ml-1" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onNext}
                  className="text-foreground hover:text-foreground/80 rounded-full"
                >
                  <SkipForward className="w-6 h-6" />
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsRepeat(!isRepeat)}
                  className={`rounded-full ${
                    isRepeat ? "" : "text-muted-foreground"
                  }`}
                  style={{ color: isRepeat ? primaryColor : undefined }}
                >
                  <Repeat className="w-4 h-4" />
                </Button>
              </motion.div>
            </div>

            {/* Volume & More Controls */}
            <div className="flex items-center space-x-3 flex-1 justify-end">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onVolumeChange(volume === 0 ? 0.7 : 0)}
                  className="text-muted-foreground hover:text-foreground rounded-full"
                >
                  {volume === 0 ? (
                    <VolumeX className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </Button>
              </motion.div>

              <div className="w-32">
                <Slider
                  value={[volume * 100]}
                  onValueChange={(value) => onVolumeChange(value[0] / 100)}
                  max={100}
                  step={1}
                  className={`cursor-pointer bg-gradient-to-t from-transparent to-${primaryColor} rounded-full`}
                  style={{
                    background: `linear-gradient(90deg, ${primaryColor}, ${primaryColor}80) !important`,
                  }}
                />
              </div>

              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground rounded-full"
                >
                  <MoreHorizontal className="w-5 h-5" />
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default EnhancedPlayerControls;
