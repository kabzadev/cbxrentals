import { useNavigate } from 'react-router-dom';
import { PropertyCard } from './PropertyCard';
import { Skeleton } from '../ui/skeleton';
import { Card, CardContent } from '../ui/card';
import { useProperties } from '../../hooks/useProperties';
import type { PropertyWithBookings } from '../../hooks/useProperties';
import { AlertCircleIcon } from 'lucide-react';

export function PropertyList() {
  const navigate = useNavigate();
  const { properties, loading, error } = useProperties();

  const handlePropertyClick = (property: PropertyWithBookings) => {
    navigate(`/properties/${property.id}`);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-5 w-20" />
              </div>
              <Skeleton className="h-40 w-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-2 w-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <AlertCircleIcon className="h-12 w-12 text-destructive" />
            <div>
              <h3 className="text-lg font-semibold">Error loading properties</h3>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (properties.length === 0) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold">No properties found</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Add some properties to get started.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {properties.map((property) => (
          <PropertyCard
            key={property.id}
            property={property}
            currentOccupancy={property.currentOccupancy}
            onClick={() => handlePropertyClick(property)}
          />
        ))}
      </div>
    </>
  );
}