
import React from 'react';
import { motion } from 'framer-motion';
import { useColor } from '@/contexts/ColorContext';
import { Palette } from 'lucide-react';

const ColorPicker = () => {
  const { primaryColor, setPrimaryColor } = useColor();
  
  const colors = [
    '#8B5CF6', '#EC4899', '#10B981', '#F59E0B',
    '#EF4444', '#3B82F6', '#8B5A2B', '#059669',
    '#6366F1', '#F97316', '#84CC16', '#06B6D4'
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-2"
    >
      <Palette className="w-4 h-4 text-muted-foreground" />
      <div className="flex gap-1">
        {colors.map((color) => (
          <motion.button
            key={color}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setPrimaryColor(color)}
            className={`w-6 h-6 rounded-full border-2 transition-all ${
              primaryColor === color 
                ? 'border-white shadow-lg scale-110' 
                : 'border-transparent hover:border-white/50'
            }`}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default ColorPicker;
