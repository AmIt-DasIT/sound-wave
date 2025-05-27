import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Music, Globe } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useColor } from "@/contexts/ColorContext";

interface EnhancedSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onJamendoSearch: () => void;
  isSearching: boolean;
}

const EnhancedSearch: React.FC<EnhancedSearchProps> = ({
  searchQuery,
  onSearchChange,
  onJamendoSearch,
  isSearching,
}) => {
  const { primaryColor } = useColor();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <motion.div
      className="relative w-full max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
        <Input
          placeholder="Search local music or find new tracks online..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyPress={(e) =>
            e.key === "Enter" && searchQuery.trim() && onJamendoSearch()
          }
          className={`pl-12 pr-20 h-14 bg-background/50 backdrop-blur-sm border-2 rounded-full transition-all duration-300 ${
            isFocused
              ? "border-opacity-100 shadow-lg"
              : "border-muted-foreground/20"
          }`}
          style={{
            borderColor: isFocused ? primaryColor : undefined,
          }}
        />

        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          <AnimatePresence>
            {searchQuery && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onSearchChange("")}
                  className="h-8 w-8 rounded-full hover:bg-muted"
                >
                  <X className="w-4 h-4" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {searchQuery.trim() && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Button
                onClick={onJamendoSearch}
                disabled={isSearching}
                size="sm"
                className="h-10 px-4 rounded-full text-white"
                style={{ backgroundColor: primaryColor }}
              >
                {isSearching ? (
                  <Music className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Globe className="w-4 h-4 mr-1" />
                    Search Online
                  </>
                )}
              </Button>
            </motion.div>
          )}
        </div>
      </div>

      <motion.div
        className="mt-2 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <p className="text-sm text-muted-foreground">
          Search your local library or discover new music from Jamendo
        </p>
      </motion.div>
    </motion.div>
  );
};

export default EnhancedSearch;
