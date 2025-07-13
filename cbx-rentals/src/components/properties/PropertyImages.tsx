import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';
import { propertyImageData } from '../../data/propertyImages';
import { PropertyVideo } from './PropertyVideo';

interface PropertyImagesProps {
  propertyId: string;
  propertyName: string;
  listingUrl?: string;
}

export function PropertyImages({ propertyId, propertyName, listingUrl }: PropertyImagesProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Get property images from our curated data
  const propertyData = propertyImageData[propertyName as keyof typeof propertyImageData];
  const images = propertyData?.images || [];
  const vrboUrl = propertyData?.vrboUrl || listingUrl;
  const videoId = propertyData?.youtubeVideoId;
  
  // Debug logging
  console.log('PropertyImages Debug:', { propertyName, hasPropertyData: !!propertyData, imageCount: images.length, videoId });

  const handlePrevious = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  if (images.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-lg bg-gray-200">
        <div className="w-full h-64 flex items-center justify-center text-gray-500">
          No images available
        </div>
      </div>
    );
  }

  const currentImage = images[currentImageIndex];

  return (
    <div className="space-y-4">
      {/* Video Section - Only show if we have a video ID */}
      {videoId && videoId.length > 0 && (
        <PropertyVideo 
          propertyName={propertyName} 
          videoId={videoId}
        />
      )}
      
      {/* Images Section */}
      <div className="relative overflow-hidden rounded-lg">
        <img
          src={currentImage.url}
          alt={currentImage.caption || `${propertyName} - Image ${currentImageIndex + 1}`}
          className="w-full h-64 lg:h-80 object-cover"
        />
      
      {images.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
            onClick={handlePrevious}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
            onClick={handleNext}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </>
      )}

      {/* Image caption and VRBO link overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
        <div className="flex items-end justify-between">
          <p className="text-white text-sm font-medium">{currentImage.caption}</p>
          {vrboUrl && (
            <a
              href={vrboUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white text-xs hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              View on VRBO →
            </a>
          )}
        </div>
      </div>

      {/* Dot indicators */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
        {images.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentImageIndex ? 'bg-white' : 'bg-white/50'
            }`}
            onClick={() => setCurrentImageIndex(index)}
          />
        ))}
      </div>
    </div>
    </div>
  );
}