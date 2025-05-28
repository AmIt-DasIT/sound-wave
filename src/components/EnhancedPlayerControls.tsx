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
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Track } from "@/types/music";
import { useColor } from "@/contexts/ColorContext";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./ui/drawer";

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
  const [showMoreControls, setShowMoreControls] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progressPercentage = duration ? (currentTime / duration) * 100 : 0;

  const renderPlayerContent = (isDialog = false) => (
    <Card
      className={`bg-background/95 backdrop-blur-lg border-0 sm:border !p-5 ${
        isDialog ? "p-4" : "p-3"
      }`}
    >
      <div className="flex flex-col space-y-2">
        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="relative w-full h-1.5 bg-muted rounded-full overflow-hidden touch-none">
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
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer touch-none"
            />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Main Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 sm:space-x-2">
          {/* Track Info */}
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <motion.div
              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden"
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
                  <span className="text-white font-bold text-sm">
                    {currentTrack.title.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </motion.div>

            <div className="min-w-0 flex-1">
              <motion.h3
                className="font-semibold truncate text-sm"
                style={{ color: primaryColor }}
              >
                {currentTrack.title}
              </motion.h3>
              <p className="text-muted-foreground truncate text-xs">
                {currentTrack.artist}
              </p>
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
                <Heart className={`w-3 h-3 ${isLiked ? "fill-current" : ""}`} />
              </Button>
            </motion.div>
          </div>

          {/* Playback Controls */}
          <div className="flex items-center justify-center space-x-1">
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="hidden sm:block"
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsShuffle(!isShuffle)}
                className={`rounded-full ${
                  isShuffle ? "" : "text-muted-foreground"
                }`}
                style={{ color: isShuffle ? primaryColor : undefined }}
              >
                <Shuffle className="w-3 h-3" />
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant="ghost"
                size="icon"
                onClick={onPrevious}
                className="text-foreground hover:text-foreground/80 rounded-full"
              >
                <SkipBack className="w-4 h-4" />
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={onPlayPause}
                className="w-10 h-10 rounded-full text-white shadow-md"
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
                      <Pause className="w-4 h-4" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="play"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <Play className="w-4 h-4 ml-0.5" />
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
                <SkipForward className="w-4 h-4" />
              </Button>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="hidden sm:block"
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsRepeat(!isRepeat)}
                className={`rounded-full ${
                  isRepeat ? "" : "text-muted-foreground"
                }`}
                style={{ color: isRepeat ? primaryColor : undefined }}
              >
                <Repeat className="w-3 h-3" />
              </Button>
            </motion.div>
          </div>

          {/* Volume & More Controls */}
          <div className="flex items-center justify-end space-x-1 flex-1">
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="hidden sm:block"
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onVolumeChange(volume === 0 ? 0.7 : 0)}
                className="text-muted-foreground hover:text-foreground rounded-full"
              >
                {volume === 0 ? (
                  <VolumeX className="w-3 h-3" />
                ) : (
                  <Volume2 className="w-3 h-3" />
                )}
              </Button>
            </motion.div>

            <div className="hidden sm:block w-20">
              <Slider
                value={[volume * 100]}
                onValueChange={(value) => onVolumeChange(value[0] / 100)}
                max={100}
                step={1}
                className="cursor-pointer"
                style={{
                  background: `linear-gradient(90deg, ${primaryColor}, ${primaryColor}80)`,
                }}
              />
            </div>

            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowMoreControls(!showMoreControls)}
                className="text-muted-foreground hover:text-foreground rounded-full"
              >
                <MoreHorizontal className="w-3 h-3" />
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Additional Controls for Mobile */}
        <AnimatePresence>
          {showMoreControls && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="flex flex-col space-y-1 sm:hidden"
            >
              <div className="flex items-center justify-between">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsShuffle(!isShuffle)}
                    className={`rounded-full ${
                      isShuffle ? "" : "text-muted-foreground"
                    }`}
                    style={{ color: isShuffle ? primaryColor : undefined }}
                  >
                    <Shuffle className="w-3 h-3" />
                  </Button>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsRepeat(!isRepeat)}
                    className={`rounded-full ${
                      isRepeat ? "" : "text-muted-foreground"
                    }`}
                    style={{ color: isRepeat ? primaryColor : undefined }}
                  >
                    <Repeat className="w-3 h-3" />
                  </Button>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onVolumeChange(volume === 0 ? 0.7 : 0)}
                    className="text-muted-foreground hover:text-foreground rounded-full"
                  >
                    {volume === 0 ? (
                      <VolumeX className="w-3 h-3" />
                    ) : (
                      <Volume2 className="w-3 h-3" />
                    )}
                  </Button>
                </motion.div>
              </div>
              <div className="w-full">
                <Slider
                  value={[volume * 100]}
                  onValueChange={(value) => onVolumeChange(value[0] / 100)}
                  max={100}
                  step={1}
                  className="cursor-pointer"
                  style={{
                    background: `linear-gradient(90deg, ${primaryColor}, ${primaryColor}80)`,
                  }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );

  if (!currentTrack) {
    return (
      <>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="fixed bottom-4 right-4 sm:hidden z-50"
        >
          <Button
            onClick={() => setShowDialog(true)}
            className="w-12 h-12 rounded-full shadow-md"
            style={{ backgroundColor: primaryColor }}
          >
            <Music className="w-6 h-6 text-white" />
          </Button>
        </motion.div>
        <AnimatePresence>
          {showDialog && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/95 backdrop-blur-lg z-50 flex flex-col"
            >
              <div className="flex justify-end p-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowDialog(false)}
                  className="text-foreground"
                >
                  <X className="w-6 h-6" />
                </Button>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <div className="w-full max-w-md mx-auto">
                  {renderPlayerContent(true)}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  return (
    <>
      <Drawer>
        <DrawerTrigger className="fixed bottom-10 right-4 sm:hidden z-10">
          <div
            className="w-12 h-12 rounded-full shadow-md"
            style={{ backgroundColor: primaryColor }}
          >
            <Music
              className={`${
                isPlaying ? "animate-spin duration-[10s,35s]" : ""
              } w-6 h-6 text-white`}
            />
          </div>
        </DrawerTrigger>
        <DrawerContent>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-background/95 backdrop-blur-lg flex flex-col"
          >
            <div className="flex-1 flex items-center justify-center">
              <div className="w-full max-w-md mx-auto pb-6">
                {renderPlayerContent(true)}
              </div>
            </div>
          </motion.div>
        </DrawerContent>
      </Drawer>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed bottom-2 left-2 right-2 mx-auto max-w-md sm:max-w-7xl hidden sm:block"
      >
        {renderPlayerContent()}
      </motion.div>
    </>
  );
};

export default EnhancedPlayerControls;
