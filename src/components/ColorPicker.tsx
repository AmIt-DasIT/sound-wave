import { motion } from "framer-motion";
import { useColor } from "@/contexts/ColorContext";
import { Palette } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ColorPicker = () => {
  const { primaryColor, setPrimaryColor } = useColor();

  const colors = [
    "#8B5CF6",
    "#EC4899",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#3B82F6",
    "#8B5A2B",
    "#059669",
    "#6366F1",
    "#F97316",
    "#84CC16",
    "#06B6D4",
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-muted-foreground/20 hover:bg-muted/50 transition-colors"
            aria-label="Open color picker"
          >
            <Palette className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
          </motion.button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="p-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
          align="end"
        >
          <div className="grid grid-cols-4 gap-1 sm:gap-2 max-w-[200px] sm:max-w-[240px]">
            {colors.map((color) => (
              <DropdownMenuItem key={color} asChild>
                <motion.button
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setPrimaryColor(color)}
                  className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 transition-all ${
                    primaryColor === color
                      ? "border-white shadow-lg scale-110"
                      : "border-transparent hover:border-white/50"
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={`Select color ${color}`}
                />
              </DropdownMenuItem>
            ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </motion.div>
  );
};

export default ColorPicker;
