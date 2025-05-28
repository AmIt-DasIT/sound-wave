import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ColorProvider } from "@/contexts/ColorContext";
import MusicPlayer from "./pages/MusicPlayer";
import "./App.css";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <ColorProvider>
        <BrowserRouter>
          <div className="min-h-screen">
            <Routes>
              <Route path="/" element={<MusicPlayer />} />
            </Routes>
          </div>
        </BrowserRouter>
      </ColorProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
