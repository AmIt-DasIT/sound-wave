import React from 'react';
import { motion } from 'framer-motion';
import { HardDrive, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import ColorPicker from './ColorPicker';

interface HeaderProps {
  onLoadFolder: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLoadFolder }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.header
      className="border-b bg-background/55 backdrop-blur supports-[backdrop-filter]:bg-background/20 sticky top-0 z-50"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
    >
      <div className="container mx-auto px-2 sm:px-4 h-16 flex items-center justify-between">
        <motion.div
          className="flex items-center space-x-2 sm:space-x-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.h1
            className="text-2xl font-extrabold bg-gradient-to-r from-primary to-primary/75 bg-clip-text text-transparent"
            whileHover={{ scale: 1.05 }}
          >
            SoundWave
          </motion.h1>
        </motion.div>

        <motion.div
          className="flex items-center space-x-2 sm:space-x-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <ColorPicker />

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={onLoadFolder}
              variant="link"
              size="sm"
              className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
            >
              <HardDrive className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Load Music Folder</span>
              <span className="sm:hidden">Load</span>
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={toggleTheme}
              variant="ghost"
              size="icon"
              className="rounded-full w-8 h-8 sm:w-10 sm:h-10"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <Moon className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </motion.header>
  );
};

export default Header;