import { useCallback, useState } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { MapPin, Home, Users } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';

// House data with coordinates
type House = {
  id: number;
  name: string;
  address: string;
  coordinates: { lat: number; lng: number };
  bedrooms: number;
  bathrooms: number;
  maxOccupancy: number;
  color: string;
  isSpecialLocation?: boolean;
};

const houses: House[] = [
  {
    id: 1,
    name: 'House 1',
    address: '1724 S Pacific St, Oceanside, CA',
    coordinates: { lat: 33.1742249, lng: -117.3660633 },
    bedrooms: 6,
    bathrooms: 5,
    maxOccupancy: 8,
    color: '#FF6B6B'
  },
  {
    id: 2,
    name: 'House 2',
    address: '1722 S Pacific St, Oceanside, CA',
    coordinates: { lat: 33.1742249, lng: -117.3660633 },
    bedrooms: 6,
    bathrooms: 5,
    maxOccupancy: 8,
    color: '#4ECDC4'
  },
  {
    id: 3,
    name: 'House 3',
    address: '828 S Pacific St, Oceanside, CA',
    coordinates: { lat: 33.1851918, lng: -117.3761301 },
    bedrooms: 4,
    bathrooms: 5,
    maxOccupancy: 8,
    color: '#FFE66D'
  },
  {
    id: 4,
    name: 'House 4',
    address: '923 S Pacific St, Oceanside, CA',
    coordinates: { lat: 33.1843626, lng: -117.3754596 },
    bedrooms: 3,
    bathrooms: 2,
    maxOccupancy: 4,
    color: '#95E1D3'
  },
  {
    id: 5,
    name: 'Coach Clark',
    address: '1440 Rock Springs Rd, Escondido, CA 92026',
    coordinates: { lat: 33.1586, lng: -117.0986 },
    bedrooms: 0,
    bathrooms: 0,
    maxOccupancy: 0,
    color: '#9B59B6',
    isSpecialLocation: true
  },
  {
    id: 6,
    name: 'Torrey Pines State Park',
    address: '12600 N Torrey Pines Rd, La Jolla, CA 92037',
    coordinates: { lat: 32.9262, lng: -117.2564 },
    bedrooms: 0,
    bathrooms: 0,
    maxOccupancy: 0,
    color: '#27AE60',
    isSpecialLocation: true
  },
  {
    id: 7,
    name: 'Beach Break Cafe',
    address: '1802 S Coast Hwy, Oceanside, CA 92054',
    coordinates: { lat: 33.1750806, lng: -117.3618917 },
    bedrooms: 0,
    bathrooms: 0,
    maxOccupancy: 0,
    color: '#F39C12',
    isSpecialLocation: true
  },
  {
    id: 8,
    name: 'Top Gun House',
    address: '250 N Pacific St, Oceanside, CA 92054',
    coordinates: { lat: 33.1945943, lng: -117.3832251 },
    bedrooms: 0,
    bathrooms: 0,
    maxOccupancy: 0,
    color: '#3498DB',
    isSpecialLocation: true
  }
];

const mapContainerStyle = {
  width: '100%',
  height: '600px'
};

// Center the map around the houses on South Pacific Street
const center = {
  lat: 33.1793,
  lng: -117.3707
};

const options = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: true,
  mapTypeControl: true,
  fullscreenControl: true,
};

// Create a custom marker icon
const createMarkerIcon = (color: string): any => ({
  url: `data:image/svg+xml,${encodeURIComponent(
    `<svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="18" fill="${color}" stroke="#000" stroke-width="2" opacity="0.9"/>
    </svg>`
  )}`,
  scaledSize: { width: 24, height: 24 },
  anchor: { x: 12, y: 12 },
});

export function MapPage() {
  const [selectedHouse, setSelectedHouse] = useState<typeof houses[0] | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const onLoad = useCallback((map: google.maps.Map) => {
    // Fit all markers on the map
    const bounds = new window.google.maps.LatLngBounds();
    houses.forEach(house => {
      bounds.extend(house.coordinates);
    });
    map.fitBounds(bounds);
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // For now, use a placeholder API key message
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  if (!googleMapsApiKey) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-6 w-6" />
              CBX Rentals House Map
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 mb-4">Google Maps API key not configured.</p>
              <p className="text-sm text-gray-500">To enable the interactive map, add VITE_GOOGLE_MAPS_API_KEY to your environment variables.</p>
            </div>
            
            {/* Show house list as fallback */}
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {houses.map((house) => (
                <Card key={house.id} className="border-2 bg-gray-50" style={{ borderColor: house.color }}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-900">
                      <Home className="h-5 w-5" style={{ color: house.color }} />
                      {house.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-gray-700">
                      <MapPin className="inline h-4 w-4 mr-1" />
                      {house.address}
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(house.address)}`, '_blank')}
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      Get Directions
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-6 w-6" />
            CBX Rentals House Map
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <LoadScript googleMapsApiKey={googleMapsApiKey}>
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={center}
              zoom={15}
              onLoad={onLoad}
              onUnmount={onUnmount}
              options={options}
            >
              {houses.map((house) => (
                <Marker
                  key={house.id}
                  position={house.coordinates}
                  onClick={() => setSelectedHouse(house)}
                  icon={createMarkerIcon(house.color)}
                />
              ))}

              {selectedHouse && (
                <InfoWindow
                  position={selectedHouse.coordinates}
                  onCloseClick={() => setSelectedHouse(null)}
                >
                  <div className="p-2 min-w-[200px]">
                    <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                      <Home className="h-5 w-5" style={{ color: selectedHouse.color }} />
                      {selectedHouse.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">{selectedHouse.address}</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(selectedHouse.address)}`, '_blank')}
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      Get Directions
                    </Button>
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
          </LoadScript>

          {/* House list below map */}
          <div className="p-6 border-t bg-gray-50">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">All Locations</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {houses.map((house) => (
                <div
                  key={house.id}
                  className="p-4 bg-white border rounded-lg cursor-pointer hover:shadow-md transition-shadow"
                  style={{ borderColor: house.color, borderWidth: '2px' }}
                  onClick={() => {
                    setSelectedHouse(house);
                    map?.panTo(house.coordinates);
                    map?.setZoom(16);
                  }}
                >
                  <h4 className="font-semibold flex items-center gap-2 text-gray-900">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: house.color }}
                    />
                    {house.name}
                  </h4>
                  <p className="text-sm text-gray-700 mt-1">{house.address}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-3"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(house.address)}`, '_blank');
                    }}
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Get Directions
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}