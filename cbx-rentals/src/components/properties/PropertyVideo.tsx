import { useState } from 'react';
import { Play, X } from 'lucide-react';
import { Button } from '../ui/button';

interface PropertyVideoProps {
  propertyName: string;
  videoId?: string;
  thumbnailUrl?: string;
}

// Map property names to YouTube video IDs
const propertyVideos: Record<string, string> = {
  'House 1': 'f0uESr61H8A',
  'House 2': 'vfeg0OFc9gs',
  'House 3': 'Qwo9aq8q90U',
  'House 4': 'mzPQJxp-oEE',
};

export function PropertyVideo({ propertyName, videoId, thumbnailUrl }: PropertyVideoProps) {
  const [showVideo, setShowVideo] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);
  
  // Get video ID from props or from the mapping
  const youtubeVideoId = videoId || propertyVideos[propertyName];
  
  if (!youtubeVideoId) {
    return null;
  }

  // Generate thumbnail URL if not provided
  // Use hqdefault as it's more reliable than maxresdefault
  const videoThumbnail = thumbnailUrl || `https://img.youtube.com/vi/${youtubeVideoId}/hqdefault.jpg`;
  
  // Fallback thumbnail if YouTube thumbnail fails
  const fallbackThumbnail = `https://img.youtube.com/vi/${youtubeVideoId}/0.jpg`;

  return (
    <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
      {!showVideo ? (
        <>
          <img
            src={thumbnailError ? fallbackThumbnail : videoThumbnail}
            alt={`${propertyName} video thumbnail`}
            className="w-full h-full object-cover"
            onError={() => setThumbnailError(true)}
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <Button
              onClick={() => setShowVideo(true)}
              className="bg-[#e50914] hover:bg-[#b90710] text-white rounded-full p-4"
            >
              <Play className="h-8 w-8 ml-1" fill="white" />
            </Button>
          </div>
          <div className="absolute bottom-4 left-4 text-white">
            <p className="text-sm font-medium">Virtual Tour</p>
            <p className="text-xs text-gray-300">Click to play video</p>
          </div>
        </>
      ) : (
        <>
          <iframe
            src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1&rel=0`}
            title={`${propertyName} virtual tour`}
            className="w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
          <Button
            onClick={() => setShowVideo(false)}
            className="absolute top-4 right-4 bg-black/70 hover:bg-black text-white rounded-full p-2"
          >
            <X className="h-4 w-4" />
          </Button>
        </>
      )}
    </div>
  );
}