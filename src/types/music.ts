
export interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration?: number;
  url: string;
  coverArt?: string;
  source: 'local' | 'api';
}

export interface ApiTrack {
  id: string;
  name: string;
  artist_name: string;
  album_name?: string;
  duration?: number;
  audio: string;
  image?: string;
}
