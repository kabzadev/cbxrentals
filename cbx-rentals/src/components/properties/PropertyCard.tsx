import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { HomeIcon, UsersIcon, DollarSignIcon } from 'lucide-react';
import type { Database } from '../../types/database';

type Property = Database['public']['Tables']['properties']['Row'];

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
      className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold line-clamp-1">
            {property.name}
          </CardTitle>
          <Badge variant={isFull ? "destructive" : "success"}>
            {isFull ? "Full" : "Available"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Placeholder Image */}
        <div className="w-full h-40 bg-gray-200 rounded-md flex items-center justify-center">
          <HomeIcon className="h-12 w-12 text-gray-400" />
        </div>

        {/* Property Details */}
        <div className="space-y-2">
          <p className="text-sm text-gray-600 line-clamp-2">
            {property.address}
          </p>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1">
              <UsersIcon className="h-4 w-4 text-gray-500" />
              <span className="font-medium">
                {currentOccupancy}/{property.max_occupancy} guests
              </span>
            </div>
            <div className="flex items-center gap-1">
              <DollarSignIcon className="h-4 w-4 text-gray-500" />
              <span className="font-medium">
                ${property.price_per_night}/night
              </span>
            </div>
          </div>

          {/* Occupancy Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                isFull ? 'bg-red-500' : occupancyRate > 75 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${occupancyRate}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}