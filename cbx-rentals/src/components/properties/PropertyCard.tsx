import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { UsersIcon, BedDouble, Bath, ExternalLink, Play } from 'lucide-react';
import { propertyImageData } from '../../data/propertyImages';
import type { Database } from '../../types/database';

type Property = Database['public']['Tables']['properties']['Row'] & {
  bedrooms?: number;
  bathrooms?: number;
  sleeps?: number;
  property_type?: string;
};

interface PropertyCardProps {
  property: Property;
  currentOccupancy: number;
  onClick: () => void;
}

export function PropertyCard({ property, currentOccupancy, onClick }: PropertyCardProps) {
  const occupancyRate = (currentOccupancy / property.max_occupancy) * 100;
  const isFull = currentOccupancy >= property.max_occupancy;

  return (
    <Card 
      className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] bg-white border-gray-200"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-semibold">
              {property.name}
            </CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              VRBO #{property.listing_url?.split('/').pop()?.split('?')[0] || ''}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Property Thumbnail */}
        <div className="relative overflow-hidden rounded-lg">
          {propertyImageData[property.name as keyof typeof propertyImageData]?.images?.[0] ? (
            <>
              <img
                src={propertyImageData[property.name as keyof typeof propertyImageData].images[0].url}
                alt={property.name}
                className="w-full h-48 object-cover"
              />
              {propertyImageData[property.name as keyof typeof propertyImageData]?.youtubeVideoId && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="bg-[#e50914] rounded-full p-3">
                    <Play className="h-6 w-6 text-white fill-white" />
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500">No image available</span>
            </div>
          )}
        </div>

        {/* Property Details */}
        <div className="space-y-3">
          <p className="text-sm text-gray-600 line-clamp-2">
            {property.address}
          </p>

          {/* Room Details */}
          <div className="flex items-center gap-4 text-sm text-gray-600">
            {property.bedrooms && (
              <div className="flex items-center gap-1">
                <BedDouble className="h-4 w-4" />
                <span>{property.bedrooms} BR</span>
              </div>
            )}
            {property.bathrooms && (
              <div className="flex items-center gap-1">
                <Bath className="h-4 w-4" />
                <span>{property.bathrooms} BA</span>
              </div>
            )}
            {property.sleeps && (
              <div className="flex items-center gap-1">
                <UsersIcon className="h-4 w-4" />
                <span>Sleeps {property.sleeps}</span>
              </div>
            )}
          </div>


          {/* VRBO Link */}
          {property.listing_url && (
            <a
              href={property.listing_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              View on VRBO
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}